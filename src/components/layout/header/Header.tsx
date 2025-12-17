"use client";

import { useAuth } from "@/lib/auth/authContext";
import UserMenu from "../dashboard-header/UserMenu";
import Link from "next/link";

const Header = () => {
	const auth = useAuth();

	return (
		<header className="bg-background h-16 p-4 shadow-md ">
			<div className="flex items-center justify-between max-w-6xl mx-auto px-8">
				<h1 className="text-lg font-semibold text-accent">Volleyer</h1>

				<nav className="hidden md:flex items-center space-x-6">
					<Link href="/clubs" className="text-white/80 hover:text-accent transition-colors text-sm font-medium">
						Clubs
					</Link>
					<Link href="/events" className="text-white/80 hover:text-accent transition-colors text-sm font-medium">
						Events
					</Link>
				</nav>

				<UserMenu user={auth.userProfile} isLoading={auth.isLoading} />
			</div>
		</header>
	);
};

export default Header;
