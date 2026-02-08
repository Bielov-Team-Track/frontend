export const getPageTitle = (pathname: string): string => {
	const routes: Record<string, string> = {
		"/hub": "Dashboard",
		"/hub/events": "My Events",
		"/hub/messages": "Messages",
		"/hub/audit": "Audit",
		"/hub/settings": "Settings",
		"/hub/settings/profile": "Profile",
		"/hub/settings/payments": "Payments",
	};

	return routes[pathname] || "Dashboard";
};
