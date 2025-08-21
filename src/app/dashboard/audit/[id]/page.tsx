"use client";

import React, { useEffect, useState } from "react";
import { loadEvent, loadParticipants } from "@/lib/requests/events";
import { notFound } from "next/navigation";
import { useRealtimePayments } from "@/hooks/useRealtimePayments";
import { usePaymentsStore } from "@/lib/realtime/paymentStore";
import signalr from "@/lib/realtime/signalrClient";
import { useAccessToken } from "@/lib/auth/authContext";
import { Event } from "@/lib/models/Event";
import { EventParticipant } from "@/lib/models/EventParticipant";
import AuditParticipantList from "@/components/features/audit/components/AuditParticipantList";
import { Loader } from "@/components/ui";

type AuditPageProps = {
  params: {
    id: string;
  };
};

function AuditPage({ params }: AuditPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAccessToken();

  useRealtimePayments();
  const paymentsStore = usePaymentsStore((s) => s.participants);
  const setPaymentsStore = usePaymentsStore((s) => s.setParticipants);

  useEffect(() => {
    if (!params?.id) {
      notFound();
    }

    const loadData = async () => {
      try {
        const [eventData, participantsData] = await Promise.all([
          loadEvent(params.id),
          loadParticipants(params.id),
        ]);

        if (!eventData) {
          notFound();
        }

        setEvent(eventData);
        setParticipants(participantsData);
        setPaymentsStore(participantsData); // Initialize the store with participant data
        setLoading(false);

        // Join the event's payment group
        if (token) {
          try {
            const connection = await signalr.start("payments", token);
            await connection.invoke("JoinEventGroup", params.id);
          } catch (error) {
            console.error("Failed to join event group:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, token, setPaymentsStore]);

  if (loading) {
    return <Loader className="absolute inset-0" />;
  }

  if (!event) {
    return <div className="p-4">Event not found</div>;
  }

  // Use real-time data if available, otherwise fall back to initial data
  const displayParticipants = participants.map((p) => ({
    ...p,
    ...paymentsStore[p.id], // Override with real-time data if available
  }));

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="text-2xl font-bold">Participants</div>
      <AuditParticipantList event={event} participants={displayParticipants} />
    </div>
  );
}

export default AuditPage;
