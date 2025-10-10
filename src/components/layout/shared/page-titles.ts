export const getPageTitle = (pathname: string): string => {
	const routes: Record<string, string> = {
		"/dashboard": "Dashboard",
		"/dashboard/events": "My Events",
		"/dashboard/messages": "Messages",
		"/dashboard/audit": "Audit",
		"/dashboard/settings": "Settings",
		"/dashboard/settings/profile": "Profile",
		"/dashboard/settings/payments": "Payments",
	};

	return routes[pathname] || "Dashboard";
};
