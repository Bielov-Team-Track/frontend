"use client";

import { ThemeSwitcher } from "@/components/ui";
import { useAuth } from "@/providers";
import Link from "next/link";
import UserMenu from "../dashboard-header/UserMenu";

const Header = () => {
	const auth = useAuth();

	return (
		<header className="bg-background h-16 p-4 shadow-md ">
			<div className="flex items-center justify-between max-w-6xl mx-auto px-8">
				<h1 className="text-lg font-semibold text-accent">Spike</h1>

				<nav className="hidden md:flex items-center space-x-6">
					<Link href="/clubs" className="text-foreground/80 hover:text-accent transition-colors text-sm font-medium">
						Clubs
					</Link>
					<Link href="/events" className="text-foreground/80 hover:text-accent transition-colors text-sm font-medium">
						Events
					</Link>
				</nav>

				<div className="flex items-center gap-2">
					<ThemeSwitcher />
					<UserMenu user={auth.userProfile} isLoading={auth.isLoading} />
				</div>
			</div>
		</header>
	);
};

export default Header;
