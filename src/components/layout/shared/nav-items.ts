import { Club, RoleSummaryResponse } from "@/lib/models/Club";
import {
	Award,
	BarChart,
	BookOpen,
	Calendar,
	ClipboardCheck,
	ClipboardList,
	Compass,
	Dumbbell,
	FileText,
	LayoutDashboard,
	MessageSquare,
	Settings,
	Shield,
	TrendingUp,
	Trophy,
	User,
	Users,
	Wallet,
} from "lucide-react";

export interface NavigationItem {
	name: string;
	href?: string; // Optional - items without href are expand-only
	icon: React.ComponentType<any>;
	logoUrl?: string; // If present, renders logo image instead of icon
	color?: string; // If present, renders colored circle instead of icon
	subItems?: NavigationItem[]; // Recursive nesting
	badge?: number | (() => number); // Support static number or dynamic function
	visible?: (summary: RoleSummaryResponse | null) => boolean; // Role-based visibility
}

/**
 * Creates navigation items with dynamic badge support and role-based visibility
 * @param unreadMessageCount - Current unread message count from store
 * @param clubs - User's clubs with groups
 * @param roleSummary - User's role summary for visibility filtering
 */
export const getNavigationItems = (
	unreadMessageCount: number,
	clubs: Club[] = [],
	roleSummary: RoleSummaryResponse | null = null
): NavigationItem[] => [
	// Always visible
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },

	// Events (expandable parent)
	{
		name: "Events",
		icon: Calendar,
		subItems: [
			{ name: "My Events", href: "/dashboard/events", icon: Calendar },
			{ name: "Attendance", href: "/dashboard/attendance", icon: ClipboardList },
			{
				name: "Finance",
				href: "/dashboard/finance",
				icon: Wallet,
				visible: (s) => (s?.isTreasurer ?? false) || (s?.isClubOwner ?? false),
			},
		],
	},

	{
		name: "Messages",
		href: "/dashboard/messages",
		icon: MessageSquare,
		badge: unreadMessageCount,
	},

	// Clubs (expandable parent)
	{
		name: "Clubs",
		icon: Shield,
		subItems: [
			{ name: "My Clubs", href: "/dashboard/clubs", icon: Shield },
			{ name: "Find Clubs", href: "/clubs", icon: Compass },
			...clubs.map((club) => ({
				name: club.name,
				href: `/dashboard/clubs/${club.id}`,
				icon: Shield,
				logoUrl: club.logoUrl,
				subItems:
					club?.groups && club?.groups?.length > 0
						? club.groups.map((group) => ({
								name: group.name,
								href: `/dashboard/groups/${group.id}`,
								icon: Shield,
								color: group.color,
						  }))
						: [],
			})),
		],
	},

	// Teams (expandable parent, visible if user belongs to any team)
	{
		name: "Teams",
		icon: Users,
		visible: (s) => (s?.teams?.length ?? 0) > 0,
		subItems: [
			{ name: "My Teams", href: "/dashboard/teams", icon: Users },
			...(roleSummary?.teams ?? []).map((team) => ({
				name: team.teamName,
				href: `/dashboard/teams/${team.teamId}`,
				icon: Users,
			})),
		],
	},

	// Groups (expandable parent, visible if user belongs to any group)
	{
		name: "Groups",
		icon: Users,
		visible: (s) => (s?.groups?.length ?? 0) > 0,
		subItems: [
			{ name: "My Groups", href: "/dashboard/groups", icon: Users },
			...(roleSummary?.groups ?? []).map((group) => ({
				name: group.groupName,
				href: `/dashboard/groups/${group.groupId}`,
				icon: Users,
			})),
		],
	},

	// Player section (visible if isPlayer)
	{
		name: "Player",
		href: "/dashboard/player",
		icon: User,
		visible: (s) => s?.isPlayer ?? false,
		subItems: [
			{
				name: "My Development",
				href: "/dashboard/player/development",
				icon: TrendingUp,
				subItems: [
					{ name: "Progress", href: "/dashboard/player/development/progress", icon: TrendingUp },
					{ name: "Feedback", href: "/dashboard/player/development/feedback", icon: MessageSquare },
					{ name: "Evaluations", href: "/dashboard/player/development/evaluations", icon: ClipboardCheck },
				],
			},
			{ name: "Stats", href: "/dashboard/player/stats", icon: BarChart },
			{ name: "Badges", href: "/dashboard/player/badges", icon: Award },
			{ name: "Tournaments", href: "/dashboard/player/tournaments", icon: Trophy },
		],
	},

	// Coaching section (visible if isCoach)
	{
		name: "Coaching",
		href: "/dashboard/coaching",
		icon: Users,
		visible: (s) => s?.isCoach ?? false,
		subItems: [
			{
				name: "Training",
				href: "/dashboard/coaching/training",
				icon: Dumbbell,
				subItems: [
					{ name: "Drills", href: "/dashboard/coaching/training/drills", icon: BookOpen },
					{ name: "Plans", href: "/dashboard/coaching/training/plans", icon: FileText },
				],
			},
			{
				name: "Evaluations",
				href: "/dashboard/coaching/evaluations",
				icon: ClipboardCheck,
				subItems: [
					{ name: "Plans", href: "/dashboard/coaching/evaluations/plans", icon: FileText },
					{ name: "Exercises", href: "/dashboard/coaching/evaluations/exercises", icon: ClipboardCheck },
				],
			},
		],
	},

	// Footer (always visible)
	{ name: "Settings", href: "/dashboard/settings/profile", icon: Settings },
];

// Export static version for backwards compatibility
export const navigationItems: NavigationItem[] = getNavigationItems(0, [], null);
