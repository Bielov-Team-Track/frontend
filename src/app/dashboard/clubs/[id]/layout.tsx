"use client";

import { Avatar } from "@/components";
import { InviteeSelectorModal } from "@/components/features/events/forms/steps/registration";
import { getClub, getClubMembers, getGroupsByClub, getPendingRegistrationsCount, getTeamsByClub, inviteMembers } from "@/lib/api/clubs";
import { Club } from "@/lib/models/Club";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollableTabBar } from "@/components";
import { ArrowLeft, Building2, Calendar, ImageOff, Layers, Newspaper, Settings, Shield, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";

// Context to share club data with child pages
interface ClubContextValue {
	clubId: string;
	club: Club | undefined;
	members: any[];
	teams: any[];
	groups: any[];
	isLoading: boolean;
	showInviteModal: () => void;
}

const ClubContext = createContext<ClubContextValue | null>(null);

export function useClubContext() {
	const context = useContext(ClubContext);
	if (!context) {
		throw new Error("useClubContext must be used within ClubLayout");
	}
	return context;
}

type TabType = "posts" | "events" | "teams" | "groups" | "members" | "settings";

const TABS: { id: TabType; label: string; icon: typeof Building2 }[] = [
	{ id: "posts", label: "Posts", icon: Newspaper },
	{ id: "events", label: "Events", icon: Calendar },
	{ id: "teams", label: "Teams", icon: Users },
	{ id: "groups", label: "Groups", icon: Layers },
	{ id: "members", label: "Members", icon: UserPlus },
	{ id: "settings", label: "Settings", icon: Settings },
];

export default function ClubLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const clubId = params.id as string;
	const queryClient = useQueryClient();

	const [bannerError, setBannerError] = useState(false);
	const [showInviteModal, setShowInviteModal] = useState(false);

	// Determine active tab from pathname
	const getActiveTab = (): TabType => {
		if (pathname.includes("/settings")) return "settings";
		if (pathname.includes("/events")) return "events";
		if (pathname.includes("/teams")) return "teams";
		if (pathname.includes("/groups")) return "groups";
		if (pathname.includes("/members")) return "members";
		return "posts";
	};

	const activeTab = getActiveTab();

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

	const { data: pendingCount = 0 } = useQuery({
		queryKey: ["club-registrations-count", clubId],
		queryFn: () => getPendingRegistrationsCount(clubId),
		enabled: !!clubId,
	});

	// Mutations
	const inviteMutation = useMutation({
		mutationFn: (userIds: string[]) => inviteMembers(clubId, userIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
			setShowInviteModal(false);
		},
	});

	// Get tab counts
	const getTabCount = (tabId: TabType): number | string | undefined => {
		switch (tabId) {
			case "teams":
				return teams.length;
			case "groups":
				return groups.length;
			case "members":
				return pendingCount > 0 ? `+${pendingCount}` : members.length;
			default:
				return undefined;
		}
	};

	// Get tab href
	const getTabHref = (tabId: TabType): string => {
		const base = `/dashboard/clubs/${clubId}`;

		return `${base}/${tabId}`;
	};

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
				<h2 className="text-xl font-bold text-foreground mb-2">Club not found</h2>
				<Link href="/dashboard/clubs" className="text-accent hover:underline">
					Back to clubs
				</Link>
			</div>
		);
	}

	return (
		<ClubContext.Provider
			value={{
				clubId,
				club,
				members,
				teams,
				groups,
				isLoading: clubLoading,
				showInviteModal: () => setShowInviteModal(true),
			}}>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link href="/dashboard/clubs" className="p-2 rounded-lg bg-surface hover:bg-hover transition-colors">
						<ArrowLeft size={20} />
					</Link>
					<div className="flex-1">
						<h1 className="text-2xl font-bold text-foreground">{club.name}</h1>
						<p className="text-sm text-muted-foreground">Club Management</p>
					</div>
				</div>

				{/* Club Banner and Info */}
				<div className="rounded-2xl overflow-hidden border border-border bg-surface">
					{/* Banner */}
					<div className="h-40 sm:h-60 relative bg-linear-to-r from-accent/20 to-primary/20 overflow-hidden">
						{club.bannerUrl && !bannerError ? (
							<>
								<Image src={club.bannerUrl} alt="" fill className="object-cover" onError={() => setBannerError(true)} />
								<div className="absolute inset-0 bg-overlay-light" />
							</>
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<ImageOff className="text-muted/20" size={32} />
							</div>
						)}
					</div>

					{/* Info Row */}
					<div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
						{/* Logo + Details (mobile: side by side) */}
						<div className="flex items-center gap-4 sm:contents">
							<div className="-mt-12 sm:-mt-16 relative z-10 shrink-0">
								<Avatar size={"xl"} variant="club" src={club.logoUrl || undefined} />
							</div>
							<div className="flex-1 min-w-0 sm:order-none">
								<h2 className="text-lg sm:text-xl font-bold text-foreground truncate">{club.name}</h2>
								{club.description && <p className="text-sm text-muted-foreground line-clamp-2">{club.description}</p>}
							</div>
						</div>

						{/* Quick Stats */}
						<div className="flex gap-6 sm:shrink-0">
							<div className="text-center">
								<div className="text-xl sm:text-2xl font-bold text-foreground">{members.length}</div>
								<div className="text-xs text-muted-foreground">Members</div>
							</div>
							<div className="text-center">
								<div className="text-xl sm:text-2xl font-bold text-foreground">{teams.length}</div>
								<div className="text-xs text-muted-foreground">Teams</div>
							</div>
							<div className="text-center">
								<div className="text-xl sm:text-2xl font-bold text-foreground">{groups.length}</div>
								<div className="text-xs text-muted-foreground">Groups</div>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<ScrollableTabBar>
						{TABS.map((tab) => {
							const count = getTabCount(tab.id);
							const isActive = activeTab === tab.id;
							return (
								<Link
									key={tab.id}
									href={getTabHref(tab.id)}
									prefetch={true}
									className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0 ${
										isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
									}`}>
									<tab.icon size={16} />
									{tab.label}
									{count !== undefined && <span className="px-1.5 py-0.5 rounded-full bg-foreground/10 text-xs">{count}</span>}
									{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
								</Link>
							);
						})}
					</ScrollableTabBar>
				</div>

				{/* Tab Content */}
				<div className="min-h-100">{children}</div>

				{/* Invite Modal */}
				<InviteeSelectorModal
					isOpen={showInviteModal}
					onClose={() => setShowInviteModal(false)}
					onConfirm={(data) => inviteMutation.mutate(data.map((u) => u.id))}
					selectedUsers={[]}
				/>
			</div>
		</ClubContext.Provider>
	);
}
