"use client";

import { Button, Loader, ResizableContainer } from "@/components";
import { MESSAGES_API_URL } from "@/lib/constants";
import { Chat } from "@/lib/models/Messages";
import { useChatConnectionStore } from "@/lib/realtime/chatsConnectionStore";
import signalr from "@/lib/realtime/signalrClient";
import { getChat, loadConversationsForUser, loadMessagesForChat, markChatAsRead, sendMessage } from "@/lib/requests/messages";
import { HubConnectionState } from "@microsoft/signalr";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, MessageSquare, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatList from "./components/ChatList";
import ChatsRealtimeClient from "./components/ChatsRealtimeClient";
import ChatWindow from "./components/ChatWindow";
import NewChat from "./components/NewChat";

const MessagesPage = () => {
	const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
	const [sendError, setSendError] = useState<string | null>(null);

	const queryClient = useQueryClient();
	const { connection, setCurrentChatId } = useChatConnectionStore();
	const currentChatGroupRef = useRef<string | null>(null);

	// Fetch chats with React Query
	const {
		data: chats = [],
		isLoading: chatsLoading,
		error: chatsError,
		refetch: refetchChats,
	} = useQuery({
		queryKey: ["chats"],
		queryFn: loadConversationsForUser,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Fetch messages for selected chat with React Query
	const {
		data: messages = [],
		isLoading: messagesLoading,
		error: messagesError,
		refetch: refetchMessages,
	} = useQuery({
		queryKey: ["messages", selectedChatId],
		queryFn: () => loadMessagesForChat(selectedChatId!),
		enabled: !!selectedChatId,
		staleTime: 1000 * 60, // 1 minute
	});

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

	// Cleanup: Leave chat group when component unmounts
	useEffect(() => {
		return () => {
			const conn = signalr.getConnection(MESSAGES_API_URL, "messaging");
			if (conn?.state === HubConnectionState.Connected && currentChatGroupRef.current) {
				conn.invoke("LeaveChatGroup", currentChatGroupRef.current).catch((err) => console.error("Failed to leave chat group on unmount:", err));
			}
		};
	}, []);

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

				// Mark chat as read and update cache
				try {
					const updatedChat = await markChatAsRead(chat.id);
					queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
						if (!oldChats) return oldChats;
						return oldChats.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c));
					});
				} catch (e) {
					console.error("Failed to mark chat as read:", e);
				}
			} catch (error) {
				console.error("Failed to select chat:", error);
				// Still set the chat even if SignalR fails
				setSelectedChatId(chat.id);
				setCurrentChatId(chat.id);
			}
		},
		[queryClient, setCurrentChatId]
	);

	const handleOnChatCreated = useCallback(
		(newChat: Chat) => {
			// Add new chat to cache
			queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
				if (!oldChats) return [newChat];
				if (oldChats.some((c) => c.id === newChat.id)) return oldChats;
				return [newChat, ...oldChats];
			});
			setIsNewChatModalOpen(false);
			selectChat(newChat);
		},
		[queryClient, selectChat]
	);

	const handleChatUpdated = useCallback(
		async (chatId: string) => {
			try {
				const updatedChat = await getChat(chatId);
				queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
					if (!oldChats) return oldChats;
					return oldChats.map((c) => (c.id === chatId ? updatedChat : c));
				});
			} catch (e) {
				console.error("Failed to refresh chat:", e);
			}
		},
		[queryClient]
	);

	const handleSendMessage = useCallback(
		async (text: string) => {
			if (!selectedChat) return;

			setSendError(null);

			try {
				await sendMessage(selectedChat.id, text);
				refetchMessages();
			} catch (error) {
				console.error("Failed to send message:", error);
				setSendError("Failed to send message. Please try again.");
			}
		},
		[selectedChat, refetchMessages]
	);

	// Error state for chats
	if (chatsError) {
		return (
			<div className="absolute inset-0 flex flex-col justify-center items-center gap-4">
				<div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-2">
					<AlertCircle size={32} className="text-error" />
				</div>
				<h2 className="text-xl font-bold text-error">Failed to load conversations</h2>
				<span className="text-muted text-center max-w-md">
					{chatsError instanceof Error ? chatsError.message : "An unexpected error occurred. Please try again."}
				</span>
				<Button onClick={() => refetchChats()} leftIcon={<RefreshCw size={16} />} color="accent">
					Try Again
				</Button>
			</div>
		);
	}

	// Loading state for chats
	if (chatsLoading) {
		return <Loader className="inset-0 absolute" />;
	}

	return (
		<div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
			<ChatsRealtimeClient />
			<ResizableContainer
				leftPanel={
					<div className="rounded-2xl h-full min-h-0">
						{isNewChatModalOpen ? (
							<div className="flex flex-col gap-4 h-full min-h-0 bg-background/50 backdrop-blur-xl border border-white/5 p-6 rounded-r-0 rounded-2xl overflow-hidden">
								<div className="flex items-center gap-2 mb-4">
									<Button
										leftIcon={<ChevronLeft />}
										size="sm"
										color="neutral"
										variant="ghost"
										onClick={() => setIsNewChatModalOpen(false)}
										className="h-8 w-8 p-0 rounded-full bg-white/5 hover:bg-white/10"
									/>
									<span className="font-bold text-2xl text-white tracking-tight">New chat</span>
								</div>
								<NewChat onChatCreated={handleOnChatCreated} />
							</div>
						) : (
							<ChatList
								chats={sortedChats}
								selectedChatId={selectedChat?.id}
								onSelectChat={selectChat}
								onCreateChatClick={() => setIsNewChatModalOpen(true)}
							/>
						)}
					</div>
				}
				rightPanel={
					<div className="h-full min-h-0 flex flex-col rounded-l-0">
						{selectedChat ? (
							messagesLoading ? (
								<div className="flex-1 flex items-center justify-center bg-background/50 backdrop-blur-xl border border-white/5">
									<Loader />
								</div>
							) : messagesError ? (
								<div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background/50 backdrop-blur-xl border border-white/5">
									<div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
										<AlertCircle size={24} className="text-error" />
									</div>
									<span className="text-error font-medium">Failed to load messages</span>
									<Button onClick={() => refetchMessages()} size="sm" leftIcon={<RefreshCw size={14} />} color="accent">
										Retry
									</Button>
								</div>
							) : (
								<div className="flex flex-col flex-1 min-h-0 bg-background/50 backdrop-blur-xl border border-white/5 overflow-hidden">
									{sendError && (
										<div className="shrink-0 bg-error text-white p-2 text-center text-sm z-10">
											{sendError}
											<button onClick={() => setSendError(null)} className="ml-2 underline">
												Dismiss
											</button>
										</div>
									)}
									<ChatWindow chat={selectedChat} messages={messages} onSendMessage={handleSendMessage} onChatUpdated={handleChatUpdated} />
								</div>
							)
						) : (
							<div className="grid flex-1 min-h-0 place-items-center bg-background/30 backdrop-blur-xl border border-white/5">
								<div className="flex flex-col items-center p-8 text-center">
									<div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-muted">
										<MessageSquare size={40} className="opacity-50" />
									</div>
									<h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
									<span className="text-muted max-w-xs">Select a conversation from the list or start a new chat to begin messaging.</span>
									<Button className="mt-6" onClick={() => setIsNewChatModalOpen(true)} color="accent">
										Start New Chat
									</Button>
								</div>
							</div>
						)}
					</div>
				}
			/>
		</div>
	);
};

export default MessagesPage;
