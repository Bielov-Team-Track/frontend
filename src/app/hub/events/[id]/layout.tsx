"use client";
import { Button } from "@/components";
import { Modal } from "@/components/ui";
import { getMyParticipation, loadEvent, loadParticipants, respondToInvitation } from "@/lib/api/events";
import { createChat } from "@/lib/api/messages";
import { loadTeams } from "@/lib/api/teams";
import { Event, EventFormat, EventType } from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventPaymentConfig";
import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import { Team } from "@/lib/models/Team";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, ClipboardList, CreditCard, Edit, MessageCircle, MoreHorizontal, Settings, Share2, Trash2, Users, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import EventPaymentForm from "@/components/features/events/components/EventPaymentForm";
import EventActionRow from "./components/EventActionRow";
import EventContextBadge from "./components/EventContextBadge";
import EventInfoRows from "./components/EventInfoRows";
import ParticipationStatusChips from "./components/ParticipationStatusChips";
import { useEventActions } from "./hooks/useEventActions";
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
	hasCost?: boolean;
}
const TABS: TabConfig[] = [
	{ id: "overview", label: "Overview", icon: Calendar, href: "" },
	{ id: "teams", label: "Teams", icon: Users, href: "/teams", teamsOnly: true },
	{ id: "members", label: "Participants", icon: Users, href: "/members" },
	{ id: "training", label: "Training Plan", icon: ClipboardList, href: "/training", trainingOnly: true },
	{ id: "evaluation", label: "Evaluation", icon: ClipboardList, href: "/evaluation-session/setup", evaluationOnly: true },
	{ id: "payments", label: "Payments", icon: CreditCard, href: "/payments", hasCost: true },
];
export default function EventPrototypeLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const router = useRouter();
	const queryClient = useQueryClient();
	const eventId = params.id as string;
	const [bannerError, setBannerError] = useState(false);
	const [showAdminMenu, setShowAdminMenu] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
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
	const {
		handleAcceptInvitation,
		handleDeclineInvitation,
		handleConfirmDecline,
		handleCloseDeclineModal,
		handleJoin,
		handleJoinWaitlist,
		showDeclineModal: showLayoutDeclineModal,
		declineNote: layoutDeclineNote,
		setDeclineNote: setLayoutDeclineNote,
	} = useEventActions({
		eventId,
		payToJoin: !!event?.paymentConfig?.payToJoin,
		onPaymentRequired: () => setShowPaymentModal(true),
		onSuccess: () => {
			refetchMyParticipation();
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
		},
	});
	const isParticipant =
		myParticipation?.status === ParticipationStatus.Accepted ||
		myParticipation?.status === ParticipationStatus.Attended;
	const isDeclined = myParticipation?.status === ParticipationStatus.Declined;
	const isWaitlisted = myParticipation?.status === ParticipationStatus.Waitlisted;
	// Respond mutation — uses POST /respond endpoint to change own status (Declined or Accepted)
	const respondMutation = useMutation({
		mutationFn: (accept: boolean) => respondToInvitation(eventId, accept),
		onSuccess: () => {
			refetchMyParticipation();
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
		},
	});
	// Message organizers — create a chat with event organizers and navigate to it
	const handleMessageOrganizers = useCallback(async () => {
		const organizers = participants.filter((p) => p.role === "Organizer" || p.role === "Admin" || p.role === "Owner");
		if (organizers.length === 0) return;
		try {
			const chat = await createChat(organizers.map((o) => o.userProfile));
			router.push(`/hub/messages/${chat.id}`);
		} catch {
			// Fallback: navigate to messages page
			router.push("/hub/messages");
		}
	}, [participants, router]);
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
											<Link
												href={`/hub/events/${eventId}/settings`}
												className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-surface flex items-center gap-3"
												onClick={() => setShowAdminMenu(false)}
											>
												<Settings size={16} className="text-muted" />
												Settings
											</Link>
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
				{/* Event Header Card */}
				<div className="rounded-2xl overflow-hidden border border-border bg-surface">
					{/* Slim Hero */}
					<div className="h-[130px] lg:h-[150px] relative bg-gradient-to-r from-accent/20 to-secondary/20 overflow-hidden">
						{event.imageUrl && !bannerError && (
							<Image src={event.imageUrl} alt="" fill className="object-cover" onError={() => setBannerError(true)} />
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-[var(--card)]/60 to-transparent" />
						<div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
							{/* Badges */}
							<div className="flex items-center gap-2 mb-1.5 flex-wrap">
								<span className="px-2 py-0.5 rounded-lg bg-accent/20 text-accent border border-accent/20 text-[10px] font-bold uppercase" data-testid="event-type-badge">
									{(event.type || "Event").replace(/([a-z])([A-Z])/g, "$1 $2")}
								</span>
								{event.canceled && (
									<span className="px-2 py-0.5 rounded-lg bg-destructive/20 text-destructive border border-destructive/30 text-[10px] font-bold uppercase" data-testid="event-canceled-badge">
										Canceled
									</span>
								)}
								{isFull && !event.canceled && (
									<span className="px-2 py-0.5 rounded-lg bg-destructive/20 text-destructive border border-destructive/30 text-[10px] font-bold uppercase" data-testid="event-full-badge">
										Full
									</span>
								)}
								</div>
							{/* Title */}
							<h2 className="text-lg lg:text-xl font-bold text-white mb-0.5" data-testid="event-hero-title">{event.name}</h2>
							{/* Club context as subtitle */}
							<EventContextBadge contextId={event.contextId} contextType={event.contextType} compact />
						</div>
					</div>
					{/* Info Rows */}
					<EventInfoRows event={event} participants={participants} />
					{/* Combined Status + Action Bar */}
					<div className="flex flex-col lg:flex-row lg:items-center border-t border-border bg-primary/[0.02]">
						{/* Status chips — padding lives inside ParticipationStatusChips so that when it returns null no empty space renders */}
						<div className="lg:flex-1">
							<ParticipationStatusChips participants={participants} eventId={eventId} isPrivate={event.isPrivate ?? false} />
						</div>
						{/* Action row */}
						<EventActionRow
							isOpen={isOpen}
							isFull={isFull}
							isPrivate={event.isPrivate ?? false}
							hasInvitation={hasInvitation}
							isParticipant={isParticipant}
							isDeclined={isDeclined}
							isWaitlisted={isWaitlisted}
							canceled={event.canceled ?? false}
							onAccept={handleAcceptInvitation}
							onDecline={() => handleDeclineInvitation()}
							onWithdraw={() => respondMutation.mutate(false)}
							onJoin={handleJoin}
							onReaccept={handleAcceptInvitation}
							onJoinWaitlist={handleJoinWaitlist}
							onMessageOrganizers={handleMessageOrganizers}
						/>
					</div>
					{/* Tabs */}
					<div className="border-t border-border overflow-x-auto" role="tablist">
						<div className="flex gap-1 px-5 lg:px-6">
							{TABS.filter((tab) => {
								if (tab.trainingOnly && event.type !== EventType.TrainingSession) return false;
								if (tab.evaluationOnly && event.type !== EventType.Evaluation && event.type !== EventType.Trial) return false;
								if (tab.teamsOnly && (event.registrationUnit === Unit.Individual || event.eventFormat === EventFormat.List)) return false;
								if (tab.hasCost && !(event.paymentConfig && event.paymentConfig.cost > 0)) return false;
								return true;
							}).map((tab) => {
								const count = getTabCount(tab.id);
								const isActive = activeTab === tab.id;
								return (
									<Link
										key={tab.id}
										href={getTabHref(tab.id)}
										role="tab"
										aria-selected={isActive}
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
				{/* Decline Invitation Modal (for desktop Decline button in EventActionRow) */}
				<Modal
					isOpen={showLayoutDeclineModal}
					onClose={handleCloseDeclineModal}
					title="Decline Invitation"
					data-testid="layout-decline-invitation-modal"
					description="Let the organizers know why you can't make it (optional)."
					size="sm">
					<textarea
						value={layoutDeclineNote}
						onChange={(e) => setLayoutDeclineNote(e.target.value)}
						placeholder="Add a note..."
						data-testid="layout-decline-note-input"
						className="w-full h-24 px-4 py-3 rounded-xl bg-background border border-border text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
					/>
					<div className="flex justify-end gap-3 mt-4">
						<Button variant="ghost" color="neutral" onClick={handleCloseDeclineModal}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleConfirmDecline} data-testid="layout-confirm-decline-button">
							Decline Invitation
						</Button>
					</div>
				</Modal>
				{/* Payment Modal — embedded Stripe Payment Element (desktop) */}
				{event.paymentConfig?.payToJoin && (
					<Modal
						isOpen={showPaymentModal}
						onClose={() => setShowPaymentModal(false)}
						title="Complete Payment"
						description="Enter your card details to secure your spot."
						size="md"
						preventOutsideClose
						data-testid="layout-event-payment-modal"
					>
						<EventPaymentForm
							eventId={event.id}
							eventName={event.name}
							cost={event.paymentConfig?.cost ?? 0}
							currency={event.paymentConfig?.currency || "£"}
							onSuccess={() => {
								setShowPaymentModal(false);
								refetchMyParticipation();
								queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
								queryClient.invalidateQueries({ queryKey: ["event-my-participation", eventId] });
							}}
							onCancel={() => setShowPaymentModal(false)}
						/>
					</Modal>
				)}
				{/* Tab Content */}
				<div className="min-h-100 pb-20 lg:pb-0">{children}</div>
			</div>
		</EventContext.Provider>
	);
}
