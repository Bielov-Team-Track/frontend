"use client";

import { NotificationBell } from "@/components/features/notifications";
import { Input, ThemeSwitcher } from "@/components/ui";
import { useAuth } from "@/providers";
import { Menu, Search, Volleyball } from "lucide-react";
import Link from "next/link";
import UserMenu from "./UserMenu";

interface DashboardHeaderProps {
	onMenuClick?: () => void;
}

function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
	const { userProfile, isLoading } = useAuth();

	return (
		<header className="sticky top-0 z-40 bg-surface border-b border-border">
			<div className="flex items-center justify-between max-w-7xl h-16 px-4 md:px-6  m-auto">
				{/* Left: Logo & Mobile Menu */}
				<div className="flex items-center gap-3">
					{/* Mobile Menu Button - only show for authenticated users */}
					{onMenuClick && (
						<button
							onClick={onMenuClick}
							className="md:hidden p-2 -ml-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-hover"
							aria-label="Open menu">
							<Menu size={24} />
						</button>
					)}

					{/* Logo */}
					<Link href="/hub" className="flex items-center gap-3">
						<div className="w-9 h-9 bg-linear-to-tr from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
							<Volleyball size={18} />
						</div>
						<span className="text-xl font-bold text-foreground tracking-tight">Spike</span>
					</Link>
				</div>

				{/* Center: Search Bar */}
				<div className={`hidden md:flex items-center max-w-md w-full mx-6 transition-all duration-300`}>
					<Input placeholder="Search anything..." leftIcon={<Search size={16} />} />
				</div>

				{/* Right: Actions & Profile */}
				<div className="flex items-center gap-2 md:gap-4">
					<ThemeSwitcher />

					{userProfile && <NotificationBell />}
					<div className="hidden md:block h-6 w-px bg-border mx-1"></div>

					<UserMenu user={userProfile!} isLoading={isLoading} />
				</div>
			</div>
		</header>
	);
}

export default DashboardHeader;
