"use client";

import { Button } from "@/components";
import { getMyParticipation, loadEvent, loadParticipants } from "@/lib/api/events";
import { loadTeams } from "@/lib/api/teams";
import { Event, EventType } from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventPaymentConfig";
import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import { Team } from "@/lib/models/Team";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, Calendar, Check, Clock, ClipboardList, CreditCard, Edit, MapPin, MessageCircle, MoreHorizontal, Settings, Share2, Trash2, Users, X, XCircle } from "lucide-react";
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

type TabType = "overview" | "teams" | "members" | "discussion" | "training" | "evaluation" | "payments" | "settings";

interface TabConfig {
	id: TabType;
	label: string;
	icon: typeof Calendar;
	href: string;
	trainingOnly?: boolean;
	evaluationOnly?: boolean;
	teamsOnly?: boolean;
}

const TABS: TabConfig[] = [
	{ id: "overview", label: "Overview", icon: Calendar, href: "" },
	{ id: "teams", label: "Teams", icon: Users, href: "/teams", teamsOnly: true },
	{ id: "members", label: "Members", icon: Users, href: "/members" },
	{ id: "discussion", label: "Discussion", icon: MessageCircle, href: "/discussion" },
	{ id: "training", label: "Training Plan", icon: ClipboardList, href: "/training", trainingOnly: true },
	{ id: "evaluation", label: "Evaluation", icon: ClipboardList, href: "/evaluation-session/setup", evaluationOnly: true },
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
		if (pathname.includes("/discussion")) return "discussion";
		if (pathname.includes("/training")) return "training";
		if (pathname.includes("/evaluation-session")) return "evaluation";
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

	const { data: participantsResult } = useQuery({
		queryKey: ["event-participants", eventId],
		queryFn: () => loadParticipants(eventId, undefined, 100),
		enabled: !!eventId,
	});
	const participants = participantsResult?.items ?? [];

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
		const base = `/hub/events/${eventId}`;
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
	const isParticipant = myParticipation?.status === ParticipationStatus.Accepted;

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
				<Link href="/hub/events" className="text-accent hover:underline">
					Back to events
				</Link>
			</div>
		);
	}

	const startDate = new Date(event.startTime);

	return (
		<EventContext.Provider value={contextValue}>
			<div className="space-y-6">
				{/* Header - Simplified */}
				<div className="flex items-center gap-4">
					<Link href="/hub/events" className="p-2 rounded-lg bg-surface hover:bg-hover transition-colors">
						<ArrowLeft size={20} />
					</Link>
					<div className="flex-1">
						<h1 className="text-2xl font-bold text-white" data-testid="event-detail-name">{event.name}</h1>
					</div>

					{/* Overflow Menu for ALL users */}
					<div className="relative">
						<Button variant="ghost" color="neutral" className="p-2" onClick={() => setShowAdminMenu(!showAdminMenu)} data-testid="event-overflow-menu">
							<MoreHorizontal size={18} />
						</Button>

						{showAdminMenu && (
							<>
								<div className="fixed inset-0 z-40" onClick={() => setShowAdminMenu(false)} />
								<div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-raised border border-border shadow-xl z-50 py-1">
									{/* Actions for all users */}
									<button className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-surface flex items-center gap-3">
										<Share2 size={16} className="text-muted" />
										Share
									</button>
									<button className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-surface flex items-center gap-3">
										<MessageCircle size={16} className="text-muted" />
										Message Hosts
									</button>
									{/* Admin-only actions */}
									{isAdmin && (
										<>
											<div className="border-t border-border my-1" />
											<button className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-surface flex items-center gap-3" data-testid="edit-event-menu-item">
												<Edit size={16} className="text-muted" />
												Edit Event
											</button>
											<button className="w-full px-4 py-2.5 text-left text-sm text-warning hover:bg-surface flex items-center gap-3" data-testid="cancel-event-menu-item">
												<XCircle size={16} />
												Cancel Event
											</button>
											<button className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-surface flex items-center gap-3">
												<Trash2 size={16} />
												Delete Event
											</button>
										</>
									)}
								</div>
							</>
						)}
					</div>
				</div>

				{/* Event Banner with Overlaid Content */}
				<div className="rounded-2xl overflow-hidden border border-border bg-surface">
					{/* Banner with gradient overlay */}
					<div className="h-48 md:h-56 relative bg-gradient-to-r from-accent/20 to-secondary/20 overflow-hidden">
						{event.imageUrl && !bannerError && (
							<>
								<Image src={event.imageUrl} alt="" fill className="object-cover" onError={() => setBannerError(true)} />
							</>
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-[var(--card)]/40 to-transparent" />
						<div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
							{/* Event type badge */}
							<div className="flex items-center gap-2 mb-2">
								<span className="px-2 py-0.5 rounded-lg bg-accent/20 text-accent border border-accent/20 text-xs font-bold uppercase" data-testid="event-type-badge">
									{event.type || "Event"}
								</span>
								{event.canceled && (
									<span className="px-2 py-0.5 rounded-lg bg-destructive/20 text-destructive border border-destructive/30 text-xs font-bold uppercase" data-testid="event-canceled-badge">
										Canceled
									</span>
								)}
								{isFull && !event.canceled && (
									<span className="px-2 py-0.5 rounded-lg bg-warning/20 text-warning border border-warning/30 text-xs font-bold uppercase" data-testid="event-full-badge">
										Full
									</span>
								)}
								<EventContextBadge contextId={event.contextId} contextType={event.contextType} />
							</div>
							{/* Event name */}
							<h2 className="text-xl md:text-2xl font-bold text-white mb-2">{event.name}</h2>
							{/* Date & time */}
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
								<span className="flex items-center gap-1.5">
									<Calendar size={14} className="text-accent" />
									<span className="text-white font-medium">{format(startDate, "EEE, MMM d")}</span>
									<span className="text-warning font-semibold">· {formatDistanceToNow(startDate, { addSuffix: true })}</span>
								</span>
								<span className="flex items-center gap-1.5">
									<Clock size={14} className="text-accent" />
									{format(startDate, "HH:mm")} - {format(new Date(event.endTime), "HH:mm")}
								</span>
							</div>
							{/* Location & host */}
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1.5">
								{event.location?.address && (
									<span className="flex items-center gap-1.5">
										<MapPin size={14} className="text-accent" />
										<span className="text-white">{event.location.address}</span>
									</span>
								)}
								<EventOrganizers participants={participants} />
							</div>
						</div>
					</div>

					{/* Stats Bar with context-aware CTA */}
					<div className="px-5 py-3 flex items-center justify-between border-t border-border">
						{/* Left: stats */}
						<div className="flex items-center gap-4 text-sm">
							<div className="flex items-center gap-1.5">
								<Users size={14} className="text-muted-foreground" />
								<span className="font-semibold text-white" data-testid="event-players-count">
									{totalParticipants}
									{totalSpots > 0 ? `/${totalSpots}` : ""} Players
								</span>
								{totalSpots > 0 && totalParticipants < totalSpots && (
									<span className="text-xs text-green-500 font-medium">({totalSpots - totalParticipants} spots left)</span>
								)}
							</div>
							<span className="text-muted-foreground">{teams.length} Teams</span>
							<span className="font-bold text-accent" data-testid="event-price-display">{event.paymentConfig ? `£${event.paymentConfig.cost}` : "Free"}</span>
						</div>
						{/* Right: context-aware CTA - hidden on mobile (StickyBottomBar handles mobile) */}
						<div className="hidden lg:flex items-center gap-2">
							{hasInvitation && (
								<>
									<Button variant="outline" color="neutral" size="sm" leftIcon={<X size={14} />} data-testid="decline-invitation-button">
										Decline
									</Button>
									<Button color="primary" size="sm" leftIcon={<Check size={14} />} data-testid="accept-invitation-button">
										Accept
									</Button>
								</>
							)}
							{isOpen && !isFull && !hasInvitation && !isParticipant && <Button color="primary" size="sm" data-testid="join-event-button">Join Event</Button>}
							{isOpen && isFull && !hasInvitation && !isParticipant && (
								<Button variant="outline" color="primary" size="sm" data-testid="join-waitlist-button">
									Join Waitlist
								</Button>
							)}
						</div>
					</div>

					{/* Tabs */}
					<div className="border-t border-border overflow-x-auto">
						<div className="flex gap-1 px-6">
							{TABS.filter((tab) => {
								if (tab.trainingOnly && event.type !== EventType.TrainingSession) return false;
								if (tab.evaluationOnly && event.type !== EventType.Evaluation && event.type !== EventType.Trial) return false;
								if (tab.teamsOnly && event.registrationUnit === Unit.Individual) return false;
								return true;
							}).map((tab) => {
								const count = getTabCount(tab.id);
								const isActive = activeTab === tab.id;
								return (
									<Link
										key={tab.id}
										href={getTabHref(tab.id)}
										data-testid={`event-tab-${tab.id}`}
										prefetch={true}
										className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0 ${
											isActive ? "text-accent" : "text-muted hover:text-white"
										}`}>
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
				<div className="min-h-100 pb-20 lg:pb-0">{children}</div>
			</div>
		</EventContext.Provider>
	);
}
