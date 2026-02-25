"use client";

import { Avatar, ScrollableTabBar } from "@/components";
import { getClub, getClubMembers, getGroup } from "@/lib/api/clubs";
import { Club, ClubMember, Group, Visibility } from "@/lib/models/Club";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Info, Layers, Lock, MessageSquare, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRoleSummary } from "@/hooks/useRoleSummary";
import { useGroupPermissions, GroupPermissions } from "@/hooks/useGroupPermissions";

// Context to share group data with child pages
interface GroupContextValue {
	groupId: string;
	group: Group | undefined;
	club: Club | undefined;
	clubMembers: ClubMember[];
	isLoading: boolean;
	permissions: GroupPermissions;
	effectiveVisibility: Visibility;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function useGroupContext() {
	const context = useContext(GroupContext);
	if (!context) {
		throw new Error("useGroupContext must be used within GroupLayout");
	}
	return context;
}

type TabType = "events" | "posts" | "members" | "settings";

const ALL_TABS: { id: TabType; label: string; icon: typeof Calendar; showCount?: boolean }[] = [
	{ id: "events", label: "Events", icon: Calendar },
	{ id: "posts", label: "Posts", icon: MessageSquare },
	{ id: "members", label: "Members", icon: Users, showCount: true },
	{ id: "settings", label: "Settings", icon: Settings },
];

export default function GroupLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const groupId = params.id as string;

	const { userProfile } = useAuth();
	const { data: roleSummary } = useRoleSummary(!!userProfile);

	// Determine active tab from pathname
	const getActiveTab = (): TabType => {
		if (pathname.includes("/settings")) return "settings";
		if (pathname.includes("/posts")) return "posts";
		if (pathname.includes("/members")) return "members";
		return "events";
	};

	const activeTab = getActiveTab();

	// Queries
	const { data: group, isLoading: groupLoading } = useQuery({
		queryKey: ["group", groupId],
		queryFn: () => getGroup(groupId),
	});

	const { data: club } = useQuery({
		queryKey: ["club", group?.clubId],
		queryFn: () => getClub(group!.clubId),
		enabled: !!group?.clubId,
	});

	const { data: clubMembers = [] } = useQuery({
		queryKey: ["club-members", group?.clubId],
		queryFn: () => getClubMembers(group!.clubId),
		enabled: !!group?.clubId,
	});

	// Resolve roles for permission computation
	const groupRoles = useMemo(
		() => roleSummary?.groups.find((g) => g.groupId === groupId)?.roles ?? [],
		[roleSummary, groupId]
	);

	const clubRoles = useMemo(
		() => (group?.clubId ? (roleSummary?.clubs.find((c) => c.clubId === group.clubId)?.roles ?? []) : []),
		[roleSummary, group?.clubId]
	);

	// A user is a group member if they appear in the role summary groups list for this group
	const isGroupMember = useMemo(
		() => roleSummary?.groups.some((g) => g.groupId === groupId) ?? false,
		[roleSummary, groupId]
	);

	const effectiveVisibility: Visibility = group?.effectiveVisibility ?? "Public";

	const permissions = useGroupPermissions(groupRoles, clubRoles, isGroupMember, effectiveVisibility);

	// Filter tabs based on permissions
	const visibleTabs = useMemo(() => {
		if (!permissions.canViewGroup) {
			return [];
		}
		return ALL_TABS.filter((tab) => tab.id !== "settings" || permissions.canEditGroup);
	}, [permissions]);

	// Get tab href
	const getTabHref = (tabId: TabType): string => {
		const base = `/hub/groups/${groupId}`;
		return `${base}/${tabId}`;
	};

	// Loading state
	if (groupLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	// Not found state
	if (!group) {
		return (
			<div className="text-center py-20">
				<Layers className="w-16 h-16 text-muted mx-auto mb-4" />
				<h2 className="text-xl font-bold text-foreground mb-2">Group not found</h2>
				<Link href="/hub/clubs" className="text-accent hover:underline">
					Back to clubs
				</Link>
			</div>
		);
	}

	return (
		<GroupContext.Provider
			value={{
				groupId,
				group,
				club,
				clubMembers,
				isLoading: groupLoading,
				permissions,
				effectiveVisibility,
			}}>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link href={`/hub/clubs/${group.clubId}`} className="p-2 rounded-lg bg-surface hover:bg-hover transition-colors">
						<ArrowLeft size={20} />
					</Link>
					<div className="flex-1">
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
							{group.skillLevel && <span className="px-2 py-0.5 rounded text-xs font-medium bg-hover text-muted">{group.skillLevel}</span>}
							{effectiveVisibility === "Private" && (
								<span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-hover text-muted">
									<Lock size={10} />
									Private
								</span>
							)}
						</div>
						<div className="flex items-center gap-2 text-sm text-muted">
							<span>Group</span>
							<span>•</span>
							<Link href={`/hub/clubs/${group.clubId}`} className="hover:text-accent">
								{club?.name || "Loading club..."}
							</Link>
						</div>
					</div>
				</div>

				{/* Private group gate for non-members */}
				{!permissions.canViewGroup && effectiveVisibility === "Private" ? (
					<div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-border bg-surface text-sm text-muted">
						<Info size={16} className="mt-0.5 shrink-0 text-accent" />
						<span>This group is private. You need to be a member to access it.</span>
					</div>
				) : (
					<>
						{/* Group Banner/Info */}
						<div className="rounded-2xl overflow-hidden border border-border bg-surface">
							{/* Banner Area (using color) */}
							<div
								className="h-32 relative"
								style={{
									backgroundColor: group.color || "#6B7280",
									opacity: 0.8,
								}}>
								<div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
							</div>

							{/* Info Row */}
							<div className="p-6 flex items-center gap-6">
								{/* Icon */}
								<Avatar name={group.name} size="lg" color={group.color} variant="group" />

								{/* Details */}
								<div className="flex-1 min-w-0">
									<h2 className="text-xl font-bold text-foreground truncate">{group.name}</h2>
									{group.description && <p className="text-sm text-muted truncate">{group.description}</p>}
								</div>

								{/* Quick Stats */}
								<div className="flex gap-6">
									<div className="text-center">
										<div className="text-2xl font-bold text-foreground">{group.members?.length || 0}</div>
										<div className="text-xs text-muted">Members</div>
									</div>
								</div>
							</div>

							{/* Tabs */}
							<ScrollableTabBar>
								{visibleTabs.map((tab) => {
									const count = tab.showCount ? group.members?.length || 0 : undefined;
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
					</>
				)}
			</div>
		</GroupContext.Provider>
	);
}
