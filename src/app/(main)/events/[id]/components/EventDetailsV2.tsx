"use client";

import CommentsSection from "@/components/features/comments/components/CommentsSection";
import { EventPaymentCard } from "@/components/features/events";
import { Map } from "@/components/features/locations";
import { TeamsList } from "@/components/features/teams";
import { Event } from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventBudget";
import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import { Team } from "@/lib/models/Team";
import { UserProfile } from "@/lib/models/User";
import { getDuration, getFormattedDateWithDay, getFormattedTime } from "@/lib/utils/date";
import { AlertTriangle, Clock, MapPin, Share2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import EventPageButtons from "./EventPageButtons";

type EventDetailsV2Props = {
	event: Event;
	user: UserProfile;
	isAdmin: boolean;
	teams: Team[];
	userParticipant?: EventParticipant | null;
	paymentsSection: React.ReactNode;
	positionsRealtime: React.ReactNode;
};

export default function EventDetailsV2({ event, user, isAdmin, teams, userParticipant, paymentsSection, positionsRealtime }: EventDetailsV2Props) {
	const [activeTab, setActiveTab] = useState("overview");

	// Helpers
	const startDate = new Date(event.startTime);
	const day = startDate.getDate().toString().padStart(2, "0");
	const month = startDate.toLocaleString("default", { month: "short" }).toUpperCase();
	const duration = getDuration(event.startTime, event.endTime);

	// Extract participant IDs from teams for messaging
	const participantIds = teams
		.flatMap((team) => (team.positions ?? []).filter((pos) => pos.eventParticipant?.userId).map((pos) => pos.eventParticipant!.userId))
		.filter((id, index, self) => self.indexOf(id) === index); // unique IDs

	return (
		<div className="min-h-screen bg-background text-white font-sans pb-20">
			{/* --- HERO SECTION --- */}
			<div className="relative w-full">
				{/* Banner & Gradient */}
				<div className="h-56 md:h-80 w-full relative overflow-hidden bg-background-light">
					{/* Placeholder Gradient if no image (Event model doesn't seem to have bannerUrl yet) */}
					<div className="absolute inset-0 bg-linear-to-br from-primary/20 via-background-dark to-accent/10" />
					<div className="absolute inset-0 bg-linear-to-t from-background-dark via-background-dark/60 to-transparent" />
				</div>

				{/* Event Header Content */}
				<div className="max-w-desktop mx-auto px-4 sm:px-6 relative -mt-20 md:-mt-32 flex flex-col md:flex-row items-end gap-6">
					{/* Date Badge */}
					<div className="relative hidden md:flex flex-col items-center justify-center w-32 h-32 rounded-2xl bg-background-light border-4 border-background-dark shadow-2xl">
						<span className="text-4xl font-black text-accent">{day}</span>
						<span className="text-lg font-bold text-muted uppercase tracking-wider">{month}</span>
					</div>

					{/* Title & Info */}
					<div className="flex-1 mb-2 w-full">
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2">
								<span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20 text-xs font-bold uppercase">
									{event.type || "Event"}
								</span>
								{event.canceled && (
									<span className="px-2 py-0.5 rounded bg-error/20 text-error border border-error/20 text-xs font-bold uppercase flex items-center gap-1">
										<AlertTriangle size={12} /> Canceled
									</span>
								)}
							</div>
							<h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">{event.name}</h1>
							<p className="text-muted text-sm md:text-base flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
								<span className="flex items-center gap-1.5 text-white">
									<Clock size={16} className="text-accent" />
									{getFormattedTime(event.startTime)} - {getFormattedTime(event.endTime)}
									<span className="text-muted">({duration})</span>
								</span>
								<span className="w-1 h-1 bg-muted rounded-full hidden sm:block" />
								<span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
									<MapPin size={16} className="text-accent" />
									{event.location?.address || "TBD"}
								</span>
							</p>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3 mb-4 w-full md:w-auto mt-4 md:mt-0 items-center">
						{isAdmin && (
							<div className="mr-2">
								<EventPageButtons event={event} participantIds={participantIds} />
							</div>
						)}
						<button className="btn btn-square btn-ghost bg-white/5 hover:bg-white/10 border border-white/10 text-white">
							<Share2 size={18} />
						</button>
					</div>
				</div>
			</div>

			{/* --- REALTIME POSITIONS (Hidden but active) --- */}
			<div className="hidden">{positionsRealtime}</div>

			{/* --- CONTENT GRID --- */}
			<div className="max-w-desktop mx-auto px-4 sm:px-6 mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* --- LEFT SIDEBAR (Details & Admin) --- */}
				<div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
					{/* Status Card (Mobile Date) */}
					<div className="md:hidden p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
						<div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-background-light border border-white/10">
							<span className="text-xl font-bold text-accent">{day}</span>
							<span className="text-[10px] font-bold text-muted uppercase">{month}</span>
						</div>
						<div>
							<div className="text-sm font-medium text-white">Date & Time</div>
							<div className="text-xs text-muted">{getFormattedDateWithDay(event.startTime)}</div>
						</div>
					</div>

					{/* Location Map */}
					<div className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
						<div className="p-4 border-b border-white/5 flex justify-between items-center">
							<h3 className="text-sm font-bold text-white flex items-center gap-2">
								<MapPin size={16} className="text-accent" /> Location
							</h3>
							{event.location?.address && (
								<Link
									target="_blank"
									href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location.address!)}`}
									className="text-xs text-primary hover:underline">
									Get Directions
								</Link>
							)}
						</div>
						<div className="h-48 w-full bg-gray-800 relative">
							{event.location?.address ? (
								<div className="h-full w-full [&_.leaflet-container]:z-0">
									<Map defaultAddress={event.location.address} readonly={true} />
								</div>
							) : (
								<div className="h-full w-full flex items-center justify-center text-muted">Map Unavailable</div>
							)}
						</div>
						{event.location?.address && <div className="p-3 text-xs text-muted bg-background/50">{event.location.address}</div>}
					</div>
				</div>

				{/* --- RIGHT MAIN CONTENT (Tabs) --- */}
				<div className="lg:col-span-8 order-1 lg:order-2">
					{/* Tabs Navigation */}
					<div className="flex items-center border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
						{["overview", "teams", "payments", "comments"].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`
                  px-6 pb-4 text-sm font-bold capitalize relative transition-colors whitespace-nowrap
                  ${activeTab === tab ? "text-accent" : "text-muted hover:text-white"}
                `}>
								{tab}
								{activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full z-10" />}
							</button>
						))}
					</div>

					{/* Tab Content */}
					<div className="animate-in fade-in duration-300 space-y-6">
						{/* OVERVIEW TAB */}
						{activeTab === "overview" && (
							<>
								{/* Pay to Join Card - shown when payment is required and user hasn't paid */}
								{event.budget?.payToJoin && (
									<EventPaymentCard
										event={event}
										userParticipant={userParticipant}
										isInvited={userParticipant?.status === ParticipationStatus.Invited}
									/>
								)}

								<div className="p-6 rounded-2xl bg-white/5 border border-white/5">
									<h3 className="text-lg font-bold text-white mb-3">About Event</h3>
									<div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
										{event.description || "No description provided."}
									</div>
								</div>

								{/* Registration Info / Quick Stats */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
									<div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
										<div className="text-xs text-muted uppercase font-bold mb-1">Teams</div>
										<div className="text-2xl font-black text-white">{teams.length}</div>
									</div>
									<div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
										<div className="text-xs text-muted uppercase font-bold mb-1">Format</div>
										<div className="text-lg font-bold text-white truncate">
											{event.registrationUnit === Unit.Team ? "Team" : "Individual"}
										</div>
									</div>
									<div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
										<div className="text-xs text-muted uppercase font-bold mb-1">Cost</div>
										<div className="text-lg font-bold text-accent">
											{event.budget ? `${event.budget.currency || "£"}${event.budget.cost}` : "Free"}
										</div>
									</div>
									<div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
										<div className="text-xs text-muted uppercase font-bold mb-1">Status</div>
										<div className="text-lg font-bold text-white capitalize">{event.canceled ? "Canceled" : "Active"}</div>
									</div>
								</div>
							</>
						)}

						{/* TEAMS TAB */}
						{activeTab === "teams" && (
							<div className="space-y-4">
								<div className="flex justify-between items-center mb-2">
									<h3 className="text-lg font-bold text-white">Registered Teams</h3>
								</div>
								{teams && teams.length > 0 ? (
									<TeamsList teams={teams} userId={user?.id} isAdmin={isAdmin} registrationType={event.registrationUnit} />
								) : (
									<div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed text-muted">
										<Users size={48} className="mx-auto mb-4 opacity-50" />
										<p>No teams registered yet.</p>
									</div>
								)}
							</div>
						)}

						{/* PAYMENTS TAB */}
						{activeTab === "payments" && <div className="space-y-4">{paymentsSection}</div>}

						{/* COMMENTS TAB */}
						{activeTab === "comments" && (
							<div className="space-y-4">
								<CommentsSection eventId={event.id!} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
