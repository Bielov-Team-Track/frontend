"use client";

import UserMenu from "./UserMenu";
import { useAuth } from "@/lib/auth/authContext";
import { usePathname } from "next/navigation";
import { getPageTitle } from "../shared/page-titles";
import { Bell, Search, Menu } from "lucide-react";
import { useState } from "react";

function DashboardHeader() {
	const { userProfile, isLoading } = useAuth();
	const pathname = usePathname();
	const pageTitle = getPageTitle(pathname);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

	return (
		<header className="sticky top-4 z-30 flex items-center justify-between w-full h-16 px-6 bg-background/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-sm mb-6">
            
            {/* Left: Mobile Menu & Title */}
            <div className="flex items-center gap-4">
                <button className="xl:hidden p-2 text-muted hover:text-white transition-colors">
                    <Menu size={24} />
                </button>
			    <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">{pageTitle}</h1>
            </div>

            {/* Center: Search Bar */}
            <div className={`hidden md:flex items-center max-w-md w-full mx-6 transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className={`transition-colors ${isSearchFocused ? 'text-accent' : 'text-muted group-hover:text-white'}`} />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 bg-background-light/50 border border-white/5 rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50 focus:bg-background-light transition-all"
                        placeholder="Search anything..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted hover:text-white transition-colors hover:bg-white/5 rounded-full">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-background"></span>
                </button>
                
                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                
			    <UserMenu user={userProfile!} isLoading={isLoading} />
            </div>
		</header>
	);
}

export default DashboardHeader;
