import { claimPosition, getPosition, releasePosition, takePositionWithUser } from "@/lib/api/positions";
import { EVENTS_API_URL } from "@/lib/constants";
import { Position } from "@/lib/models/Position";
import { UserProfile } from "@/lib/models/User";
import { usePositionStore } from "@/lib/realtime/positionStore";
import signalr from "@/lib/realtime/signalrClient";
import { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Helper to extract error message from API errors
function getPositionErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof AxiosError) {
		if (error.response?.status === 401) {
			return "You're not authorized for this action";
		}
		return error.response?.data?.message || error.message || fallback;
	}
	if (error instanceof Error) {
		if (error.message?.includes("Position already taken") || error.message?.includes("already claimed")) {
			return "Position was just taken by someone else";
		}
		if (error.message?.includes("Connection")) {
			return "Connection lost. Please try again.";
		}
		return error.message || fallback;
	}
	return fallback;
}

export function usePosition(defaultPosition: Position, profile: UserProfile | null) {
	const [position, setPosition] = useState<Position>(defaultPosition);
	const [isConfirming, setIsConfirming] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const applyTakenWithRollback = usePositionStore((s) => s.applyTakenWithRollback);
	const connectionStatus = usePositionStore((s) => s.connectionStatus);
	const positionStore = usePositionStore((s) => s.positions);

	// Sync with global store
	useEffect(() => {
		const storePosition = positionStore[defaultPosition.id];
		if (storePosition) {
			setPosition(storePosition);
		}
	}, [positionStore, defaultPosition.id]);

	const confirmPosition = () => {
		setIsConfirming(true);
	};

	const cancel = () => {
		setIsConfirming(false);
	};

	const takePosition = useCallback(async () => {
		if (!profile?.id) {
			redirect("/login");
		}

		setIsConfirming(false);
		setIsLoading(true);
		setError(null);

		// Use rollback mechanism for optimistic updates
		const rollback = applyTakenWithRollback(position.id, profile.id);
		try {
			// Try SignalR first for real-time updates
			const connection = signalr.getConnection(EVENTS_API_URL, "position");
			if (connection && connectionStatus === "connected") {
				await connection.invoke("TakePosition", position.id);
				// SignalR will handle the real-time update - no need to refresh
			} else {
				// Fallback to REST API if SignalR not available
				await claimPosition(position.id);
				// Only refresh from server when using REST API
				const refreshed = await getPosition(position.id);
				setPosition(refreshed);
			}
		} catch (error) {
			// Rollback optimistic update
			rollback();
			const errorMessage = connectionStatus !== "connected"
				? "Connection lost. Please try again."
				: getPositionErrorMessage(error, "Failed to take position");
			console.error("Take position error:", error);
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [position.id, profile, applyTakenWithRollback, connectionStatus]);

	const leavePosition = useCallback(async () => {
		if (!profile?.id) {
			setError("User not authenticated");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Try SignalR first
			const connection = signalr.getConnection(EVENTS_API_URL, "position");
			if (connection && connectionStatus === "connected") {
				await connection.invoke("ReleasePosition", position.id);
				// SignalR will handle the real-time update - no need to refresh
			} else {
				// Fallback to REST API
				await releasePosition(position.id);
				// Only refresh from server when using REST API
				const refreshed = await getPosition(position.id);
				setPosition(refreshed);
			}
		} catch (error) {
			const errorMessage = connectionStatus !== "connected"
				? "Connection lost. Please try again."
				: getPositionErrorMessage(error, "Failed to release position");
			setError(errorMessage);
			console.error("Release position error:", error);
		} finally {
			setIsLoading(false);
		}
	}, [position.id, profile, connectionStatus]);

	const assignPosition = useCallback(
		async (targetUser: UserProfile) => {
			if (!targetUser.id || !profile?.id) {
				setError("Invalid user data");
				return;
			}

			setIsLoading(true);
			setError(null);
			try {
				const newPosition = await takePositionWithUser(position.id, targetUser.id);
				setPosition(newPosition);
			} catch (error) {
				const errorMessage = getPositionErrorMessage(error, "Failed to assign position");
				setError(errorMessage);
				console.error("Assign position error:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[position.id, profile?.id],
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		position,
		isLoading,
		isConfirming,
		error,
		connectionStatus,
		confirmPosition,
		cancel,
		assignPosition,
		takePosition,
		leavePosition,
		clearError,
	};
}
