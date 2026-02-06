"use client";

import { getClub, getGroup, getTeam } from "@/lib/api/clubs/clubs";
import { ContextType } from "@/lib/models/shared/models";
import { useQuery } from "@tanstack/react-query";
import { Building2, ShieldCheck, Users2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EventContextBadgeProps {
	contextId?: string;
	contextType?: ContextType;
}

const contextConfig = {
	club: {
		icon: Building2,
		label: "Club",
		color: "from-primary/20 to-primary/5 border-primary/30 text-primary",
		iconColor: "text-primary",
		href: (id: string) => `/dashboard/clubs/${id}`,
	},
	team: {
		icon: ShieldCheck,
		label: "Team",
		color: "from-secondary/20 to-secondary/5 border-secondary/30 text-secondary",
		iconColor: "text-secondary",
		href: (id: string) => `/dashboard/teams/${id}`,
	},
	group: {
		icon: Users2,
		label: "Group",
		color: "from-accent/20 to-accent/5 border-accent/30 text-accent",
		iconColor: "text-accent",
		href: (id: string) => `/dashboard/groups/${id}`,
	},
	event: {
		icon: Building2,
		label: "Standalone",
		color: "from-surface to-surface border-border text-muted",
		iconColor: "text-muted",
		href: () => "#",
	},
};

export default function EventContextBadge({ contextId, contextType }: EventContextBadgeProps) {
	// Normalize contextType to lowercase for comparison
	const normalizedType = contextType?.toLowerCase();

	// Fetch context data based on type
	const { data: club } = useQuery({
		queryKey: ["club", contextId],
		queryFn: () => getClub(contextId!),
		enabled: normalizedType === "club" && !!contextId,
	});

	const { data: team } = useQuery({
		queryKey: ["team", contextId],
		queryFn: () => getTeam(contextId!),
		enabled: normalizedType === "team" && !!contextId,
	});

	const { data: group } = useQuery({
		queryKey: ["group", contextId],
		queryFn: () => getGroup(contextId!),
		enabled: normalizedType === "group" && !!contextId,
	});

	// If no context, don't show anything
	// Also handle "None" from backend and empty GUIDs
	const emptyGuid = "00000000-0000-0000-0000-000000000000";
	const normalizedContextType = contextType?.toLowerCase() as keyof typeof contextConfig;
	if (!contextType || !contextId || normalizedContextType === "event" || contextType === "None" || contextId === emptyGuid) {
		return null;
	}

	const config = contextConfig[normalizedContextType];
	if (!config) {
		return null;
	}
	const Icon = config.icon;

	// Get the context entity data
	const contextData =
		normalizedContextType === "club" ? club : normalizedContextType === "team" ? team : normalizedContextType === "group" ? group : null;

	// Get logo/image URL
	const logoUrl = normalizedContextType === "club" ? club?.logoUrl : normalizedContextType === "team" ? team?.logoUrl : undefined;

	// Get parent club for teams/groups
	const parentClub = normalizedContextType === "team" ? team?.club : normalizedContextType === "group" ? group?.club : undefined;

	if (!contextData) {
		// Loading state - show skeleton
		return (
			<div className="flex items-center gap-2 animate-pulse">
				<div className="w-6 h-6 rounded-md bg-hover" />
				<div className="h-4 w-20 rounded bg-hover" />
			</div>
		);
	}

	return (
		<Link
			href={config.href(contextId)}
			className={`
				group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
				bg-gradient-to-r ${config.color} border
				hover:scale-[1.02] hover:shadow-lg transition-all duration-200
			`}>
			{/* Logo or Icon */}
			{logoUrl ? (
				<div className="w-5 h-5 rounded-md overflow-hidden bg-hover shrink-0">
					<Image src={logoUrl} alt="" width={20} height={20} className="w-full h-full object-cover" />
				</div>
			) : (
				<Icon size={16} className={`${config.iconColor} shrink-0`} />
			)}

			{/* Context info */}
			<div className="flex items-center gap-1.5 min-w-0">
				<span className="text-xs font-bold uppercase tracking-wide opacity-60">{config.label}:</span>
				<span className="text-sm font-semibold truncate max-w-[120px] group-hover:max-w-none transition-all">
					{contextData.name}
				</span>
			</div>

			{/* Parent club indicator for teams/groups */}
			{parentClub && (
				<>
					<span className="text-white/30 mx-0.5">•</span>
					<span className="text-xs text-muted truncate max-w-[80px]">{parentClub.name}</span>
				</>
			)}
		</Link>
	);
}
