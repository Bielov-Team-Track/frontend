import { Club } from "@/lib/models/Club";
import {
	Activity,
	BookOpen,
	Calendar,
	ClipboardList,
	Dumbbell,
	FileText,
	LayoutDashboard,
	MessageSquare,
	Search,
	Settings,
	Shield,
} from "lucide-react";

export interface NavigationItem {
	name: string;
	href: string;
	icon: React.ComponentType<any>;
	logoUrl?: string; // If present, renders logo image instead of icon
	color?: string; // If present, renders colored circle instead of icon
	subItems?: NavigationItem[]; // Recursive nesting
	badge?: number | (() => number); // Support static number or dynamic function
}

/**
 * Creates navigation items with dynamic badge support
 * @param unreadMessageCount - Current unread message count from store
 */
export const getNavigationItems = (
	unreadMessageCount: number,
	clubs: Club[] = []
): NavigationItem[] => [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Events", href: "/dashboard/events", icon: Calendar },
	{
		name: "Training",
		href: "/dashboard/training/drills",
		icon: Dumbbell,
		subItems: [
			{ name: "Drills", href: "/dashboard/training/drills", icon: BookOpen },
			{ name: "Plans", href: "/dashboard/training/plans", icon: FileText },
		],
	},
	{
		name: "Clubs",
		href: "/dashboard/clubs",
		icon: Shield,
		subItems: [
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
			{ name: "Join club", href: "/clubs", icon: Search },
		],
	},
	{
		name: "Messages",
		href: "/dashboard/messages",
		icon: MessageSquare,
		badge: unreadMessageCount,
	},
	{ name: "Audit", href: "/dashboard/audit", icon: Activity },
	{ name: "Attendance", href: "/dashboard/attendance", icon: ClipboardList },
	{ name: "Settings", href: "/dashboard/settings/profile", icon: Settings },
];

// Export static version for backwards compatibility
export const navigationItems: NavigationItem[] = getNavigationItems(0);
