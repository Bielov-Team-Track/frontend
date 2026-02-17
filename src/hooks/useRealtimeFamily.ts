"use client";

import { useEffect, useCallback } from "react";
import signalr from "@/lib/realtime/signalrClient";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useAccessToken } from "@/providers";
import { PROFILES_API_URL } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import { HOUSEHOLD_QUERY_KEY } from "./useHousehold";
import { CONSENT_QUERY_KEY } from "./useConsent";

interface UseRealtimeFamilyOptions {
	enabled?: boolean;
}

export function useRealtimeFamily({ enabled = true }: UseRealtimeFamilyOptions = {}) {
	const token = useAccessToken();
	const queryClient = useQueryClient();

	const handleConnectionError = useCallback((error?: Error) => {
		console.error("SignalR family connection error:", error);
	}, []);

	useEffect(() => {
		if (!enabled || !token) {
			return;
		}

		let connection: HubConnection;
		let stopped = false;

		const start = async () => {
			try {
				connection = await signalr.start(
					{
						baseUrl: PROFILES_API_URL,
						hub: "family",
						token,
					},
					{
						onReconnected: () => {
							// Invalidate all family-related queries on reconnection
							queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY] });
							queryClient.invalidateQueries({ queryKey: [CONSENT_QUERY_KEY] });
						},
						onClose: handleConnectionError,
					}
				);

				// Guardian access granted event
				connection.on("GuardianAccessGranted", () => {
					queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY] });
					queryClient.invalidateQueries({ queryKey: [CONSENT_QUERY_KEY] });
				});

				// Guardian access revoked event
				connection.on("GuardianAccessRevoked", () => {
					queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY] });
					queryClient.invalidateQueries({ queryKey: [CONSENT_QUERY_KEY] });
					queryClient.invalidateQueries({ queryKey: ["events", "me"] });
					queryClient.invalidateQueries({ queryKey: ["notifications"] });
				});

				// Consent updated event
				connection.on("ConsentUpdated", () => {
					queryClient.invalidateQueries({ queryKey: [CONSENT_QUERY_KEY] });
				});

				connection.on("Connected", () => {
					console.log("[SignalR:family] Connected");
				});

				connection.onreconnecting(() => {
					console.log("[SignalR:family] Reconnecting...");
				});
			} catch (error) {
				handleConnectionError(error as Error);
			}
		};

		start();

		return () => {
			if (!stopped && connection?.state !== HubConnectionState.Disconnected) {
				signalr.stop(PROFILES_API_URL, "family");
				stopped = true;
			}
		};
	}, [enabled, token, queryClient, handleConnectionError]);
}
