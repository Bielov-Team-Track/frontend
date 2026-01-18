"use client";

import { Avatar, Button } from "@/components";
import CommentsSection from "@/components/features/comments/components/CommentsSection";
import { Map } from "@/components/features/locations";
import { TeamsList } from "@/components/features/teams";
import { Unit } from "@/lib/models/EventBudget";
import { Check, MapPin, MessageSquare, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useEventContext } from "./layout";

export default function EventOverviewPage() {
	const { event, teams, hasInvitation } = useEventContext();
	const [showDeclineModal, setShowDeclineModal] = useState(false);
	const [declineNote, setDeclineNote] = useState("");

	if (!event) return null;

	const handleAcceptInvitation = () => {
		// TODO: Implement accept invitation API call
		console.log("Accept invitation");
	};

	const handleDeclineInvitation = () => {
		// TODO: Implement decline invitation API call with note
		console.log("Decline invitation with note:", declineNote);
		setShowDeclineModal(false);
		setDeclineNote("");
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Main Content - 2 columns */}
			<div className="lg:col-span-2 space-y-6">
				{/* Invitation Panel */}
				{hasInvitation && (
					<div className="rounded-2xl bg-accent/10 border border-accent/30 p-6">
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
								<Users size={24} className="text-accent" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-bold text-white mb-1">You're Invited!</h3>
								<p className="text-sm text-muted mb-4">You have been invited to participate in this event. Would you like to join?</p>
								<div className="flex items-center gap-3">
									<Button variant="default" color="primary" leftIcon={<Check size={16} />} onClick={handleAcceptInvitation}>
										Accept
									</Button>
									<Button variant="ghost" color="neutral" leftIcon={<X size={16} />} onClick={() => setShowDeclineModal(true)}>
										Decline
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* About Card - only show if description exists */}
				{event.description && (
					<div className="rounded-2xl bg-white/5 border border-white/10 p-6">
						<h3 className="text-lg font-bold text-white mb-4">About This Event</h3>
						<p className="text-muted text-sm leading-relaxed">{event.description}</p>
					</div>
				)}

				{/* Teams Preview */}
				<div className="rounded-2xl bg-white/5 border border-white/10 p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-bold text-white">Teams</h3>
						<Link href={`/dashboard/events/${event.id}/prototype/teams`} className="text-sm text-accent hover:underline">
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
				<div className="rounded-2xl bg-white/5 border border-white/10 p-6">
					<div className="flex items-center gap-2 mb-4">
						<MessageSquare size={20} className="text-accent" />
						<h3 className="text-lg font-bold text-white">Comments</h3>
					</div>
					<CommentsSection eventId={event.id!} />
				</div>
			</div>

			{/* Sidebar - 1 column */}
			<div className="space-y-6">
				{/* Location Card */}
				<div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
					<div className="p-4 border-b border-white/10 flex justify-between items-center">
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

				{/* Organizers Card */}
				{event.admins && event.admins.length > 0 && (
					<div className="rounded-2xl bg-white/5 border border-white/10 p-5">
						<h3 className="text-sm font-bold text-white mb-4">Organizers</h3>
						<div className="space-y-3">
							{event.admins.map((admin) => (
								<Link key={admin.userId} href={`/profiles/${admin.userId}`} className="flex items-center gap-3 group">
									<Avatar name={`${admin.name} ${admin.surname}`} src={admin.imageUrl} />
									<div>
										<div className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
											{admin.name} {admin.surname}
										</div>
										<div className="text-xs text-muted">Event Admin</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Decline Invitation Modal */}
			{showDeclineModal && (
				<>
					<div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowDeclineModal(false)} />
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div className="bg-raised border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
							<h3 className="text-lg font-bold text-white mb-2">Decline Invitation</h3>
							<p className="text-sm text-muted mb-4">Let the organizers know why you can't make it (optional).</p>
							<textarea
								value={declineNote}
								onChange={(e) => setDeclineNote(e.target.value)}
								placeholder="Add a note..."
								className="w-full h-24 px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
							/>
							<div className="flex justify-end gap-3 mt-4">
								<Button variant="ghost" color="neutral" onClick={() => setShowDeclineModal(false)}>
									Cancel
								</Button>
								<Button variant="solid" color="error" onClick={handleDeclineInvitation}>
									Decline Invitation
								</Button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
