"use client";

import { Team } from "@/lib/models/Club";
import { getClub, getClubMembers, getTeam } from "@/lib/requests/clubs";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MessageSquare, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EventsTab, PostsTab, RosterTab, SettingsTab } from "./components/tabs";

interface Props {
	teamId: string;
}

type TabType = "events" | "posts" | "roster" | "settings";

const TABS = [
	{ id: "events" as const, label: "Events", icon: Calendar },
	{ id: "posts" as const, label: "Posts", icon: MessageSquare },
	{ id: "roster" as const, label: "Roster", icon: Users, showCount: true },
	{ id: "settings" as const, label: "Settings", icon: Settings },
];

export default function TeamDetailClient({ teamId }: Props) {
	const [activeTab, setActiveTab] = useState<TabType>("events");
	const [logoError, setLogoError] = useState(false);

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
				<h2 className="text-xl font-bold text-white mb-2">Team not found</h2>
				<Link href="/dashboard/clubs" className="text-accent hover:underline">
					Back to clubs
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<TeamHeader team={team} clubName={club?.name} />

			{/* Team Banner/Info */}
			<TeamBannerCard team={team} logoError={logoError} onLogoError={() => setLogoError(true)} activeTab={activeTab} onTabChange={setActiveTab} />

			{/* Tab Content */}
			<div className="min-h-[400px]">
				{activeTab === "events" && <EventsTab />}
				{activeTab === "posts" && <PostsTab />}
				{activeTab === "roster" && <RosterTab team={team} clubMembers={clubMembers} teamId={teamId} />}
				{activeTab === "settings" && <SettingsTab team={team} clubId={team.clubId} />}
			</div>
		</div>
	);
}

// Sub-components

function TeamHeader({ team, clubName }: { team: Team; clubName?: string }) {
	return (
		<div className="flex items-center gap-4">
			<Link href={`/dashboard/clubs/${team.clubId}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
				<ArrowLeft size={20} />
			</Link>
			<div className="flex-1">
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-bold text-white">{team.name}</h1>
					{team.skillLevel && <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-muted">{team.skillLevel}</span>}
				</div>
				<div className="flex items-center gap-2 text-sm text-muted">
					<span>Team</span>
					<span>•</span>
					<Link href={`/dashboard/clubs/${team.clubId}`} className="hover:text-accent">
						{clubName || "Loading club..."}
					</Link>
				</div>
			</div>
		</div>
	);
}

interface TeamBannerCardProps {
	team: Team;
	logoError: boolean;
	onLogoError: () => void;
	activeTab: TabType;
	onTabChange: (tab: TabType) => void;
}

function TeamBannerCard({ team, logoError, onLogoError, activeTab, onTabChange }: TeamBannerCardProps) {
	return (
		<div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
			{/* Banner Area */}
			<div className="h-32 relative bg-gradient-to-r from-blue-900/50 to-indigo-900/50">
				<div className="absolute inset-0 bg-black/30" />
			</div>

			{/* Info Row */}
			<div className="p-6 flex items-center gap-6">
				{/* Logo */}
				<div className="w-24 h-24 rounded-xl bg-background-dark border-4 border-background-light overflow-hidden -mt-12 relative z-10 flex items-center justify-center">
					{team.logoUrl && !logoError ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={team.logoUrl} alt="" className="w-full h-full object-cover" onError={onLogoError} />
					) : (
						<Users className="text-muted" size={32} />
					)}
				</div>

				{/* Details */}
				<div className="flex-1 min-w-0">
					<h2 className="text-xl font-bold text-white truncate">{team.name}</h2>
					{team.description && <p className="text-sm text-muted truncate">{team.description}</p>}
				</div>

				{/* Quick Stats */}
				<div className="flex gap-6">
					<StatItem label="Players" value={team.members?.length || 0} />
				</div>
			</div>

			{/* Tabs */}
			<div className="border-t border-white/10 px-6">
				<div className="flex gap-1 overflow-x-auto no-scrollbar">
					{TABS.map((tab) => {
						const count = tab.showCount ? team.members?.length || 0 : undefined;
						return (
							<button
								key={tab.id}
								onClick={() => onTabChange(tab.id)}
								className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
									activeTab === tab.id ? "text-accent" : "text-muted hover:text-white"
								}`}>
								<tab.icon size={16} />
								{tab.label}
								{count !== undefined && <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs">{count}</span>}
								{activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function StatItem({ label, value }: { label: string; value: number }) {
	return (
		<div className="text-center">
			<div className="text-2xl font-bold text-white">{value}</div>
			<div className="text-xs text-muted">{label}</div>
		</div>
	);
}
