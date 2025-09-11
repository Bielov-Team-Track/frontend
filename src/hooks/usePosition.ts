import { useState, useCallback } from "react";
import { Position } from "@/lib/models/Position";
import {
  takePositionWithUser,
  releasePosition,
  getPosition,
  claimPosition,
} from "@/lib/requests/positions";
import { usePositionStore } from "@/lib/realtime/positionStore";
import signalr from "@/lib/realtime/signalrClient";
import { UserProfile } from "@/lib/models/User";

export function usePosition(
  defaultPosition: Position,
  profile: UserProfile | null
) {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const applyTakenWithRollback = usePositionStore(
    (s) => s.applyTakenWithRollback
  );
  const connectionStatus = usePositionStore((s) => s.connectionStatus);

  const confirmPosition = () => {
    setIsConfirming(true);
  };

  const cancel = () => {
    setIsConfirming(false);
  };

  const takePosition = useCallback(async () => {
    console.log("Taking position:", position.id);
    console.log("User", profile);
    if (!profile?.userId) {
      setError("User not authenticated");
      return;
    }

    setIsConfirming(false);
    setIsLoading(true);
    setError(null);

    // Use rollback mechanism for optimistic updates
    const rollback = applyTakenWithRollback(position.id, profile.userId);

    try {
      // Try SignalR first for real-time updates
      const connection = signalr.getConnection();
      if (connection && connectionStatus === "connected") {
        await connection.invoke("TakePosition", position.id);
        // SignalR will handle the real-time update
      } else {
        // Fallback to REST API if SignalR not available
        await claimPosition(position.id);
      }

      // Refresh position state from server
      const refreshed = await getPosition(position.id);
      setPosition(refreshed);
    } catch (error: any) {
      // Rollback optimistic update
      rollback();

      let errorMessage = "Failed to take position";
      if (
        error.message?.includes("Position already taken") ||
        error.message?.includes("already claimed")
      ) {
        errorMessage = "Position was just taken by someone else";
      } else if (
        error.message?.includes("Connection") ||
        connectionStatus !== "connected"
      ) {
        errorMessage = "Connection lost. Please try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "You're not authorized to take this position";
      }

      setError(errorMessage);
      console.error("Take position error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [position.id, profile, applyTakenWithRollback, connectionStatus]);

  const leavePosition = useCallback(async () => {
    if (!profile!.userId) {
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try SignalR first
      const connection = signalr.getConnection();
      if (connection && connectionStatus === "connected") {
        await connection.invoke("ReleasePosition", position.id);
      } else {
        // Fallback to REST API
        await releasePosition(position.id);
      }

      // Refresh position state
      const refreshed = await getPosition(position.id);
      setPosition(refreshed);
    } catch (error: any) {
      let errorMessage = "Failed to release position";
      if (error.response?.status === 401) {
        errorMessage = "You're not authorized to release this position";
      } else if (connectionStatus !== "connected") {
        errorMessage = "Connection lost. Please try again.";
      }

      setError(errorMessage);
      console.error("Release position error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [position.id, profile, connectionStatus]);

  const assignPosition = useCallback(
    async (targetUser: UserProfile) => {
      if (!targetUser.userId || !profile?.userId) {
        setError("Invalid user data");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const newPosition = await takePositionWithUser(
          position.id,
          targetUser.userId
        );
        setPosition(newPosition);
      } catch (error: any) {
        let errorMessage = "Failed to assign position";
        if (error.response?.status === 401) {
          errorMessage = "You're not authorized to assign this position";
        } else if (error.message?.includes("Position already taken")) {
          errorMessage = "Position was just taken by someone else";
        }

        setError(errorMessage);
        console.error("Assign position error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [position.id, profile?.userId]
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
