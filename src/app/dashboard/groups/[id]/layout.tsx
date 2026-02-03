"use client";

import { Avatar } from "@/components";
import { getClub, getGroup } from "@/lib/api/clubs";
import { Club, Group } from "@/lib/models/Club";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Layers, MessageSquare, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createContext, useContext } from "react";

// Context to share group data with child pages
interface GroupContextValue {
	groupId: string;
	group: Group | undefined;
	club: Club | undefined;
	isLoading: boolean;
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

const TABS: { id: TabType; label: string; icon: typeof Calendar; showCount?: boolean }[] = [
	{ id: "events", label: "Events", icon: Calendar },
	{ id: "posts", label: "Posts", icon: MessageSquare },
	{ id: "members", label: "Members", icon: Users, showCount: true },
	{ id: "settings", label: "Settings", icon: Settings },
];

export default function GroupLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const groupId = params.id as string;

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

	// Get tab href
	const getTabHref = (tabId: TabType): string => {
		const base = `/dashboard/groups/${groupId}`;
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
				<h2 className="text-xl font-bold text-white mb-2">Group not found</h2>
				<Link href="/dashboard/clubs" className="text-accent hover:underline">
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
				isLoading: groupLoading,
			}}>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link href={`/dashboard/clubs/${group.clubId}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
						<ArrowLeft size={20} />
					</Link>
					<div className="flex-1">
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold text-white">{group.name}</h1>
							{group.skillLevel && <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-muted">{group.skillLevel}</span>}
						</div>
						<div className="flex items-center gap-2 text-sm text-muted">
							<span>Group</span>
							<span>•</span>
							<Link href={`/dashboard/clubs/${group.clubId}`} className="hover:text-accent">
								{club?.name || "Loading club..."}
							</Link>
						</div>
					</div>
				</div>

				{/* Group Banner/Info */}
				<div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
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
							<h2 className="text-xl font-bold text-white truncate">{group.name}</h2>
							{group.description && <p className="text-sm text-muted truncate">{group.description}</p>}
						</div>

						{/* Quick Stats */}
						<div className="flex gap-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-white">{group.members?.length || 0}</div>
								<div className="text-xs text-muted">Members</div>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<div className="border-t border-white/10 px-6">
						<div className="flex gap-1 overflow-x-auto no-scrollbar">
							{TABS.map((tab) => {
								const count = tab.showCount ? group.members?.length || 0 : undefined;
								const isActive = activeTab === tab.id;
								return (
									<Link
										key={tab.id}
										href={getTabHref(tab.id)}
										prefetch={true}
										className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0 ${
											isActive ? "text-accent" : "text-muted hover:text-white"
										}`}>
										<tab.icon size={16} />
										{tab.label}
										{count !== undefined && <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs">{count}</span>}
										{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
									</Link>
								);
							})}
						</div>
					</div>
				</div>

				{/* Tab Content */}
				<div className="min-h-[400px]">{children}</div>
			</div>
		</GroupContext.Provider>
	);
}
