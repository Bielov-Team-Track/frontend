"use client";

import { MESSAGES_API_URL } from "@/lib/constants";
import { Chat, ChatParticipant, Message, MessageReaction, Attachment, MessageEmbed } from "@/lib/models/Messages";
import { CursorPagedResult } from "@/lib/models/Pagination";
import { useChatConnectionStore } from "@/lib/realtime/chatsConnectionStore";
import { getOptimisticIdForServerId, deleteOptimisticMapping } from "@/lib/realtime/optimisticMessages";
import signalr from "@/lib/realtime/signalrClient";
import { useAccessToken, useAuth } from "@/providers";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";

type ChatsInfiniteData = InfiniteData<CursorPagedResult<Chat>>;
type MessagesInfiniteData = InfiniteData<Message[]>;

export function useRealtimeChats() {
	const { setConnection, setConnectionStatus, setUserTyping, setUserOnline } = useChatConnectionStore();
	const token = useAccessToken();
	const { userProfile } = useAuth();
	const currentUserId = userProfile?.id;
	const queryClient = useQueryClient();
	const connectionRef = useRef<HubConnection | null>(null);

	const handleConnectionError = useCallback(
		(error?: Error) => {
			console.error("SignalR chat connection error:", error);
			setConnectionStatus("disconnected");
		},
		[setConnectionStatus],
	);

	// Helper to update messages across infinite pages
	const updateMessagesInCache = useCallback(
		(updater: (messages: Message[]) => Message[]) => {
			queryClient.setQueriesData<MessagesInfiniteData>({ queryKey: ["messages"] }, (oldData) => {
				if (!oldData?.pages) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => updater(page)),
				};
			});
		},
		[queryClient],
	);

	// Helper to update chats across infinite pages
	const updateChatsInCache = useCallback(
		(updater: (chats: Chat[]) => Chat[]) => {
			queryClient.setQueriesData<ChatsInfiniteData>({ queryKey: ["chats"] }, (oldData) => {
				if (!oldData?.pages) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						items: updater(page.items),
					})),
				};
			});
		},
		[queryClient],
	);

	const addReaction = useCallback(
		(messageReaction: MessageReaction) => {
			updateMessagesInCache((messages) => {
				const message = messages.find((msg) => msg.id === messageReaction.messageId);
				if (!message) return messages;

				const reactions = message.reactions || [];
				const existingReaction = reactions.find((r) => r.emoji === messageReaction.emoji);
				let updatedReactions;
				if (existingReaction) {
					if (existingReaction.userIds.includes(messageReaction.userId)) return messages;
					updatedReactions = reactions.map((r) =>
						r.emoji === messageReaction.emoji ? { ...r, userIds: [...r.userIds, messageReaction.userId] } : r,
					);
				} else {
					updatedReactions = [...reactions, { emoji: messageReaction.emoji, userIds: [messageReaction.userId] }];
				}
				return messages.map((msg) => (msg.id === messageReaction.messageId ? { ...msg, reactions: updatedReactions } : msg));
			});
		},
		[updateMessagesInCache],
	);

	// Update reactions in React Query cache
	const removeReaction = useCallback(
		(messageReaction: MessageReaction) => {
			updateMessagesInCache((messages) => {
				const message = messages.find((msg) => msg.id === messageReaction.messageId);
				if (!message) return messages;

				const reactions = message.reactions || [];
				const existingReaction = reactions.find((r) => r.emoji === messageReaction.emoji);
				if (!existingReaction) return messages;

				const newUserIds = existingReaction.userIds.filter((id) => id !== messageReaction.userId);
				let updatedReactions;
				if (newUserIds.length === 0) {
					updatedReactions = reactions.filter((r) => r.emoji !== messageReaction.emoji);
				} else {
					updatedReactions = reactions.map((r) => (r.emoji === messageReaction.emoji ? { ...r, userIds: newUserIds } : r));
				}

				return messages.map((msg) => (msg.id === messageReaction.messageId ? { ...msg, reactions: updatedReactions } : msg));
			});
		},
		[updateMessagesInCache],
	);

	// Update message content when edited
	const applyMessageEdited = useCallback(
		(chatId: string, messageId: string, content: string, editedAt: Date, attachments?: Attachment[]) => {
			queryClient.setQueryData<MessagesInfiniteData>(["messages", chatId], (oldData) => {
				if (!oldData?.pages) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) =>
						page.map((msg) =>
							msg.id === messageId
								? { ...msg, content, isEdited: true, editedAt, ...(attachments && { attachments }) }
								: msg
						),
					),
				};
			});

			updateChatsInCache((chats) =>
				chats.map((chat) =>
					chat.lastMessage?.id === messageId
						? { ...chat, lastMessage: { ...chat.lastMessage, content, isEdited: true, editedAt } }
						: chat,
				),
			);
		},
		[queryClient, updateChatsInCache],
	);

	// Remove message when deleted
	const applyMessageDeleted = useCallback(
		(chatId: string, messageId: string) => {
			queryClient.setQueryData<MessagesInfiniteData>(["messages", chatId], (oldData) => {
				if (!oldData?.pages) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) =>
						page.map((msg) =>
							msg.id === messageId ? { ...msg, isDeleted: true, content: "" } : msg
						),
					),
				};
			});

			updateChatsInCache((chats) =>
				chats.map((chat) =>
					chat.lastMessage?.id === messageId
						? { ...chat, lastMessage: { ...chat.lastMessage, isDeleted: true, content: "" } }
						: chat,
				),
			);
		},
		[queryClient, updateChatsInCache],
	);

	// Restore a deleted message
	const applyMessageRestored = useCallback(
		(chatId: string, messageId: string, content: string, attachments?: Attachment[], embeds?: MessageEmbed[]) => {
			queryClient.setQueryData<MessagesInfiniteData>(["messages", chatId], (oldData) => {
				if (!oldData?.pages) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) =>
						page.map((msg) =>
							msg.id === messageId
								? { ...msg, isDeleted: false, content, attachments: attachments ?? [], embeds: embeds ?? [] }
								: msg
						),
					),
				};
			});

			updateChatsInCache((chats) =>
				chats.map((chat) =>
					chat.lastMessage?.id === messageId
						? { ...chat, lastMessage: { ...chat.lastMessage, content, isDeleted: false } }
						: chat,
				),
			);
		},
		[queryClient, updateChatsInCache],
	);

	// Add participant to chat
	const applyParticipantJoined = useCallback(
		(chatId: string, participant: ChatParticipant) => {
			updateChatsInCache((chats) =>
				chats.map((chat) => {
					if (chat.id !== chatId) return chat;
					if (chat.participants.some((p) => p.userId === participant.userId)) return chat;
					return {
						...chat,
						participants: [...chat.participants, participant],
					};
				}),
			);
		},
		[updateChatsInCache],
	);

	// Remove participant from chat
	const applyParticipantLeft = useCallback(
		(chatId: string, userId: string) => {
			updateChatsInCache((chats) =>
				chats.map((chat) => {
					if (chat.id !== chatId) return chat;
					return {
						...chat,
						participants: chat.participants.filter((p) => p.userId !== userId),
					};
				}),
			);
		},
		[updateChatsInCache],
	);

	// Remove chat from list
	const removeChat = useCallback(
		(chatId: string) => {
			updateChatsInCache((chats) => chats.filter((chat) => chat.id !== chatId));
			queryClient.removeQueries({ queryKey: ["messages", chatId] });
		},
		[queryClient, updateChatsInCache],
	);

	useEffect(() => {
		if (!token) {
			setConnectionStatus("disconnected");
			return;
		}

		let stopped = false;

		const start = async () => {
			try {
				setConnectionStatus("connecting");
				const connection = await signalr.start(
					{
						baseUrl: MESSAGES_API_URL,
						hub: "messaging",
						token,
					},
					{
						onReconnected: () => {
							setConnectionStatus("connected");
						},
						onClose: handleConnectionError,
					},
				);

				connectionRef.current = connection;
				setConnection(connection);

				// New message received
				connection.on("ReceiveMessage", (message: Message) => {
					if (!message.chatId) return;
					// Normalize: server may omit reactions/attachments/embeds arrays
					message.reactions = message.reactions || [];
					message.attachments = message.attachments || [];
					message.embeds = message.embeds || [];

					// Update messages cache — with optimistic dedup support
					queryClient.setQueryData<MessagesInfiniteData>(["messages", message.chatId], (oldData) => {
						if (!oldData?.pages) return oldData;

						// Check all pages for ID-based dedup
						const messageExists = oldData.pages.some((page) => page.some((m) => m.id === message.id && !m._optimisticId));
						if (messageExists) return oldData;

						// Check if this real message matches an optimistic message via mapping
						const optimisticId = getOptimisticIdForServerId(message.id);
						if (optimisticId) {
							// Replace optimistic message with the real one
							deleteOptimisticMapping(optimisticId);
							return {
								...oldData,
								pages: oldData.pages.map((page) =>
									page.map((m) => (m._optimisticId === optimisticId ? message : m)),
								),
							};
						}

						// Normal insert — prepend to first page
						const firstPage = oldData.pages[0];
						return {
							...oldData,
							pages: [[message, ...firstPage], ...oldData.pages.slice(1)],
						};
					});

					// Update chats cache with new lastMessage
					const isOwnMessage = message.sender?.id === currentUserId;

					// Only increment unread for non-own messages when the chat is NOT actively open.
					// The viewport read tracker handles marking as read when visible.
					const currentChatId = useChatConnectionStore.getState().currentChatId;
					const shouldIncrementUnread = !isOwnMessage && message.chatId !== currentChatId;

					queryClient.setQueriesData<ChatsInfiniteData>({ queryKey: ["chats"] }, (oldData) => {
						if (!oldData?.pages) return oldData;

						const chatExists = oldData.pages.some((page) => page.items.some((c) => c.id === message.chatId));
						if (!chatExists) {
							queryClient.invalidateQueries({ queryKey: ["chats"] });
							return oldData;
						}

						return {
							...oldData,
							pages: oldData.pages.map((page) => ({
								...page,
								items: page.items.map((chat) =>
									chat.id === message.chatId
										? { ...chat, lastMessage: message, unreadCount: shouldIncrementUnread ? chat.unreadCount + 1 : chat.unreadCount }
										: chat,
								),
							})),
						};
					});

					// Update global unread count
					if (shouldIncrementUnread) {
						queryClient.setQueryData<number>(["unread-message-count"], (old) => (old ?? 0) + 1);
					}

					// Clear typing indicator for sender
					setUserTyping(message.chatId, message.sender.id, false);
				});

				// User read messages - updated to handle lastReadMessageId in payload
				connection.on("UserRead", (payload: { userId: string; chatId: string; readAt: string; lastReadMessageId?: string }) => {
					// Update the participant's lastReadMessageId in the cached chat data
					updateChatsInCache((chats) =>
						chats.map((chat) => {
							if (chat.id !== payload.chatId) return chat;

							const updatedParticipants = chat.participants.map((p) =>
								p.userId === payload.userId && payload.lastReadMessageId
									? { ...p, lastReadMessageId: payload.lastReadMessageId, lastReadAt: new Date(payload.readAt) }
									: p,
							);

							// If the current user read, decrement global unread count and reset chat's count
							if (payload.userId === currentUserId && chat.unreadCount > 0) {
								queryClient.setQueryData<number>(["unread-message-count"], (old) =>
									Math.max(0, (old ?? 0) - chat.unreadCount)
								);
								return { ...chat, participants: updatedParticipants, unreadCount: 0 };
							}

							return { ...chat, participants: updatedParticipants };
						}),
					);
				});

				// Typing indicators
				connection.on("UserTyping", (payload: { userId: string; chatId: string }) => {
					setUserTyping(payload.chatId, payload.userId, true);
				});

				connection.on("UserStoppedTyping", (payload: { userId: string; chatId: string }) => {
					setUserTyping(payload.chatId, payload.userId, false);
				});

				// Connection confirmed
				connection.on("Connected", (payload: { connectionId: string; userId: string }) => {
					setConnectionStatus("connected");
				});

				// User online status
				connection.on("UserOnline", (payload: { userId: string }) => {
					setUserOnline(payload.userId, true);
				});

				connection.on("UserOffline", (payload: { userId: string }) => {
					setUserOnline(payload.userId, false);
				});

				// Reactions
				connection.on("ReactionAdded", (messageReaction: MessageReaction) => {
					addReaction(messageReaction);
				});

				connection.on("ReactionRemoved", (messageReaction: MessageReaction) => {
					removeReaction(messageReaction);
				});

				// Message edits and deletes
				connection.on("MessageEdited", ({ chatId, messageId, content, editedAt, attachments }) => {
					applyMessageEdited(chatId, messageId, content, new Date(editedAt), attachments);
				});

				connection.on("MessageDeleted", ({ messageId, chatId }) => {
					applyMessageDeleted(chatId, messageId);
				});

				connection.on("MessageRestored", ({ chatId, messageId, content, attachments, embeds }) => {
					applyMessageRestored(chatId, messageId, content, attachments, embeds);
				});

				// Participant changes
				connection.on("ParticipantJoined", ({ chatId, participant }) => {
					applyParticipantJoined(chatId, participant);
				});

				connection.on("ParticipantLeft", ({ chatId, userId }) => {
					applyParticipantLeft(chatId, userId);
				});

				// Removed from chat
				connection.on("RemovedFromChat", ({ chatId, chatTitle }: { chatId: string; chatTitle: string }) => {
					toast.info(`You were removed from ${chatTitle}`);
					removeChat(chatId);
				});

				// Hub errors
				connection.on("Error", (payload: { message: string }) => {
					console.error("Hub error:", payload.message);
				});

				connection.on("ChatCreated", (chat: Chat) => {
					// Invalidate chats to fetch the new chat
					queryClient.invalidateQueries({ queryKey: ["chats"] });
				});

				connection.on("ChatDeleted", (chat: Chat) => {
					// Invalidate chats to fetch the new chat
					queryClient.invalidateQueries({ queryKey: ["chats"] });
				});

				connection.on("ChatUpdated", (chat: Chat) => {
					// When the updated chat is the one actively open, preserve the local unreadCount
					// (the server doesn't know the user is viewing the chat, so it returns unreadCount > 0).
					const activeChatId = useChatConnectionStore.getState().currentChatId;

					if (activeChatId && chat.id === activeChatId) {
						// For the active chat, update metadata from server but keep unreadCount at 0
						queryClient.setQueriesData<ChatsInfiniteData>({ queryKey: ["chats"] }, (oldData) => {
							if (!oldData?.pages) return oldData;
							return {
								...oldData,
								pages: oldData.pages.map((page) => ({
									...page,
									items: page.items.map((c) =>
										c.id === activeChatId ? { ...c, ...chat, unreadCount: 0 } : c,
									),
								})),
							};
						});
					} else {
						// For non-active chats, refetch from server as usual
						queryClient.invalidateQueries({ queryKey: ["chats"] });
					}
				});

				// Connection state handlers
				connection.onreconnecting(() => {
					setConnectionStatus("reconnecting");
				});
			} catch (error) {
				handleConnectionError(error as Error);
			}
		};

		start();

		return () => {
			const connection = connectionRef.current;
			if (!stopped && connection?.state !== HubConnectionState.Disconnected) {
				// Remove all listeners
				connection?.off("ReceiveMessage");
				connection?.off("UserRead");
				connection?.off("UserTyping");
				connection?.off("UserStoppedTyping");
				connection?.off("Connected");
				connection?.off("UserOnline");
				connection?.off("UserOffline");
				connection?.off("ReactionAdded");
				connection?.off("ReactionRemoved");
				connection?.off("MessageEdited");
				connection?.off("MessageDeleted");
				connection?.off("MessageRestored");
				connection?.off("ParticipantJoined");
				connection?.off("ParticipantLeft");
				connection?.off("RemovedFromChat");
				connection?.off("Error");

				signalr.stop(MESSAGES_API_URL, "messaging");
				stopped = true;
			}
			setConnection(null);
		};
	}, [
		token,
		queryClient,
		setConnection,
		setConnectionStatus,
		setUserTyping,
		setUserOnline,
		handleConnectionError,
		addReaction,
		removeReaction,
		applyMessageEdited,
		applyMessageDeleted,
		applyMessageRestored,
		applyParticipantJoined,
		applyParticipantLeft,
		removeChat,
		updateChatsInCache,
	]);
}
