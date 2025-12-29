"use client";

import { DashboardHeader, Sidebar } from "@/components/layout";
import { useAuth } from "@/providers";
import { useState } from "react";

interface DashboardShellProps {
	children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { isAuthenticated } = useAuth();

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
					<main className="flex-1 min-h-full">
						<div className="mx-auto py-6 px-2">{children}</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default DashboardShell;
