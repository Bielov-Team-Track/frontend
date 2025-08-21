"use client";

import { useEffect, useCallback } from "react";
import signalr from "@/lib/realtime/signalrClient";
import { usePositionStore } from "@/lib/realtime/positionStore";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useAccessToken } from "@/lib/auth/authContext";

export function useRealtimePositions() {
  const applyTaken = usePositionStore((s) => s.applyTaken);
  const applyReleased = usePositionStore((s) => s.applyReleased);
  const setConnectionStatus = usePositionStore((s) => s.setConnectionStatus);
  const token = useAccessToken(); // Get token at hook level

  const handleConnectionError = useCallback(
    (error?: Error) => {
      console.error("SignalR connection error:", error);
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
        connection = await signalr.start(token, "positions");

        // Set up event handlers
        connection.on(
          "PositionTaken",
          (payload: { positionId: string; userId: string }) => {
            console.log("Position taken:", payload);
            applyTaken(payload.positionId, payload.userId);
          }
        );

        connection.on(
          "PositionReleased",
          (payload: { positionId: string; userId: string }) => {
            console.log("Position released:", payload);
            applyReleased(payload.positionId);
          }
        );

        connection.on("Connected", (payload: { connectionId: string }) => {
          console.log("SignalR connected:", payload.connectionId);
          setConnectionStatus("connected");
        });

        // Connection state handlers
        connection.onreconnecting(() => {
          console.log("SignalR reconnecting...");
          setConnectionStatus("reconnecting");
        });

        connection.onreconnected(() => {
          console.log("SignalR reconnected");
          setConnectionStatus("connected");
          // Position sync will be handled by signalr client callback
        });

        // Set up position sync callback
        signalr.setSyncCallback(async () => {
          console.log("Syncing positions after reconnection");
          // This could trigger a refresh of all positions for the current page
          // For now, we'll let the components handle their own refresh
        });

        connection.onclose(handleConnectionError);
      } catch (error) {
        handleConnectionError(error as Error);
      }
    };

    start();

    return () => {
      if (!stopped && connection?.state !== HubConnectionState.Disconnected) {
        signalr.stop();
        stopped = true;
      }
    };
  }, [
    token,
    applyTaken,
    applyReleased,
    setConnectionStatus,
    handleConnectionError,
  ]);
}
