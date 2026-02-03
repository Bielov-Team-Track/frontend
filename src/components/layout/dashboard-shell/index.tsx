"use client";

import { DashboardHeader, Sidebar } from "@/components/layout";
import { useAuth } from "@/providers";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PROFILE_SETUP_ROUTE = "/complete-profile-setup";

interface DashboardShellProps {
	children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { isAuthenticated, isProfileComplete, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	// Redirect to profile setup if profile is incomplete
	useEffect(() => {
		if (isLoading) return;

		const isOnProfileSetup = pathname?.startsWith(PROFILE_SETUP_ROUTE);

		// If authenticated but profile incomplete, redirect to setup
		if (isAuthenticated && !isProfileComplete && !isOnProfileSetup) {
			router.replace(PROFILE_SETUP_ROUTE);
		}
	}, [isAuthenticated, isProfileComplete, isLoading, pathname, router]);

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			{/* Header - full width at top */}
			<DashboardHeader onMenuClick={isAuthenticated ? () => setIsSidebarOpen(true) : undefined} />

			{/* Content area - centers sidebar + main together */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
				<div className="mx-auto max-w-7xl flex min-h-full">
					{/* Sidebar - only for authenticated users */}
					{isAuthenticated && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

					{/* Main content - centered with max-width */}
					<main className="flex-1 min-h-full min-w-0">
						<div className="mx-auto py-6 px-2 h-full">{children}</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default DashboardShell;
