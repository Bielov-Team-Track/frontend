import { Button } from "@/components";
import { getUserProfile } from "@/lib/server/auth";
import { getUserClubsServer, getClubMembersServer } from "@/lib/server/clubs";
import { loadEventsByFilterServer } from "@/lib/server/events";
import { Club, ClubRole } from "@/lib/models/Club";
import { Event } from "@/lib/models/Event";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionsRequired, MyClubsQuickAccess, MySchedule, NextEventHero } from "./components";

// Extended types for dashboard data
interface DashboardEvent extends Event {
	isHosting: boolean;
	amountDue?: number;
}

interface ClubWithMeta extends Club {
	userRole?: ClubRole;
	pendingCount?: number;
}

export default async function DashboardPage() {
	const userProfile = await getUserProfile();

	if (!userProfile) {
		redirect("/login");
	}

	// Fetch all data in parallel
	const [userEvents, adminEvents, userClubs] = await Promise.all([
		loadEventsByFilterServer({ participantId: userProfile.id! }),
		loadEventsByFilterServer({ organizerId: userProfile.id! }),
		getUserClubsServer(userProfile.id!),
	]);

	// Deduplicate events - if user is both organizer and participant, mark as hosting
	const adminEventIds = new Set((adminEvents || []).map((e) => e.id));
	const allEvents: DashboardEvent[] = [
		...(adminEvents || []).map((e) => ({ ...e, isHosting: true })),
		...(userEvents || []).filter((e) => !adminEventIds.has(e.id)).map((e) => ({ ...e, isHosting: false })),
	]
		.filter((e) => !e.canceled && new Date(e.startTime) > new Date())
		.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

	// Calculate unpaid events (events with cost where payment isn't completed)
	const unpaidEvents = allEvents.filter((e) => {
		const cost = e.budget?.amount || e.costToEnter || 0;
		return cost > 0;
	});

	// Events needing RSVP (status is Invited)
	const eventsNeedingRsvp: Event[] = [];

	// Pending invitations would come from notifications API
	const pendingInvitations: any[] = [];

	// Get user's role in each club
	const clubsWithMeta: ClubWithMeta[] = await Promise.all(
		userClubs.map(async (club) => {
			try {
				const members = await getClubMembersServer(club.id);
				const userMember = members.find((m) => m.userId === userProfile.id);
				return {
					...club,
					userRole: userMember?.role,
					pendingCount: 0,
				};
			} catch {
				return { ...club };
			}
		})
	);

	// Separate next event from schedule
	const nextEvent = allEvents[0] || null;
	const scheduleEvents = allEvents.slice(1, 8);

	// Determine if user has organized events before (for context-aware CTA)
	const hasOrganizedBefore = (adminEvents?.length || 0) > 0;

	// Time-based greeting
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	return (
		<div className="min-h-full">
			{/* Hero Section with Gradient Background */}
			<div className="relative">
				{/* Subtle gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />

				<div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
					{/* Header */}
					<header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
						<div>
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
								{getGreeting()}, {userProfile.name?.split(" ")[0]}
							</h1>
							<p className="text-muted mt-2 text-sm sm:text-base">
								Here's what's happening with your volleyball schedule.
							</p>
						</div>
						<div className="flex gap-3">
							{hasOrganizedBefore ? (
								<Button asChild className="font-semibold">
									<Link href="/dashboard/events/create">
										<Plus className="size-4 mr-2" />
										Create Event
									</Link>
								</Button>
							) : (
								<Button asChild className="font-semibold">
									<Link href="/dashboard/events">
										<Search className="size-4 mr-2" />
										Find Events
									</Link>
								</Button>
							)}
						</div>
					</header>

					{/* Actions Required - Full Width */}
					<ActionsRequired
						unpaidEvents={unpaidEvents}
						pendingInvitations={pendingInvitations}
						eventsNeedingRsvp={eventsNeedingRsvp}
					/>

					{/* Main Content Grid - Responsive Layout */}
					<div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
						{/* Left Column - Next Event (Primary Focus) */}
						<div className="min-w-0">
							<NextEventHero event={nextEvent} isHosting={nextEvent?.isHosting || false} />
						</div>

						{/* Right Column - My Clubs */}
						<div className="min-w-0">
							<MyClubsQuickAccess clubs={clubsWithMeta} />
						</div>
					</div>

					{/* Schedule Section - Full Width */}
					<MySchedule events={scheduleEvents} />
				</div>
			</div>
		</div>
	);
}
