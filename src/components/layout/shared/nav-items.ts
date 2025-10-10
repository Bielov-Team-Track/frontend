import {
	FaCalendar,
	FaEnvelope,
	FaTrophy,
	FaChartPie,
	FaCog,
	FaHome,
	FaUser,
	FaCreditCard,
} from "react-icons/fa";

export interface NavigationSubItem {
	name: string;
	href: string;
	icon: React.ComponentType<any>;
}

export interface NavigationItem {
	name: string;
	href: string;
	icon: React.ComponentType<any>;
	subItems?: NavigationSubItem[];
}

export const navigationItems: NavigationItem[] = [
	{ name: "Events", href: "/dashboard/events", icon: FaCalendar },
	{ name: "Messages", href: "/dashboard/messages", icon: FaEnvelope },
	{ name: "Audit", href: "/dashboard/audit", icon: FaChartPie },
	{
		name: "Settings",
		href: "/dashboard/settings",
		icon: FaCog,
		subItems: [
			{ name: "Profile", href: "/dashboard/settings/profile", icon: FaUser },
			{
				name: "Payments",
				href: "/dashboard/settings/payments",
				icon: FaCreditCard,
			},
		],
	},
];
