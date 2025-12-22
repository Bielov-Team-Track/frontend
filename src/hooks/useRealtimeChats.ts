"use client";

import { useAccessToken } from "@/providers";
import { MESSAGES_API_URL } from "@/lib/constants";
import { Chat, ChatParticipant, Message, MessageReaction } from "@/lib/models/Messages";
import { useChatConnectionStore } from "@/lib/realtime/chatsConnectionStore";
import signalr from "@/lib/realtime/signalrClient";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";

export function useRealtimeChats() {
	const { setConnection, setConnectionStatus, setUserTyping, setUserOnline } = useChatConnectionStore();
	const token = useAccessToken();
	const queryClient = useQueryClient();
	const connectionRef = useRef<HubConnection | null>(null);

	const handleConnectionError = useCallback(
		(error?: Error) => {
			console.error("SignalR chat connection error:", error);
			setConnectionStatus("disconnected");
		},
		[setConnectionStatus]
	);

	const addReaction = useCallback(
		(messageReaction: MessageReaction) => {
			queryClient.setQueriesData<Message[]>({ queryKey: ["messages"] }, (oldMessages) => {
				if (!oldMessages) return oldMessages;

				const message = oldMessages.find((msg) => msg.id === messageReaction.messageId);
				if (!message) return oldMessages;

				const existingReaction = message.reactions.find((r) => r.emoji === messageReaction.emoji);
				let updatedReactions;
				if (existingReaction) {
					// Don't add if user already reacted
					if (existingReaction.userIds.includes(messageReaction.userId)) return oldMessages;
					updatedReactions = message.reactions.map((r) =>
						r.emoji === messageReaction.emoji ? { ...r, userIds: [...r.userIds, messageReaction.userId] } : r
					);
				} else {
					updatedReactions = [...message.reactions, { emoji: messageReaction.emoji, userIds: [messageReaction.userId] }];
				}
				return oldMessages.map((msg) => (msg.id === messageReaction.messageId ? { ...msg, reactions: updatedReactions } : msg));
			});
		},
		[queryClient]
	);

	// Update reactions in React Query cache
	const removeReaction = useCallback(
		(messageReaction: MessageReaction) => {
			queryClient.setQueriesData<Message[]>({ queryKey: ["messages"] }, (oldMessages) => {
				if (!oldMessages) return oldMessages;

				const message = oldMessages.find((msg) => msg.id === messageReaction.messageId);
				if (!message) return oldMessages;

				const existingReaction = message.reactions.find((r) => r.emoji === messageReaction.emoji);
				if (!existingReaction) return oldMessages;

				const newUserIds = existingReaction.userIds.filter((id) => id !== messageReaction.userId);
				let updatedReactions;
				if (newUserIds.length === 0) {
					updatedReactions = message.reactions.filter((r) => r.emoji !== messageReaction.emoji);
				} else {
					updatedReactions = message.reactions.map((r) => (r.emoji === messageReaction.emoji ? { ...r, userIds: newUserIds } : r));
				}

				return oldMessages.map((msg) => (msg.id === messageReaction.messageId ? { ...msg, reactions: updatedReactions } : msg));
			});
		},
		[queryClient]
	);

	// Update message content when edited
	const applyMessageEdited = useCallback(
		(chatId: string, messageId: string, content: string, editedAt: Date) => {
			queryClient.setQueryData(["messages", chatId], (oldMessages: Message[] | undefined) => {
				if (!oldMessages) return oldMessages;
				return oldMessages.map((msg) => (msg.id === messageId ? { ...msg, content, isEdited: true, editedAt } : msg));
			});

			queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
				if (!oldChats) return oldChats;
				return oldChats.map((chat) =>
					chat.lastMessage?.id === messageId ? { ...chat, lastMessage: { ...chat.lastMessage, content, isEdited: true, editedAt } } : chat
				);
			});
		},
		[queryClient]
	);

	// Remove message when deleted
	const applyMessageDeleted = useCallback(
		(chatId: string, messageId: string) => {
			queryClient.setQueryData(["messages", chatId], (oldMessages: Message[] | undefined) => {
				if (!oldMessages) return oldMessages;
				return oldMessages.map((msg) => (msg.id === messageId ? { ...msg, isDeleted: true, content: "" } : msg));
			});
		},
		[queryClient]
	);

	// Add participant to chat
	const applyParticipantJoined = useCallback(
		(chatId: string, participant: ChatParticipant) => {
			queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
				if (!oldChats) return oldChats;
				return oldChats.map((chat) => {
					if (chat.id !== chatId) return chat;
					if (chat.participantIds.includes(participant.userId)) return chat;
					return {
						...chat,
						participantIds: [...chat.participantIds, participant.userId],
						participants: participant.userProfile ? [...chat.participants, participant.userProfile] : chat.participants,
					};
				});
			});
		},
		[queryClient]
	);

	// Remove participant from chat
	const applyParticipantLeft = useCallback(
		(chatId: string, userId: string) => {
			queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
				if (!oldChats) return oldChats;
				return oldChats.map((chat) => {
					if (chat.id !== chatId) return chat;
					return {
						...chat,
						participantIds: chat.participantIds.filter((id) => id !== userId),
						participants: chat.participants.filter((p) => p.userId !== userId),
					};
				});
			});
		},
		[queryClient]
	);

	// Remove chat from list
	const removeChat = useCallback(
		(chatId: string) => {
			queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
				if (!oldChats) return oldChats;
				return oldChats.filter((chat) => chat.id !== chatId);
			});
			// Also invalidate messages for that chat
			queryClient.removeQueries({ queryKey: ["messages", chatId] });
		},
		[queryClient]
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
					}
				);

				connectionRef.current = connection;
				setConnection(connection);

				// New message received
				connection.on("ReceiveMessage", (message: Message) => {
					if (!message.chatId) return;

					// Update messages cache
					queryClient.setQueryData(["messages", message.chatId], (oldData: Message[] | undefined) => {
						if (!oldData) return [message];
						if (oldData.find((m) => m.id === message.id)) return oldData;
						return [...oldData, message];
					});

					// Update chats cache with new lastMessage
					queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
						if (!oldChats) return oldChats;

						const chatExists = oldChats.some((c) => c.id === message.chatId);
						if (!chatExists) {
							// New chat - invalidate to fetch full chat data
							queryClient.invalidateQueries({ queryKey: ["chats"] });
							return oldChats;
						}

						return oldChats
							.map((chat) => (chat.id === message.chatId ? { ...chat, lastMessage: message, unreadCount: chat.unreadCount + 1 } : chat))
							.sort((a, b) => {
								const dateA = new Date(a.lastMessage?.sentAt || 0).getTime();
								const dateB = new Date(b.lastMessage?.sentAt || 0).getTime();
								return dateB - dateA;
							});
					});

					// Clear typing indicator for sender
					setUserTyping(message.chatId, message.sender.userId, false);
				});

				// User read messages
				connection.on("UserRead", (payload: { userId: string; chatId: string; readAt: string }) => {
					queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
						if (!oldChats) return oldChats;
						return oldChats.map((chat) => (chat.id === payload.chatId ? { ...chat, unreadCount: 0 } : chat));
					});
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
				connection.on("MessageEdited", ({ chatId, messageId, content, editedAt }) => {
					applyMessageEdited(chatId, messageId, content, new Date(editedAt));
				});

				connection.on("MessageDeleted", ({ messageId, chatId }) => {
					applyMessageDeleted(chatId, messageId);
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
					// Invalidate chats to fetch the new chat
					queryClient.invalidateQueries({ queryKey: ["chats"] });
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
		applyParticipantJoined,
		applyParticipantLeft,
		removeChat,
	]);
}
