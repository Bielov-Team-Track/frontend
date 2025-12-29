"use client";

import { NOTIFICATIONS_API_URL } from "@/lib/constants";
import { Notification } from "@/lib/models/Notification";
import { useNotificationStore } from "@/lib/realtime/notificationStore";
import signalr from "@/lib/realtime/signalrClient";
import { useAccessToken } from "@/providers";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { NOTIFICATIONS_QUERY_KEY } from "./useNotifications";

interface UseRealtimeNotificationsOptions {
	enabled?: boolean;
}

export function useRealtimeNotifications({ enabled = true }: UseRealtimeNotificationsOptions = {}) {
	const token = useAccessToken();
	const queryClient = useQueryClient();

	const showNotificationToast = useNotificationStore((s) => s.showNotificationToast);
	const incrementUnread = useNotificationStore((s) => s.incrementUnread);
	const setConnectionStatus = useNotificationStore((s) => s.setConnectionStatus);

	const handleConnectionError = useCallback(
		(error?: Error) => {
			console.error("SignalR notification connection error:", error);
			setConnectionStatus("disconnected");
		},
		[setConnectionStatus]
	);

	useEffect(() => {
		if (!enabled || !token) {
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
						baseUrl: NOTIFICATIONS_API_URL,
						hub: "notifications",
						token,
					},
					{
						onReconnected: () => {
							setConnectionStatus("connected");
							queryClient.invalidateQueries({
								queryKey: [NOTIFICATIONS_QUERY_KEY],
							});
						},
						onClose: handleConnectionError,
					}
				);

				connection.on("ReceiveNotification", (notification: Notification) => {
					showNotificationToast(notification);
					incrementUnread();
					queryClient.invalidateQueries({
						queryKey: [NOTIFICATIONS_QUERY_KEY],
					});
				});

				connection.on("Connected", () => {
					setConnectionStatus("connected");
				});

				connection.onreconnecting(() => {
					setConnectionStatus("reconnecting");
				});
			} catch (error) {
				handleConnectionError(error as Error);
			}
		};

		start();

		return () => {
			if (!stopped && connection?.state !== HubConnectionState.Disconnected) {
				signalr.stop(NOTIFICATIONS_API_URL, "notifications");
				stopped = true;
			}
		};
	}, [enabled, token, showNotificationToast, incrementUnread, setConnectionStatus, handleConnectionError, queryClient]);
}
