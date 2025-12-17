"use client";

import { InviteMemberModal } from "@/components/features/clubs";
import { Club } from "@/lib/models/Club";
import { getClub, getClubMembers, getGroupsByClub, getTeamsByClub, inviteMember } from "@/lib/requests/clubs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2, Calendar, ImageOff, Layers, Settings, Shield, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EventsTab, GroupsTab, MembersTab, OverviewTab, SettingsTab, TeamsTab } from "./components/tabs";

interface Props {
	clubId: string;
}

type TabType = "overview" | "events" | "teams" | "groups" | "members" | "settings";

const TABS = [
	{ id: "overview" as const, label: "Overview", icon: Building2 },
	{ id: "events" as const, label: "Events", icon: Calendar },
	{ id: "teams" as const, label: "Teams", icon: Users },
	{ id: "groups" as const, label: "Groups", icon: Layers },
	{ id: "members" as const, label: "Members", icon: UserPlus },
	{ id: "settings" as const, label: "Settings", icon: Settings },
];

export default function ClubDetailClient({ clubId }: Props) {
	const [activeTab, setActiveTab] = useState<TabType>("overview");
	const [logoError, setLogoError] = useState(false);
	const [bannerError, setBannerError] = useState(false);
	const [showInviteModal, setShowInviteModal] = useState(false);
	const queryClient = useQueryClient();

	// Queries
	const { data: club, isLoading: clubLoading } = useQuery({
		queryKey: ["club", clubId],
		queryFn: () => getClub(clubId),
	});

	const { data: members = [] } = useQuery({
		queryKey: ["club-members", clubId],
		queryFn: () => getClubMembers(clubId),
		enabled: !!clubId,
	});

	const { data: teams = [] } = useQuery({
		queryKey: ["club-teams", clubId],
		queryFn: () => getTeamsByClub(clubId),
		enabled: !!clubId,
	});

	const { data: groups = [] } = useQuery({
		queryKey: ["club-groups", clubId],
		queryFn: () => getGroupsByClub(clubId),
		enabled: !!clubId,
	});

	// Mutations
	const inviteMutation = useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: string }) => inviteMember(clubId, userId, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
			setShowInviteModal(false);
		},
	});

	// Loading state
	if (clubLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	// Not found state
	if (!club) {
		return (
			<div className="text-center py-20">
				<Shield className="w-16 h-16 text-muted mx-auto mb-4" />
				<h2 className="text-xl font-bold text-white mb-2">Club not found</h2>
				<Link href="/dashboard/clubs" className="text-accent hover:underline">
					Back to clubs
				</Link>
			</div>
		);
	}

	// Get tab counts
	const getTabCount = (tabId: TabType) => {
		switch (tabId) {
			case "teams":
				return teams.length;
			case "groups":
				return groups.length;
			case "members":
				return members.length;
			default:
				return undefined;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<ClubHeader club={club} />

			{/* Club Banner and Info */}
			<ClubBannerCard
				club={club}
				members={members}
				teams={teams}
				groups={groups}
				logoError={logoError}
				bannerError={bannerError}
				onLogoError={() => setLogoError(true)}
				onBannerError={() => setBannerError(true)}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				getTabCount={getTabCount}
			/>

			{/* Tab Content */}
			<div className="min-h-[400px]">
				{activeTab === "overview" && (
					<OverviewTab club={club} members={members} teams={teams} groups={groups} onInvite={() => setShowInviteModal(true)} />
				)}
				{activeTab === "events" && <EventsTab clubId={clubId} teams={teams} groups={groups} />}
				{activeTab === "teams" && <TeamsTab teams={teams} clubId={clubId} clubMembers={members} />}
				{activeTab === "groups" && <GroupsTab groups={groups} clubId={clubId} clubMembers={members} />}
				{activeTab === "members" && <MembersTab members={members} clubId={clubId} onInvite={() => setShowInviteModal(true)} />}
				{activeTab === "settings" && <SettingsTab club={club} />}
			</div>

			{/* Invite Modal */}
			<InviteMemberModal
				isOpen={showInviteModal}
				onClose={() => setShowInviteModal(false)}
				onInvite={(data) => inviteMutation.mutate(data)}
				isLoading={inviteMutation.isPending}
			/>
		</div>
	);
}

// Sub-components

function ClubHeader({ club }: { club: Club }) {
	return (
		<div className="flex items-center gap-4">
			<Link href="/dashboard/clubs" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
				<ArrowLeft size={20} />
			</Link>
			<div className="flex-1">
				<h1 className="text-2xl font-bold text-white">{club.name}</h1>
				<p className="text-sm text-muted">Club Management</p>
			</div>
		</div>
	);
}

interface ClubBannerCardProps {
	club: Club;
	members: any[];
	teams: any[];
	groups: any[];
	logoError: boolean;
	bannerError: boolean;
	onLogoError: () => void;
	onBannerError: () => void;
	activeTab: TabType;
	onTabChange: (tab: TabType) => void;
	getTabCount: (tabId: TabType) => number | undefined;
}

function ClubBannerCard({
	club,
	members,
	teams,
	groups,
	logoError,
	bannerError,
	onLogoError,
	onBannerError,
	activeTab,
	onTabChange,
	getTabCount,
}: ClubBannerCardProps) {
	return (
		<div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
			{/* Banner */}
			<div className="h-60 relative bg-gradient-to-r from-accent/20 to-primary/20">
				{club.bannerUrl && !bannerError ? (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={club.bannerUrl} alt="" className="w-full h-full object-cover" onError={onBannerError} />
						<div className="absolute inset-0 bg-black/30" />
					</>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<ImageOff className="text-white/20" size={32} />
					</div>
				)}
			</div>

			{/* Info Row */}
			<div className="p-6 flex items-center gap-6">
				{/* Logo */}
				<div className="w-32 h-32 rounded-xl bg-background-dark border-4 border-background-light overflow-hidden -mt-16 relative z-10 flex items-center justify-center">
					{club.logoUrl && !logoError ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={club.logoUrl} alt="" className="w-full h-full object-cover" onError={onLogoError} />
					) : (
						<Shield className="text-muted" size={32} />
					)}
				</div>

				{/* Details */}
				<div className="flex-1 min-w-0">
					<h2 className="text-xl font-bold text-white truncate">{club.name}</h2>
					{club.description && <p className="text-sm text-muted truncate">{club.description}</p>}
				</div>

				{/* Quick Stats */}
				<div className="flex gap-6">
					<StatItem label="Members" value={members.length} />
					<StatItem label="Teams" value={teams.length} />
					<StatItem label="Groups" value={groups.length} />
				</div>
			</div>

			{/* Tabs */}
			<div className="border-t border-white/10 px-6">
				<div className="flex gap-1 overflow-x-auto no-scrollbar">
					{TABS.map((tab) => {
						const count = getTabCount(tab.id);
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
