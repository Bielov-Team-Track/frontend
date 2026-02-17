"use client";

import { Button, Loader } from "@/components";
import { getChat, loadConversationsForUser, loadMessagesForChat, markChatAsRead, sendMessage, type CreateEmbedInput } from "@/lib/api/messages";
import { MESSAGES_API_URL } from "@/lib/constants";
import { Chat, Message } from "@/lib/models/Messages";
import { CursorPagedResult } from "@/lib/models/Pagination";
import { useChatConnectionStore } from "@/lib/realtime/chatsConnectionStore";
import { setOptimisticMapping, clearOptimisticMap } from "@/lib/realtime/optimisticMessages";
import signalr from "@/lib/realtime/signalrClient";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";
import { HubConnectionState } from "@microsoft/signalr";
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, MessageSquare, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useViewportReadTracker } from "@/hooks/useViewportReadTracker";
import ChatList from "./components/ChatList";
import ChatsRealtimeClient from "./components/ChatsRealtimeClient";
import ChatWindow from "./components/ChatWindow";
import MessagesPageSkeleton from "./components/MessagesPageSkeleton";
import NewChat from "./components/NewChat";

const MessagesPage = () => {
	const { userProfile } = useAuth();
	const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
	const [sendError, setSendError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebouncedValue(searchQuery, 300);

	const queryClient = useQueryClient();
	const { connection, setCurrentChatId } = useChatConnectionStore();
	const currentChatGroupRef = useRef<string | null>(null);

	const PAGE_SIZE = 20;
	const MESSAGE_PAGE_SIZE = 50;

	// Fetch chats with infinite query
	const {
		data: chatsData,
		isLoading: chatsLoading,
		error: chatsError,
		refetch: refetchChats,
		fetchNextPage: fetchNextChatsPage,
		hasNextPage: hasMoreChats,
		isFetchingNextPage: isFetchingMoreChats,
	} = useInfiniteQuery({
		queryKey: ["chats", debouncedSearch || undefined],
		queryFn: ({ pageParam }) =>
			loadConversationsForUser({
				search: debouncedSearch || undefined,
				cursor: pageParam,
				limit: PAGE_SIZE,
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
		staleTime: 1000 * 60 * 5,
	});

	// Flatten all pages into a single chat list
	const chats = useMemo(() => {
		if (!chatsData?.pages) return [];
		return chatsData.pages.flatMap((page) => page.items);
	}, [chatsData]);

	// Fetch messages for selected chat with infinite query (load older on scroll up)
	const {
		data: messagesData,
		isLoading: messagesLoading,
		error: messagesError,
		refetch: refetchMessages,
		fetchNextPage: fetchOlderMessages,
		hasNextPage: hasOlderMessages,
		isFetchingNextPage: isFetchingOlderMessages,
	} = useInfiniteQuery({
		queryKey: ["messages", selectedChatId],
		queryFn: ({ pageParam = 0 }) =>
			loadMessagesForChat(selectedChatId!, pageParam, MESSAGE_PAGE_SIZE),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < MESSAGE_PAGE_SIZE) return undefined;
			return allPages.reduce((total, page) => total + page.length, 0);
		},
		enabled: !!selectedChatId,
		staleTime: 1000 * 60,
	});

	// Flatten all message pages into a single list
	const messages = useMemo(() => {
		if (!messagesData?.pages) return [];
		return messagesData.pages.flat();
	}, [messagesData]);

	const sortedChats = useMemo(() => {
		return [...chats].sort((a, b) => {
			const dateA = new Date(a.lastMessage?.sentAt || a.createdAt).getTime();
			const dateB = new Date(b.lastMessage?.sentAt || b.createdAt).getTime();
			return dateB - dateA;
		});
	}, [chats]);

	const selectedChat = useMemo(() => {
		return selectedChatId ? chats.find((chat) => chat.id === selectedChatId) : null;
	}, [selectedChatId, chats]);

	// Compute lastReadMessageId for the current user from the selected chat's participants
	const lastReadMessageId = useMemo(() => {
		if (!selectedChat || !userProfile?.id) return undefined;
		const myParticipant = selectedChat.participants.find((p) => p.userId === userProfile.id);
		return myParticipant?.lastReadMessageId;
	}, [selectedChat, userProfile?.id]);

	// Viewport-based read tracking: mark messages as read when they enter the viewport
	const handleMarkAsRead = useCallback(
		async (lastReadMessageId: string) => {
			if (!selectedChat) return;
			try {
				// Use SignalR if connected, fall back to REST
				if (connection?.state === HubConnectionState.Connected) {
					await connection.invoke("MarkAsRead", selectedChat.id, lastReadMessageId);
				} else {
					await markChatAsRead(selectedChat.id, lastReadMessageId);
				}
				// Optimistically update unread count to 0 for the current chat
				const prevUnread = selectedChat.unreadCount || 0;
				updateChatInCache(selectedChat.id, (c) => ({ ...c, unreadCount: 0 }));
				if (prevUnread > 0) {
					queryClient.setQueryData<number>(["unread-message-count"], (old) =>
						Math.max(0, (old ?? 0) - prevUnread)
					);
				}
			} catch (e) {
				console.error("Failed to mark chat as read:", e);
			}
		},
		[selectedChat?.id, connection],
	);

	// Map messages to chronological order (oldest-first) for viewport read tracking.
	// The tracker uses array index as the watermark — higher index must = newer message.
	const trackerMessages = useMemo(() => {
		return [...messages].reverse().map((m) => ({
			id: m.id,
			senderId: m.sender?.id ?? "",
			sentAt: typeof m.sentAt === "string" ? m.sentAt : new Date(m.sentAt).toISOString(),
		}));
	}, [messages]);

	const { observeMessage } = useViewportReadTracker({
		chatId: selectedChat?.id ?? "",
		currentUserId: userProfile?.id ?? "",
		messages: trackerMessages,
		onMarkAsRead: handleMarkAsRead,
		enabled: !!selectedChat,
	});

	// Compute read status map for read receipt checkmarks
	const readStatusMap = useMemo(() => {
		if (!selectedChat || !messages?.length) return new Map();
		const map = new Map<string, { readByCount: number; totalOthers: number }>();
		const otherParticipants = selectedChat.participants.filter((p) => p.userId !== userProfile?.id);
		// Build message index map for position comparison
		const messageIndexMap = new Map(messages.map((m, i) => [m.id, i]));

		for (const message of messages) {
			const msgIndex = messageIndexMap.get(message.id)!;
			const readBy = otherParticipants.filter((p) => {
				if (!p.lastReadMessageId) return false;
				const readIndex = messageIndexMap.get(p.lastReadMessageId);
				return readIndex !== undefined && readIndex >= msgIndex;
			});
			map.set(message.id, { readByCount: readBy.length, totalOthers: otherParticipants.length });
		}
		return map;
	}, [selectedChat, messages, userProfile?.id]);

	// Cleanup: Leave chat group when component unmounts
	useEffect(() => {
		return () => {
			const conn = signalr.getConnection(MESSAGES_API_URL, "messaging");
			if (conn?.state === HubConnectionState.Connected && currentChatGroupRef.current) {
				conn.invoke("LeaveChatGroup", currentChatGroupRef.current).catch((err) => console.error("Failed to leave chat group on unmount:", err));
			}
		};
	}, []);

	const updateChatInCache = useCallback(
		(chatId: string, updater: (chat: Chat) => Chat) => {
			queryClient.setQueriesData<InfiniteData<CursorPagedResult<Chat>>>(
				{ queryKey: ["chats"] },
				(oldData) => {
					if (!oldData?.pages?.length) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							items: page.items.map((c) => (c.id === chatId ? updater(c) : c)),
						})),
					};
				}
			);
		},
		[queryClient]
	);

	const selectChat = useCallback(
		async (chat: Chat) => {
			try {
				const conn = signalr.getConnection(MESSAGES_API_URL, "messaging");

				// Leave previous chat group if any
				if (conn?.state === HubConnectionState.Connected) {
					if (currentChatGroupRef.current) {
						await conn.invoke("LeaveChatGroup", currentChatGroupRef.current);
					}
					// Join new chat group
					await conn.invoke("JoinChatGroup", chat.id);
					currentChatGroupRef.current = chat.id;
				}

				setSelectedChatId(chat.id);
				setCurrentChatId(chat.id);
			} catch (error) {
				console.error("Failed to select chat:", error);
				// Still set the chat even if SignalR fails
				setSelectedChatId(chat.id);
				setCurrentChatId(chat.id);
			}
		},
		[setCurrentChatId]
	);

	const deselectChat = useCallback(async () => {
		// Before deselecting, mark the active chat as fully read in the cache.
		// The user was viewing this chat, so unreadCount should be 0.
		// This prevents race conditions where server refetch (via ChatUpdated) sets unreadCount > 0.
		const departingChatId = selectedChatId;
		if (departingChatId) {
			queryClient.setQueriesData<InfiniteData<CursorPagedResult<Chat>>>(
				{ queryKey: ["chats"] },
				(oldData) => {
					if (!oldData?.pages) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							items: page.items.map((c) =>
								c.id === departingChatId ? { ...c, unreadCount: 0 } : c,
							),
						})),
					};
				}
			);
		}

		try {
			const conn = signalr.getConnection(MESSAGES_API_URL, "messaging");
			if (conn?.state === HubConnectionState.Connected && currentChatGroupRef.current) {
				await conn.invoke("LeaveChatGroup", currentChatGroupRef.current);
				currentChatGroupRef.current = null;
			}
		} catch (error) {
			console.error("Failed to leave chat group:", error);
		}
		setSelectedChatId(null);
		setCurrentChatId(null);
	}, [selectedChatId, setCurrentChatId, queryClient]);

	const handleOnChatCreated = useCallback(
		(newChat: Chat) => {
			// Add new chat to the first page of the infinite cache
			queryClient.setQueriesData<InfiniteData<CursorPagedResult<Chat>>>(
				{ queryKey: ["chats"] },
				(oldData) => {
					if (!oldData?.pages?.length) return oldData;
					const firstPage = oldData.pages[0];
					if (firstPage.items.some((c) => c.id === newChat.id)) return oldData;
					return {
						...oldData,
						pages: [
							{ ...firstPage, items: [newChat, ...firstPage.items] },
							...oldData.pages.slice(1),
						],
					};
				}
			);
			setIsNewChatModalOpen(false);
			selectChat(newChat);
		},
		[queryClient, selectChat]
	);

	const handleChatUpdated = useCallback(
		async (chatId: string) => {
			try {
				const updatedChat = await getChat(chatId);
				updateChatInCache(chatId, () => updatedChat);
			} catch (e) {
				console.error("Failed to refresh chat:", e);
			}
		},
		[updateChatInCache]
	);

	type MessagesInfiniteData = InfiniteData<Message[]>;

	const sendMessageMutation = useMutation({
		mutationFn: (params: { chatId: string; content: string; mediaIds?: string[]; embeds?: CreateEmbedInput[]; _optimisticId: string }) =>
			sendMessage(params.chatId, params.content, params.mediaIds, params.embeds),

		onMutate: async (params) => {
			// Cancel outgoing refetches to avoid overwriting optimistic update
			await queryClient.cancelQueries({ queryKey: ["messages", params.chatId] });

			// Create optimistic message
			const optimisticMessage: Message = {
				id: params._optimisticId,
				_optimisticId: params._optimisticId,
				_status: "sending",
				content: params.content,
				chatId: params.chatId,
				sender: userProfile!,
				sentAt: new Date(),
				isEdited: false,
				read: true,
				isDeleted: false,
				reactions: [],
				attachments: [],
				embeds: [],
			};

			// Insert into first page of cache
			queryClient.setQueryData<MessagesInfiniteData>(["messages", params.chatId], (oldData) => {
				if (!oldData?.pages?.length) return oldData;
				const firstPage = oldData.pages[0];
				return {
					...oldData,
					pages: [[optimisticMessage, ...firstPage], ...oldData.pages.slice(1)],
				};
			});

			return { optimisticId: params._optimisticId, chatId: params.chatId };
		},

		onSuccess: (serverMessage, params, context) => {
			if (!context || !serverMessage?.id) return;

			// Store mapping so ReceiveMessage handler can dedup
			setOptimisticMapping(context.optimisticId, serverMessage.id);

			// Check if SignalR already delivered this message (SignalR-first case)
			const messagesData = queryClient.getQueryData<MessagesInfiniteData>(["messages", context.chatId]);
			const signalrAlreadyDelivered = messagesData?.pages?.some((page) =>
				page.some((m) => m.id === serverMessage.id && !m._optimisticId),
			);

			if (signalrAlreadyDelivered) {
				// Remove the optimistic message — real one is already there
				queryClient.setQueryData<MessagesInfiniteData>(["messages", context.chatId], (oldData) => {
					if (!oldData?.pages) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => page.filter((m) => m._optimisticId !== context.optimisticId)),
					};
				});
			}
		},

		onError: (_error, params, context) => {
			if (!context) return;

			// Update the optimistic message to error state (granular, not full rollback)
			queryClient.setQueryData<MessagesInfiniteData>(["messages", context.chatId], (oldData) => {
				if (!oldData?.pages) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) =>
						page.map((m) =>
							m._optimisticId === context.optimisticId ? { ...m, _status: "error" as const } : m,
						),
					),
				};
			});
		},
	});

	const handleSendMessage = useCallback(
		async (text: string, mediaIds?: string[], embeds?: CreateEmbedInput[]) => {
			if (!selectedChat) return;
			setSendError(null);

			const optimisticId = crypto.randomUUID();
			sendMessageMutation.mutate({
				chatId: selectedChat.id,
				content: text,
				mediaIds,
				embeds,
				_optimisticId: optimisticId,
			});
		},
		[selectedChat, sendMessageMutation],
	);

	const handleRetryMessage = useCallback(
		(optimisticId: string) => {
			if (!selectedChatId) return;

			// Find the error message in cache
			const messagesData = queryClient.getQueryData<MessagesInfiniteData>(["messages", selectedChatId]);
			const errorMessage = messagesData?.pages?.flat().find((m) => m._optimisticId === optimisticId);
			if (!errorMessage) return;

			// Remove the error message from cache
			queryClient.setQueryData<MessagesInfiniteData>(["messages", selectedChatId], (oldData) => {
				if (!oldData?.pages) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => page.filter((m) => m._optimisticId !== optimisticId)),
				};
			});

			// Retry with a new optimistic ID
			const newOptimisticId = crypto.randomUUID();
			sendMessageMutation.mutate({
				chatId: selectedChatId,
				content: errorMessage.content,
				_optimisticId: newOptimisticId,
			});
		},
		[selectedChatId, queryClient, sendMessageMutation],
	);

	const handleDismissMessage = useCallback(
		(optimisticId: string) => {
			if (!selectedChatId) return;
			queryClient.setQueryData<MessagesInfiniteData>(["messages", selectedChatId], (oldData) => {
				if (!oldData?.pages) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => page.filter((m) => m._optimisticId !== optimisticId)),
				};
			});
		},
		[selectedChatId, queryClient],
	);

	// Cleanup error messages and optimistic map on chat switch
	useEffect(() => {
		return () => {
			if (selectedChatId) {
				queryClient.setQueryData<MessagesInfiniteData>(["messages", selectedChatId], (oldData) => {
					if (!oldData?.pages) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => page.filter((m) => m._status !== "error")),
					};
				});
			}
			clearOptimisticMap();
		};
	}, [selectedChatId, queryClient]);

	// Error state for chats
	if (chatsError) {
		return (
			<div data-testid="messages-error" className="absolute inset-0 flex flex-col justify-center items-center gap-4">
				<div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-2">
					<AlertCircle size={32} className="text-error" />
				</div>
				<h2 className="text-xl font-bold text-error">Failed to load conversations</h2>
				<span className="text-muted-foreground text-center max-w-md">
					{chatsError instanceof Error ? chatsError.message : "An unexpected error occurred. Please try again."}
				</span>
				<Button loading={chatsLoading} variant={"outline"} onClick={() => refetchChats()} leftIcon={<RefreshCw size={16} />}>
					Try Again
				</Button>
			</div>
		);
	}

	// Loading state for chats
	if (chatsLoading) {
		return <MessagesPageSkeleton />;
	}

	return (
		<div data-testid="messages-page" className="relative h-[calc(100dvh-7rem)] w-full rounded-2xl overflow-hidden shadow-md bg-surface">
			<ChatsRealtimeClient />
			<div className="flex h-full min-h-0">
				{/* Left Panel - Chat List */}
				<div
					className={cn(
						"h-full min-h-0 shrink-0",
						// Mobile: full width when no chat selected, hidden when chat is open
						selectedChatId ? "hidden md:block" : "w-full",
						// Desktop: fixed sidebar width
						"md:w-96",
					)}>
					<div className="rounded-2xl h-full min-h-0">
						{isNewChatModalOpen ? (
							<div className="flex flex-col gap-4 h-full min-h-0 bg-background/50 backdrop-blur-xl border border-border p-6 rounded-r-0 rounded-2xl overflow-hidden">
								<div className="flex items-center gap-2 mb-4">
									<Button
										leftIcon={<ChevronLeft />}
										size="sm"
										color="neutral"
										variant="ghost"
										onClick={() => setIsNewChatModalOpen(false)}
										className="h-8 w-8 p-0 rounded-full bg-hover hover:bg-active"
									/>
									<span className="font-bold text-2xl text-foreground tracking-tight">New chat</span>
								</div>
								<NewChat onChatCreated={handleOnChatCreated} />
							</div>
						) : (
							<ChatList
								chats={sortedChats}
								selectedChatId={selectedChat?.id}
								onSelectChat={selectChat}
								onCreateChatClick={() => setIsNewChatModalOpen(true)}
								searchQuery={searchQuery}
								onSearchChange={setSearchQuery}
								onLoadMore={fetchNextChatsPage}
								hasMore={hasMoreChats}
								isLoadingMore={isFetchingMoreChats}
								currentUserId={userProfile?.id}
							/>
						)}
					</div>
				</div>

				{/* Divider - desktop only */}
				<div className="hidden md:block w-px bg-border shrink-0" />

				{/* Right Panel - Chat Window */}
				<div
					className={cn(
						"h-full min-h-0 min-w-0",
						// Mobile: visible only when chat is selected
						selectedChatId ? "flex-1" : "hidden md:flex md:flex-1",
					)}>
					<div className="h-full min-h-0 flex flex-col w-full">
						{selectedChat ? (
							messagesLoading ? (
								<div className="flex-1 flex items-center justify-center bg-background/50 backdrop-blur-xl border-l-0 md:border-l border-border">
									<Loader />
								</div>
							) : messagesError ? (
								<div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background/50 backdrop-blur-xl border-l-0 md:border-l border-border">
									<div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
										<AlertCircle size={24} className="text-error" />
									</div>
									<span className="text-error font-medium">Failed to load messages</span>
									<Button onClick={() => refetchMessages()} size="sm" leftIcon={<RefreshCw size={14} />} color="accent">
										Retry
									</Button>
								</div>
							) : (
								<div className="flex flex-col flex-1 min-h-0 bg-background/50 backdrop-blur-xl border-l-0 md:border-l border-border overflow-hidden">
									{sendError && (
										<div data-testid="send-error" className="shrink-0 bg-error text-white p-2 text-center text-sm z-10">
											{sendError}
											<button onClick={() => setSendError(null)} className="ml-2 underline">
												Dismiss
											</button>
										</div>
									)}
									<ChatWindow
										chat={selectedChat}
										messages={messages}
										onSendMessage={handleSendMessage}
										onRetryMessage={handleRetryMessage}
										onDismissMessage={handleDismissMessage}
										onViewChatInfo={() => {}}
										onChatUpdated={handleChatUpdated}
										onBack={deselectChat}
										onLoadOlderMessages={fetchOlderMessages}
										hasOlderMessages={hasOlderMessages}
										isLoadingOlderMessages={isFetchingOlderMessages}
										lastReadMessageId={lastReadMessageId}
										observeMessage={observeMessage}
										readStatusMap={readStatusMap}
									/>
								</div>
							)
						) : (
							<div data-testid="no-chat-selected" className="grid flex-1 min-h-0 place-items-center bg-background/30 backdrop-blur-xl border-l border-border">
								<div className="flex flex-col items-center p-8 text-center">
									<div className="w-20 h-20 rounded-full bg-hover flex items-center justify-center mb-6 text-muted-foreground">
										<MessageSquare size={40} className="opacity-50" />
									</div>
									<h3 className="text-xl font-bold text-foreground mb-2">Your Messages</h3>
									<span className="text-muted-foreground max-w-xs">Select a conversation from the list or start a new chat to begin messaging.</span>
									<Button data-testid="start-new-chat-button" className="mt-6" onClick={() => setIsNewChatModalOpen(true)} color="accent">
										Start New Chat
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MessagesPage;
