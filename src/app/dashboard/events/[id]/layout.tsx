"use client";

import { Button } from "@/components";
import { getMyParticipation, loadEvent, loadParticipants } from "@/lib/api/events";
import { loadTeams } from "@/lib/api/teams";
import { Event, EventType } from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventPaymentConfig";
import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import { Team } from "@/lib/models/Team";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, ClipboardList, CreditCard, Edit, MapPin, MessageCircle, MoreHorizontal, Settings, Share2, Trash2, Users, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";
import EventContextBadge from "./components/EventContextBadge";
import EventOrganizers from "./components/EventOrganizers";

// Context to share event data with child pages
interface EventContextValue {
	eventId: string;
	event: Event | undefined;
	teams: Team[];
	participants: EventParticipant[];
	myParticipation: EventParticipant | null | undefined;
	isLoading: boolean;
	isAdmin: boolean;
	isOpen: boolean;
	isFull: boolean;
	hasInvitation: boolean;
	refetchMyParticipation: () => void;
}

const EventContext = createContext<EventContextValue | null>(null);

export function useEventContext() {
	const context = useContext(EventContext);
	if (!context) {
		throw new Error("useEventContext must be used within EventLayout");
	}
	return context;
}

type TabType = "overview" | "teams" | "members" | "training" | "payments" | "settings";

interface TabConfig {
	id: TabType;
	label: string;
	icon: typeof Calendar;
	href: string;
	trainingOnly?: boolean;
	teamsOnly?: boolean;
}

const TABS: TabConfig[] = [
	{ id: "overview", label: "Overview", icon: Calendar, href: "" },
	{ id: "teams", label: "Teams", icon: Users, href: "/teams", teamsOnly: true },
	{ id: "members", label: "Members", icon: Users, href: "/members" },
	{ id: "training", label: "Training Plan", icon: ClipboardList, href: "/training", trainingOnly: true },
	{ id: "payments", label: "Payments", icon: CreditCard, href: "/payments" },
	{ id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export default function EventPrototypeLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const eventId = params.id as string;

	const [bannerError, setBannerError] = useState(false);
	const [showAdminMenu, setShowAdminMenu] = useState(false);

	// Determine active tab from pathname
	const getActiveTab = (): TabType => {
		if (pathname.includes("/settings")) return "settings";
		if (pathname.includes("/teams")) return "teams";
		if (pathname.includes("/members")) return "members";
		if (pathname.includes("/training")) return "training";
		if (pathname.includes("/payments")) return "payments";
		return "overview";
	};

	const activeTab = getActiveTab();

	// Queries
	const { data: event, isLoading: eventLoading } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => loadEvent(eventId),
	});

	const { data: teams = [] } = useQuery({
		queryKey: ["event-teams", eventId],
		queryFn: () => loadTeams(eventId),
		enabled: !!eventId,
	});

	const { data: participants = [] } = useQuery({
		queryKey: ["event-participants", eventId],
		queryFn: () => loadParticipants(eventId),
		enabled: !!eventId,
	});

	const { data: myParticipation, refetch: refetchMyParticipation } = useQuery({
		queryKey: ["event-my-participation", eventId],
		queryFn: () => getMyParticipation(eventId),
		enabled: !!eventId,
	});

	// Get tab counts
	const getTabCount = (tabId: TabType): number | undefined => {
		switch (tabId) {
			case "teams":
				return teams.length;
			case "members":
				return participants.length;
			default:
				return undefined;
		}
	};

	// Get tab href
	const getTabHref = (tabId: TabType): string => {
		const base = `/dashboard/events/${eventId}`;
		const tab = TABS.find((t) => t.id === tabId);
		return `${base}${tab?.href || ""}`;
	};

	// Calculate event state
	const totalParticipants = participants.length;
	const totalSpots = teams.reduce((sum, t) => sum + (t.positions?.length || 0), 0);
	const isAdmin = myParticipation?.role === "Organizer" || myParticipation?.role === "Admin" || myParticipation?.role === "Owner";
	const isOpen = !event?.canceled && new Date(event?.startTime || 0) > new Date();
	const isFull = totalSpots > 0 && totalParticipants >= totalSpots;
	// API may return status as string or enum value
	const hasInvitation = myParticipation?.status === ParticipationStatus.Invited;

	// Memoize context value to prevent unnecessary re-renders of consumers
	// Must be before early returns to maintain hook order
	const contextValue = useMemo(
		() => ({
			eventId,
			event,
			teams,
			participants,
			myParticipation,
			isLoading: eventLoading,
			isAdmin,
			isOpen,
			isFull,
			hasInvitation,
			refetchMyParticipation,
		}),
		[eventId, event, teams, participants, myParticipation, eventLoading, isAdmin, isOpen, isFull, hasInvitation, refetchMyParticipation]
	);

	// Loading state
	if (eventLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	// Not found state
	if (!event) {
		return (
			<div className="text-center py-20">
				<Calendar className="w-16 h-16 text-muted mx-auto mb-4" />
				<h2 className="text-xl font-bold text-white mb-2">Event not found</h2>
				<Link href="/dashboard/events" className="text-accent hover:underline">
					Back to events
				</Link>
			</div>
		);
	}

	const startDate = new Date(event.startTime);

	return (
		<EventContext.Provider value={contextValue}>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link href="/dashboard/events" className="p-2 rounded-lg bg-surface hover:bg-hover transition-colors">
						<ArrowLeft size={20} />
					</Link>
					<div className="flex-1">
						<h1 className="text-2xl font-bold text-white">{event.name}</h1>
						<p className="text-sm text-muted">Event Management</p>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-2">
						{/* Join/Register Button - only if open */}
						{isOpen && !isFull && <Button color="primary">Join Event</Button>}

						{/* Waitlist Button - if full */}
						{isOpen && isFull && (
							<Button variant="outline" color="primary">
								Join Waitlist
							</Button>
						)}

						{/* Message Hosts */}
						<Button variant="ghost" color="neutral" leftIcon={<MessageCircle size={16} />}>
							<span className="hidden sm:inline">Message</span>
						</Button>

						{/* Share */}
						<Button variant="ghost" color="neutral" className="p-2">
							<Share2 size={18} />
						</Button>

						{/* Admin Menu */}
						{isAdmin && (
							<div className="relative">
								<Button variant="ghost" color="neutral" className="p-2" onClick={() => setShowAdminMenu(!showAdminMenu)}>
									<MoreHorizontal size={18} />
								</Button>

								{showAdminMenu && (
									<>
										<div className="fixed inset-0 z-40" onClick={() => setShowAdminMenu(false)} />
										<div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-raised border border-border shadow-xl z-50 py-1">
											<button className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-surface flex items-center gap-3">
												<Edit size={16} className="text-muted" />
												Edit Event
											</button>
											<button className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-surface flex items-center gap-3">
												<MessageCircle size={16} className="text-muted" />
												Message All
											</button>
											<div className="border-t border-border my-1" />
											<button className="w-full px-4 py-2.5 text-left text-sm text-warning hover:bg-surface flex items-center gap-3">
												<XCircle size={16} />
												Cancel Event
											</button>
											<button className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-surface flex items-center gap-3">
												<Trash2 size={16} />
												Delete Event
											</button>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Event Banner and Info Card */}
				<div className="rounded-2xl overflow-hidden border border-border bg-surface">
					{/* Banner */}
					<div className="h-48 md:h-60 relative bg-gradient-to-r from-accent/20 to-secondary/20 overflow-hidden">
						{event.imageUrl && !bannerError && (
							<>
								<Image src={event.imageUrl} alt="" fill className="object-cover" onError={() => setBannerError(true)} />
								<div className="absolute inset-0 bg-overlay-light" />
							</>
						)}
					</div>

					{/* Info Row */}
					<div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
						{/* Date Badge */}
						<div className="-mt-20 md:-mt-16 relative z-10 self-start">
							<div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-background border-4 border-background flex flex-col items-center justify-center shadow-xl">
								<span className="text-3xl md:text-4xl font-extrabold text-accent leading-none">{format(startDate, "dd")}</span>
								<span className="text-sm font-bold text-muted uppercase mt-1">{format(startDate, "MMM")}</span>
								<span className="text-xs text-muted/70">{format(startDate, "yyyy")}</span>
							</div>
						</div>

						{/* Details */}
						<div className="flex-1 min-w-0 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<span className="px-2 py-1 rounded-lg bg-secondary/20 text-secondary border border-secondary/30 text-xs font-bold uppercase">
									{event.type || "Event"}
								</span>
								{event.canceled && (
									<span className="px-2 py-1 rounded-lg bg-error/20 text-error border border-error/30 text-xs font-bold uppercase">
										Canceled
									</span>
								)}
								{isFull && !event.canceled && (
									<span className="px-2 py-1 rounded-lg bg-warning/20 text-warning border border-warning/30 text-xs font-bold uppercase">
										Full
									</span>
								)}
								{/* Event Context Badge */}
								<EventContextBadge contextId={event.contextId} contextType={event.contextType} />
							</div>
							<h2 className="text-xl font-bold text-white truncate">{event.name}</h2>
							<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
								<span className="flex items-center gap-1.5">
									<Clock size={14} className="text-accent" />
									{format(startDate, "HH:mm")} - {format(new Date(event.endTime), "HH:mm")}
								</span>
								{event.location?.address && (
									<span className="flex items-center gap-1.5">
										<MapPin size={14} className="text-accent" />
										{event.location.address}
									</span>
								)}
								{/* Organizers Display - inline with other meta */}
								<div className="flex items-center gap-1.5 border-l border-border pl-4 ml-1">
									<EventOrganizers participants={participants} />
								</div>
							</div>
						</div>

						{/* Quick Stats */}
						<div className="flex gap-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-white">{teams.length}</div>
								<div className="text-xs text-muted">Teams</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-white">{totalParticipants}</div>
								<div className="text-xs text-muted">Players</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-accent">{event.budget ? `£${event.budget.cost}` : "Free"}</div>
								<div className="text-xs text-muted">Cost</div>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<div className="border-t border-border overflow-x-auto">
						<div className="flex gap-1 px-6">
							{TABS.filter((tab) => {
								if (tab.trainingOnly && event.type !== EventType.TrainingSession) return false;
								if (tab.teamsOnly && event.registrationUnit === Unit.Individual) return false;
								return true;
							}).map((tab) => {
								const count = getTabCount(tab.id);
								const isActive = activeTab === tab.id;
								return (
									<Link
										key={tab.id}
										href={getTabHref(tab.id)}
										prefetch={true}
										className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0 ${
											isActive ? "text-accent" : "text-muted hover:text-white"
										}`}>
										<tab.icon size={16} />
										{tab.label}
										{count !== undefined && count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-hover text-xs">{count}</span>}
										{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
									</Link>
								);
							})}
						</div>
					</div>
				</div>

				{/* Tab Content */}
				<div className="min-h-100">{children}</div>
			</div>
		</EventContext.Provider>
	);
}
