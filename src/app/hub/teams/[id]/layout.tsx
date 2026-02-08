"use client";

import { getClub, getClubMembers, getTeam } from "@/lib/api/clubs";
import { ClubMember, Team } from "@/lib/models/Club";
import { Club } from "@/lib/models/Club";
import { useQuery } from "@tanstack/react-query";
import { ScrollableTabBar } from "@/components";
import { ArrowLeft, Calendar, LayoutGrid, MessageSquare, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";

// Context to share team data with child pages
interface TeamContextValue {
	teamId: string;
	team: Team | undefined;
	club: Club | undefined;
	clubMembers: ClubMember[];
	isLoading: boolean;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function useTeamContext() {
	const context = useContext(TeamContext);
	if (!context) {
		throw new Error("useTeamContext must be used within TeamLayout");
	}
	return context;
}

type TabType = "events" | "posts" | "members" | "roster" | "settings";

const TABS: { id: TabType; label: string; icon: typeof Calendar; showCount?: boolean }[] = [
	{ id: "events", label: "Events", icon: Calendar },
	{ id: "posts", label: "Posts", icon: MessageSquare },
	{ id: "members", label: "Members", icon: Users, showCount: true },
	{ id: "roster", label: "Roster", icon: LayoutGrid },
	{ id: "settings", label: "Settings", icon: Settings },
];

export default function TeamLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const teamId = params.id as string;

	const [logoError, setLogoError] = useState(false);

	// Determine active tab from pathname
	const getActiveTab = (): TabType => {
		if (pathname.includes("/settings")) return "settings";
		if (pathname.includes("/posts")) return "posts";
		if (pathname.includes("/members")) return "members";
		if (pathname.includes("/roster")) return "roster";
		return "events";
	};

	const activeTab = getActiveTab();

	// Queries
	const { data: team, isLoading: teamLoading } = useQuery({
		queryKey: ["team", teamId],
		queryFn: () => getTeam(teamId),
	});

	const { data: club } = useQuery({
		queryKey: ["club", team?.clubId],
		queryFn: () => getClub(team!.clubId),
		enabled: !!team?.clubId,
	});

	const { data: clubMembers = [] } = useQuery({
		queryKey: ["club-members", team?.clubId],
		queryFn: () => getClubMembers(team!.clubId),
		enabled: !!team?.clubId,
	});

	// Get tab href
	const getTabHref = (tabId: TabType): string => {
		const base = `/hub/teams/${teamId}`;
		return `${base}/${tabId}`;
	};

	// Loading state
	if (teamLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	// Not found state
	if (!team) {
		return (
			<div className="text-center py-20">
				<Users className="w-16 h-16 text-muted mx-auto mb-4" />
				<h2 className="text-xl font-bold text-foreground mb-2">Team not found</h2>
				<Link href="/hub/clubs" className="text-accent hover:underline">
					Back to clubs
				</Link>
			</div>
		);
	}

	return (
		<TeamContext.Provider
			value={{
				teamId,
				team,
				club,
				clubMembers,
				isLoading: teamLoading,
			}}>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link href={`/hub/clubs/${team.clubId}`} className="p-2 rounded-lg bg-surface hover:bg-hover transition-colors">
						<ArrowLeft size={20} />
					</Link>
					<div className="flex-1">
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
							{team.skillLevel && <span className="px-2 py-0.5 rounded text-xs font-medium bg-hover text-muted">{team.skillLevel}</span>}
						</div>
						<div className="flex items-center gap-2 text-sm text-muted">
							<span>Team</span>
							<span>•</span>
							<Link href={`/hub/clubs/${team.clubId}`} className="hover:text-accent">
								{club?.name || "Loading club..."}
							</Link>
						</div>
					</div>
				</div>

				{/* Team Banner/Info */}
				<div className="rounded-2xl overflow-hidden border border-border bg-surface">
					{/* Banner Area */}
					<div className="h-32 relative bg-linear-to-r from-blue-900/50 to-indigo-900/50">
						<div className="absolute inset-0 bg-overlay-light" />
					</div>

					{/* Info Row */}
					<div className="p-6 flex items-center gap-6">
						{/* Logo */}
						<div className="w-24 h-24 rounded-xl bg-background border-4 border-background-light overflow-hidden -mt-12 relative z-10 flex items-center justify-center">
							{team.logoUrl && !logoError ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={team.logoUrl} alt="" className="w-full h-full object-cover" onError={() => setLogoError(true)} />
							) : (
								<Users className="text-muted" size={32} />
							)}
						</div>

						{/* Details */}
						<div className="flex-1 min-w-0">
							<h2 className="text-xl font-bold text-foreground truncate">{team.name}</h2>
							{team.description && <p className="text-sm text-muted truncate">{team.description}</p>}
						</div>

						{/* Quick Stats */}
						<div className="flex gap-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-foreground">{team.members?.length || 0}</div>
								<div className="text-xs text-muted">Players</div>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<ScrollableTabBar>
						{TABS.map((tab) => {
							const count = tab.showCount ? team.members?.length || 0 : undefined;
							const isActive = activeTab === tab.id;
							return (
								<Link
									key={tab.id}
									href={getTabHref(tab.id)}
									prefetch={true}
									className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0 ${
										isActive ? "text-accent" : "text-muted hover:text-foreground"
									}`}>
									<tab.icon size={16} />
									{tab.label}
									{count !== undefined && <span className="px-1.5 py-0.5 rounded-full bg-hover text-xs">{count}</span>}
									{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
								</Link>
							);
						})}
					</ScrollableTabBar>
				</div>

				{/* Tab Content */}
				<div className="min-h-[400px]">{children}</div>
			</div>
		</TeamContext.Provider>
	);
}
