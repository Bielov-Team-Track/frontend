"use client";

import React, { use, useEffect, useState } from "react";
import { loadEvent, loadParticipants } from "@/lib/api/events";
import { notFound } from "next/navigation";
import { useRealtimePayments } from "@/hooks/useRealtimePayments";
import { usePaymentsStore } from "@/lib/realtime/paymentStore";
import signalr from "@/lib/realtime/signalrClient";
import { useAccessToken } from "@/providers";
import { Event, EventFormat, EventType } from "@/lib/models/Event";
import { EventParticipant } from "@/lib/models/EventParticipant";
import AuditParticipantList from "@/components/features/audit/components/AuditParticipantList";
import { Loader } from "@/components/ui";
import AuditTeamsList from "@/components/features/audit/components/AuditTeamsList";
import { EVENTS_API_URL } from "@/lib/constants";

type AuditPageProps = {
	params: Promise<{
		id: string;
	}>;
};

function AuditPage({ params }: AuditPageProps) {
	const [event, setEvent] = useState<Event | null>(null);
	const [participants, setParticipants] = useState<EventParticipant[]>([]);
	const [loading, setLoading] = useState(true);
	const token = useAccessToken();
	const parameters = use(params);

	useRealtimePayments();
	const paymentsStore = usePaymentsStore((s) => s.participants);
	const setPaymentsStore = usePaymentsStore((s) => s.setParticipants);

	useEffect(() => {
		if (!parameters?.id) {
			notFound();
		}

		const loadData = async () => {
			try {
				const [eventData, participantsData] = await Promise.all([
					loadEvent(parameters.id),
					loadParticipants(parameters.id),
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
						const connection = await signalr.start({
							baseUrl: EVENTS_API_URL,
							hub: "payments",
							token,
						});
						await connection.invoke("JoinEventGroup", parameters.id);
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
	}, [parameters.id, token, setPaymentsStore]);

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
			{(event.eventFormat == EventFormat.List || !event.eventFormat) && (
				<>
					<div className="text-2xl font-bold">Participants</div>
					<AuditParticipantList
						event={event}
						participants={displayParticipants}
					/>
				</>
			)}
			{(event.eventFormat == EventFormat.OpenTeams ||
				event.eventFormat == EventFormat.TeamsWithPositions) && (
				<>
					<div className="text-2xl font-bold">Participants</div>
					<AuditTeamsList event={event} />
				</>
			)}
		</div>
	);
}

export default AuditPage;
