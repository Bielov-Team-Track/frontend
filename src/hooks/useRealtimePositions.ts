"use client";

import { useEffect, useCallback } from "react";
import signalr from "@/lib/realtime/signalrClient";
import { usePositionStore } from "@/lib/realtime/positionStore";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useAccessToken } from "@/providers";
import { Position } from "@/lib/models/Position";
import { EVENTS_API_URL } from "@/lib/constants";

export function useRealtimePositions() {
	const applyTaken = usePositionStore((s) => s.applyTaken);
	const applyReleased = usePositionStore((s) => s.applyReleased);
	const applyMultipleUpdated = usePositionStore((s) => s.applyMultipleUpdated);
	const setConnectionStatus = usePositionStore((s) => s.setConnectionStatus);
	const token = useAccessToken(); // Get token at hook level

	const handleConnectionError = useCallback(
		(error?: Error) => {
			console.error("SignalR connection error:", error);
			setConnectionStatus("disconnected");
		},
		[setConnectionStatus],
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
						baseUrl: EVENTS_API_URL,
						hub: "position",
						token,
					},
					{
						onReconnected: () => {
							setConnectionStatus("connected");
						},
						onClose: handleConnectionError,
					}
				);

				// Set up event handlers
				connection.on("PositionTaken", (payload: Position) => {
					applyTaken(payload);
				});

				connection.on("PositionReleased", (payload: Position) => {
					applyReleased(payload);
				});

				connection.on("PositionsUpdated", (payload: Position[]) => {
					applyMultipleUpdated(payload);
				});

				connection.on("Connected", (payload: { connectionId: string }) => {
					setConnectionStatus("connected");
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
			if (!stopped && connection?.state !== HubConnectionState.Disconnected) {
				signalr.stop(EVENTS_API_URL, "position");
				stopped = true;
			}
		};
	}, [
		token,
		applyTaken,
		applyReleased,
		applyMultipleUpdated,
		setConnectionStatus,
		handleConnectionError,
	]);
}
