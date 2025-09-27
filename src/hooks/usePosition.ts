import { useState, useCallback, useEffect } from "react";
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
import { redirect } from "next/navigation";

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
    console.log("Attempting to take position:", position.id);
    if (!profile?.userId) {
      redirect("/login");
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
        // SignalR will handle the real-time update - no need to refresh
      } else {
        // Fallback to REST API if SignalR not available
        await claimPosition(position.id);
        // Only refresh from server when using REST API
        const refreshed = await getPosition(position.id);
        setPosition(refreshed);
      }
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
      console.error("Take position error:", error);
      setError(errorMessage);
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
        // SignalR will handle the real-time update - no need to refresh
      } else {
        // Fallback to REST API
        await releasePosition(position.id);
        // Only refresh from server when using REST API
        const refreshed = await getPosition(position.id);
        setPosition(refreshed);
      }
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
      console.log("Assigning position to user:", targetUser);
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
