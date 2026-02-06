"use client";

import { Button } from "@/components";
import EventCommentsSection from "@/components/features/comments/components/EventCommentsSection";
import { TeamsList } from "@/components/features/teams";
import { Modal } from "@/components/ui";
import { respondToInvitation } from "@/lib/api/events";
import { EventType } from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventPaymentConfig";
import { useMutation } from "@tanstack/react-query";
import { ClipboardCheck, MapPin, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import { InvitationSidebarCard } from "./components/InvitationResponseVariants";
import { useEventContext } from "./layout";

// Lazy load Map component - it's below the fold and heavy
const Map = dynamic(() => import("@/components/features/locations").then((mod) => mod.Map), {
	ssr: false,
	loading: () => <div className="h-full w-full bg-background animate-pulse" />,
});

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================
export default function EventOverviewPage() {
	const { event, teams, hasInvitation, myParticipation, refetchMyParticipation, isAdmin } = useEventContext();
	const [showDeclineModal, setShowDeclineModal] = useState(false);
	const [declineNote, setDeclineNote] = useState("");

	const respondMutation = useMutation({
		mutationFn: ({ accept, note }: { accept: boolean; note?: string }) =>
			respondToInvitation(event!.id!, accept, note),
		onSuccess: () => {
			refetchMyParticipation();
		},
		onError: (error) => {
			console.error("Failed to respond to invitation:", error);
		},
	});

	const handleAcceptInvitation = useCallback(() => {
		respondMutation.mutate({ accept: true });
	}, [respondMutation]);

	const handleDeclineInvitation = useCallback((note?: string) => {
		if (note !== undefined) {
			// Direct decline with note
			respondMutation.mutate({ accept: false, note });
		} else {
			// Show modal for note input
			setShowDeclineModal(true);
		}
	}, [respondMutation]);

	const handleConfirmDecline = useCallback(() => {
		respondMutation.mutate({ accept: false, note: declineNote || undefined });
		setShowDeclineModal(false);
		setDeclineNote("");
	}, [declineNote, respondMutation]);

	const handleCloseModal = useCallback(() => setShowDeclineModal(false), []);

	// Get the inviter's name from the participation record
	const inviterName = myParticipation?.invitedByUser
		? `${myParticipation.invitedByUser.firstName} ${myParticipation.invitedByUser.lastName}`.trim() || "Event Organizer"
		: "Event Organizer";

	if (!event) return null;

	// Check if this is a Trial or Evaluation event
	const isTrialOrEvaluation = event.type === EventType.Trial || event.type === EventType.Evaluation;

	return (
		<>
			{/*
				Grid layout with CSS-based responsive positioning:
				- Mobile: sidebar appears first (order-1), main content second (order-2)
				- Desktop: main content left column, sidebar right column
				This allows single InvitationSidebarCard to reposition without duplicate rendering
			*/}
			<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
				{/* Main Content */}
				<div className="order-2 lg:order-1 space-y-6">
					{/* Evaluation Card - Show for Trial/Evaluation events */}
					{isTrialOrEvaluation && (
						<div className="rounded-2xl bg-surface border border-border p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 rounded-lg bg-accent/10 text-accent">
									<ClipboardCheck size={20} />
								</div>
								<h3 className="text-lg font-bold text-white">Player Evaluations</h3>
							</div>

							{isAdmin ? (
								<div className="space-y-3">
									<p className="text-sm text-muted">
										As an organizer, you can evaluate players who attended this {event.type?.toLowerCase()} session.
									</p>
									<Link href={`/dashboard/coach/evaluate?eventId=${event.id}`}>
										<Button color="accent" className="w-full sm:w-auto">
											Evaluate Players
										</Button>
									</Link>
								</div>
							) : (
								<div className="space-y-3">
									<p className="text-sm text-muted">
										After the {event.type?.toLowerCase()}, coaches will share their evaluation and feedback with you.
									</p>
									{/* Mock evaluation status - replace with real data */}
									<div className="p-3 rounded-lg bg-surface border border-border text-sm text-muted">
										Evaluation status: <span className="text-white font-medium">Pending</span>
									</div>
								</div>
							)}
						</div>
					)}

					{/* About Card */}
					{event.description && (
						<div className="rounded-2xl bg-surface border border-border p-6">
							<h3 className="text-lg font-bold text-white mb-4">About This Event</h3>
							<p className="text-muted text-sm leading-relaxed">{event.description}</p>

							{/* Mobile: Clickable address link */}
							{event.location?.address && (
								<Link
									href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location.address)}`}
									target="_blank"
									className="mt-4 flex items-center gap-2 text-sm text-accent hover:underline lg:hidden">
									<MapPin size={16} />
									{event.location.address}
								</Link>
							)}
						</div>
					)}

					{/* Mobile: Standalone address link when no description */}
					{!event.description && event.location?.address && (
						<Link
							href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location.address)}`}
							target="_blank"
							className="flex items-center gap-2 p-4 rounded-2xl bg-surface border border-border text-sm text-accent hover:underline lg:hidden">
							<MapPin size={16} />
							{event.location.address}
						</Link>
					)}

					{/* Teams Preview */}
					<div className="rounded-2xl bg-surface border border-border p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold text-white">Teams</h3>
							<Link href={`/dashboard/events/${event.id}/teams`} className="text-sm text-accent hover:underline">
								View All
							</Link>
						</div>

						{teams && teams.length > 0 ? (
							<TeamsList teams={teams.slice(0, 3)} userId="" isAdmin={false} registrationType={event.registrationUnit || Unit.Individual} />
						) : (
							<div className="text-center py-8 text-muted">
								<Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
								<p>No teams registered yet</p>
							</div>
						)}
					</div>

					{/* Comments Section */}
					<div className="rounded-2xl bg-surface border border-border p-6">
						<EventCommentsSection eventId={event.id!} />
					</div>
				</div>

				{/* Sidebar - appears first on mobile via order, second on desktop */}
				<div className="order-1 lg:order-2 space-y-6">
					{/* Single Invitation card - repositioned via CSS order */}
					{hasInvitation && (
						<InvitationSidebarCard event={event} invitedBy={inviterName} onAccept={handleAcceptInvitation} onDecline={handleDeclineInvitation} />
					)}

					{/* Location Card - hidden on mobile */}
					<div className="hidden lg:block rounded-2xl bg-surface border border-border overflow-hidden">
						<div className="p-4 border-b border-border flex justify-between items-center">
							<h3 className="text-sm font-bold text-white flex items-center gap-2">
								<MapPin size={16} className="text-accent" />
								Location
							</h3>
							{event.location?.address && (
								<Link
									target="_blank"
									href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location.address)}`}
									className="text-xs text-accent hover:underline">
									Get Directions
								</Link>
							)}
						</div>
						<div className="h-40 w-full bg-background relative">
							{event.location?.address ? (
								<div className="h-full w-full [&_.leaflet-container]:z-0">
									<Map defaultAddress={event.location.address} readonly={true} />
								</div>
							) : (
								<div className="h-full w-full flex items-center justify-center text-muted">
									<MapPin className="w-8 h-8 opacity-30" />
								</div>
							)}
						</div>
						{event.location?.address && <div className="p-3 text-xs text-muted bg-background/50">{event.location.address}</div>}
					</div>
				</div>
			</div>

			{/* Decline Invitation Modal */}
			<Modal
				isOpen={showDeclineModal}
				onClose={handleCloseModal}
				title="Decline Invitation"
				description="Let the organizers know why you can't make it (optional)."
				size="sm">
				<textarea
					value={declineNote}
					onChange={(e) => setDeclineNote(e.target.value)}
					placeholder="Add a note..."
					className="w-full h-24 px-4 py-3 rounded-xl bg-background border border-border text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
				/>
				<div className="flex justify-end gap-3 mt-4">
					<Button variant="ghost" color="neutral" onClick={handleCloseModal}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirmDecline}>
						Decline Invitation
					</Button>
				</div>
			</Modal>
		</>
	);
}
