"use client";

import { useEffect, useCallback } from "react";
import signalr from "@/lib/realtime/signalrClient";
import { useEvaluationSessionStore } from "@/lib/realtime/evaluationSessionStore";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useAccessToken } from "@/providers";
import { COACHING_API_URL } from "@/lib/constants";
import {
	EvaluationSessionStatus,
	PlayerExerciseScoreDto,
	SessionProgressDto,
} from "@/lib/models/Evaluation";

export function useRealtimeEvaluationSession(sessionId: string | null) {
	const applyScoresSubmitted = useEvaluationSessionStore((s) => s.applyScoresSubmitted);
	const applySessionStatusChanged = useEvaluationSessionStore((s) => s.applySessionStatusChanged);
	const setSessionProgress = useEvaluationSessionStore((s) => s.setSessionProgress);
	const setConnectionStatus = useEvaluationSessionStore((s) => s.setConnectionStatus);
	const reset = useEvaluationSessionStore((s) => s.reset);
	const token = useAccessToken();

	const handleConnectionError = useCallback(
		(error?: Error) => {
			console.error("EvaluationSession SignalR connection error:", error);
			setConnectionStatus("disconnected");
		},
		[setConnectionStatus],
	);

	useEffect(() => {
		if (!token || !sessionId) {
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
						baseUrl: COACHING_API_URL,
						hub: "evaluation",
						token,
					},
					{
						onReconnected: async () => {
							setConnectionStatus("connected");
							// Rejoin session group after reconnection
							try {
								await connection.invoke("JoinSession", sessionId);
							} catch (err) {
								console.error("Failed to rejoin session after reconnect:", err);
							}
						},
						onClose: handleConnectionError,
					}
				);

				// Join the session group
				await connection.invoke("JoinSession", sessionId);

				// Set up event handlers
				connection.on("ScoresSubmitted", (score: PlayerExerciseScoreDto) => {
					applyScoresSubmitted(score);
				});

				connection.on("SessionStarted", (status: EvaluationSessionStatus) => {
					applySessionStatusChanged(status);
				});

				connection.on("SessionPaused", (status: EvaluationSessionStatus) => {
					applySessionStatusChanged(status);
				});

				connection.on("SessionResumed", (status: EvaluationSessionStatus) => {
					applySessionStatusChanged(status);
				});

				connection.on("SessionCompleted", (status: EvaluationSessionStatus) => {
					applySessionStatusChanged(status);
				});

				connection.on("ProgressUpdated", (progress: SessionProgressDto) => {
					setSessionProgress(progress);
				});

				connection.on("GroupUpdated", () => {
					// Group changes will be handled by React Query invalidation
				});

				connection.on("JoinedSession", () => {
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
			if (!stopped) {
				stopped = true;
				if (connection?.state !== HubConnectionState.Disconnected) {
					// Leave session group before disconnecting
					connection?.invoke("LeaveSession", sessionId).catch(() => {});
					signalr.stop(COACHING_API_URL, "evaluation");
				}
				reset();
			}
		};
	}, [
		token,
		sessionId,
		applyScoresSubmitted,
		applySessionStatusChanged,
		setSessionProgress,
		setConnectionStatus,
		handleConnectionError,
		reset,
	]);
}
