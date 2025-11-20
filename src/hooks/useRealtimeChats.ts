"use client";

import { useAccessToken } from "@/lib/auth/authContext";
import { MESSAGES_API_URL } from "@/lib/constants";
import { Message } from "@/lib/models/Messages";
import { useChatStore } from "@/lib/realtime/chatStore";
import signalr from "@/lib/realtime/signalrClient";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useCallback, useEffect } from "react";

export function useRealtimeChats() {
	const applyNewChat = useChatStore((s) => s.applyNewChat);
	const applyNewMessage = useChatStore((s) => s.applyNewMessage);
	const applyMessageRead = useChatStore((s) => s.applyMessageRead);
	const applyChatUpdated = useChatStore((s) => s.applyChatUpdated);
	const setConnectionStatus = useChatStore((s) => s.setConnectionStatus);
	const token = useAccessToken();

	const handleConnectionError = useCallback(
		(error?: Error) => {
			console.error("SignalR chat connection error:", error);
			setConnectionStatus("disconnected");
		},
		[setConnectionStatus]
	);

	useEffect(() => {
		if (!token) {
			setConnectionStatus("disconnected");
			return;
		}

		let connection: HubConnection;
		let stopped = false;

		const start = async () => {
			try {
				setConnectionStatus("connecting");
				connection = await signalr.start(
					{
						baseUrl: MESSAGES_API_URL,
						hub: "messaging", // Changed from "chat" to "messaging" to match backend
						token,
					},
					{
						onReconnected: () => {
							setConnectionStatus("connected");
						},
						onClose: handleConnectionError,
					}
				);

				// Set up event handlers for real-time messaging updates
				// Note: Backend only sends ReceiveMessage, UserRead, UserTyping, UserStoppedTyping
				// NewChat and ChatUpdated events don't exist in backend - handle via REST API

				connection.on("ReceiveMessage", (message: Message) => {
					console.log("Received new message:", message);
					// Backend sends the full message object
					// Assuming message has chatId property
					if (message.chatId) {
						applyNewMessage(message.chatId, message);
					}
				});

				connection.on(
					"UserRead",
					(payload: {
						userId: string;
						chatId: string;
						readAt: string;
					}) => {
						// Backend sends UserRead when someone marks messages as read
						// Frontend expects messageId, but backend sends userId who read
						// This may need store adjustment
						console.log("User read event:", payload);
						// TODO: Update store to handle user read status
					}
				);

				// Optional: Listen to typing indicators
				connection.on(
					"UserTyping",
					(payload: { userId: string; chatId: string }) => {
						console.log("User typing:", payload);
						// TODO: Implement typing indicators in UI if needed
					}
				);

				connection.on(
					"UserStoppedTyping",
					(payload: { userId: string; chatId: string }) => {
						console.log("User stopped typing:", payload);
						// TODO: Implement typing indicators in UI if needed
					}
				);

				connection.on(
					"Connected",
					(payload: { connectionId: string; userId: string }) => {
						console.log("Connected to messaging hub:", payload);
						setConnectionStatus("connected");
					}
				);

				connection.on("Error", (payload: { message: string }) => {
					console.error("Hub error:", payload.message);
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
			if (
				!stopped &&
				connection?.state !== HubConnectionState.Disconnected
			) {
				signalr.stop(MESSAGES_API_URL, "messaging");
				stopped = true;
			}
		};
	}, [
		token,
		applyNewChat,
		applyNewMessage,
		applyMessageRead,
		applyChatUpdated,
		setConnectionStatus,
		handleConnectionError,
	]);
}
