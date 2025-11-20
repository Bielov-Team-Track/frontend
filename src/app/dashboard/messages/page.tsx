"use client";

import { Loader, Modal, ResizableContainer } from "@/components";
import { useAuth } from "@/lib/auth/authContext";
import { MESSAGES_API_URL } from "@/lib/constants";
import { Chat, Message } from "@/lib/models/Messages";
import { useChatStore } from "@/lib/realtime/chatStore";
import signalr from "@/lib/realtime/signalrClient";
import {
	getChat,
	loadConversationsForUser as loadChatsForUser,
	loadMessagesForChat,
	sendMessage,
} from "@/lib/requests/messages";
import { HubConnectionState } from "@microsoft/signalr";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaEnvelope } from "react-icons/fa6";
import ChatInfoModal from "./components/ChatInfoModal";
import ChatList from "./components/ChatList";
import ChatsRealtimeClient from "./components/ChatsRealtimeClient";
import ChatWindow from "./components/ChatWindow";
import NewChatModal from "./components/NewChatModal";

const MessagesPage = () => {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	// Use store for chats
	const chatsMap = useChatStore((state) => state.chats);
	const setChatsStore = useChatStore((state) => state.setChats);
	const upsertChat = useChatStore((state) => state.upsert);

	const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
	const [currentChatMessages, setMessages] = useState<Message[]>([]);
	const [isChatInfoModalOpen, setIsChatInfoModalOpen] = useState(false);
	const [sendError, setSendError] = useState<string | null>(null);

	const user = useAuth().userProfile;

	// Track current chat group to ensure proper cleanup
	const currentChatGroupRef = useRef<string | null>(null);

	// Derived sorted chats
	const chats = useMemo(() => {
		return Object.values(chatsMap).sort((a, b) => {
			const dateA = new Date(
				a.lastMessage?.sentAt || a.createdAt
			).getTime();
			const dateB = new Date(
				b.lastMessage?.sentAt || b.createdAt
			).getTime();
			return dateB - dateA;
		});
	}, [chatsMap]);

	const selectedChat = selectedChatId ? chatsMap[selectedChatId] : null;

	useEffect(() => {
		loadChatsForUser()
			.then((data) => {
				setChatsStore(data);
				setIsLoading(false);
			})
			.catch((err) => {
				setError("Failed to load conversations. Try again later.");
				setIsLoading(false);
			});

		// Cleanup: Leave chat group when component unmounts
		return () => {
			const connection = signalr.getConnection(
				MESSAGES_API_URL,
				"messaging"
			);
			if (
				connection?.state === HubConnectionState.Connected &&
				currentChatGroupRef.current
			) {
				connection
					.invoke("LeaveChatGroup", currentChatGroupRef.current)
					.catch((err) =>
						console.error(
							"Failed to leave chat group on unmount:",
							err
						)
					);
			}
		};
	}, [setChatsStore]);

	// Sync new messages for the active chat
	useEffect(() => {
		if (!selectedChat) return;

		const lastMsg = selectedChat.lastMessage;
		if (lastMsg) {
			setMessages((prev) => {
				if (prev.some((m) => m.id === lastMsg.id)) return prev;
				// Append new message if it's newer than the last one we have
				// This check prevents out-of-order issues if multiple updates come fast,
				// but mostly we just want to append.
				return [...prev, lastMsg];
			});
		}
	}, [selectedChat]);

	const selectChat = async (chat: Chat) => {
		try {
			// Leave previous chat group if any
			const connection = signalr.getConnection(
				MESSAGES_API_URL,
				"messaging"
			);
			if (connection?.state === HubConnectionState.Connected) {
				if (currentChatGroupRef.current) {
					await connection.invoke(
						"LeaveChatGroup",
						currentChatGroupRef.current
					);
				}

				// Join new chat group
				await connection.invoke("JoinChatGroup", chat.id);
				currentChatGroupRef.current = chat.id;
			}

			// Load chat and messages
			setSelectedChatId(chat.id);
			const messages = await loadMessagesForChat(chat.id);
			setMessages(messages);
		} catch (error) {
			console.error("Failed to select chat:", error);
			// Still set the chat even if SignalR fails
			setSelectedChatId(chat.id);
			const messages = await loadMessagesForChat(chat.id);
			setMessages(messages);
		}
	};

	const handleOnChatCreated = (newChat: Chat) => {
		// setChats((prevChats) => [newChat, ...prevChats]); // Store handles this via realtime usually, but we can upsert
		upsertChat(newChat);
		setIsNewChatModalOpen(false);
		selectChat(newChat);
	};

	const handleChatUpdated = async (chatId: string) => {
		try {
			const updatedChat = await getChat(chatId);
			upsertChat(updatedChat);
			// no need to update selectedChat manually as it is derived
		} catch (e) {
			console.error("Failed to refresh chat", e);
		}
	};

	const handleSendMessage = async (text: string) => {
		if (!selectedChat) return;

		setSendError(null);

		try {
			// Get the SignalR connection
			const connection = signalr.getConnection(
				MESSAGES_API_URL,
				"messaging"
			);

			if (connection?.state === HubConnectionState.Connected) {
				// Send via SignalR - message will come back via "ReceiveMessage" event
				// Backend broadcasts to all participants including sender
				await connection.invoke(
					"SendMessage",
					{ content: text },
					selectedChat.id
				);
				// No need to fetch - the "ReceiveMessage" event handler in useRealtimeChats
				// will update the store, and useEffect (line 60-73) will append it to currentChatMessages
			} else {
				// Fallback to REST API if SignalR not connected
				console.warn("SignalR not connected, using REST API fallback");
				await sendMessage(selectedChat.id, text);

				// Only fetch when using REST fallback since we won't get the real-time event
				const messages = await loadMessagesForChat(selectedChat.id);
				setMessages(messages);
			}
		} catch (error) {
			console.error("Failed to send message:", error);
			setSendError("Failed to send message. Please try again.");

			// Optionally retry with REST API
			try {
				await sendMessage(selectedChat.id, text);
				const messages = await loadMessagesForChat(selectedChat.id);
				setMessages(messages);
				setSendError(null);
			} catch (restError) {
				console.error("REST API fallback also failed:", restError);
			}
		}
	};

	if (error) {
		return (
			<div className="absolute inset-0 flex flex-col justify-center items-center gap-4">
				<h2 className="text-error">Something went wrong</h2>
				<span className="text-muted">{error}</span>
			</div>
		);
	}

	if (isLoading) {
		return <Loader className="inset-0 absolute" />;
	}

	return (
		<div className="relative h-full w-full">
			<ChatsRealtimeClient />
			<ResizableContainer
				leftPanel={
					<ChatList
						chats={chats}
						selectedChatId={selectedChat?.id}
						onSelectChat={selectChat}
						onCreateChatClick={() => setIsNewChatModalOpen(true)}
					/>
				}
				rightPanel={
					selectedChat ? (
						<div className="relative h-full">
							{sendError && (
								<div className="absolute top-0 left-0 right-0 z-10 bg-error text-white p-2 text-center text-sm">
									{sendError}
									<button
										onClick={() => setSendError(null)}
										className="ml-2 underline">
										Dismiss
									</button>
								</div>
							)}
							<ChatWindow
								chat={selectedChat}
								messages={currentChatMessages}
								onSendMessage={handleSendMessage}
								onViewChatInfo={() =>
									setIsChatInfoModalOpen(true)
								}
							/>
						</div>
					) : (
						<div className="grid h-full place-items-center bg-background">
							<div className="flex flex-col items-center">
								<FaEnvelope className="text-6xl text-muted mb-4" />
								<span className="text-muted">
									Select a conversation to start chatting
								</span>
							</div>
						</div>
					)
				}
			/>

			<Modal
				isOpen={isNewChatModalOpen}
				title="New Chat"
				onClose={() => setIsNewChatModalOpen(false)}>
				<NewChatModal onChatCreated={handleOnChatCreated} />
			</Modal>

			{selectedChat && (
				<Modal
					title={selectedChat.title}
					isOpen={isChatInfoModalOpen}
					onClose={() => setIsChatInfoModalOpen(false)}>
					<ChatInfoModal
						chat={selectedChat}
						onClose={() => setIsChatInfoModalOpen(false)}
						onChatUpdated={handleChatUpdated}
					/>
				</Modal>
			)}
		</div>
	);
};

export default MessagesPage;
