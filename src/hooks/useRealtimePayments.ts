"use client";

import { useEffect, useCallback } from "react";
import signalr from "@/lib/realtime/signalrClient";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { useAccessToken } from "@/lib/auth/authContext";
import { usePaymentsStore } from "@/lib/realtime/paymentStore";

export function useRealtimePayments() {
  const applyPaymentReceived = usePaymentsStore((s) => s.applyPaymentReceived);
  const setConnectionStatus = usePaymentsStore((s) => s.setConnectionStatus);
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
        connection = await signalr.start("payments", token);

        // Set up event handlers
        connection.on(
          "PaymentReceived",
          (payload: { participantId: string }) => {
            applyPaymentReceived(payload.participantId);
          }
        );

        connection.on("Connected", (payload: { connectionId: string }) => {
          setConnectionStatus("connected");
        });

        // Connection state handlers
        connection.onreconnecting(() => {
          setConnectionStatus("reconnecting");
        });

        connection.onreconnected(() => {
          setConnectionStatus("connected");
        });

        signalr.setSyncCallback(async () => {});

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
  }, [token, applyPaymentReceived, setConnectionStatus, handleConnectionError]);
}
