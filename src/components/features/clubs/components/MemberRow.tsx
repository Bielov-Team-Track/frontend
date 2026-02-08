"use client";

import { Avatar } from "@/components";
import { RoleBadgeList } from "@/components/ui/role-badge";
import { SubscriptionBadge } from "@/components/features/subscriptions/SubscriptionBadge";
import { ClubMember, ClubRole } from "@/lib/models/Club";
import { Subscription } from "@/lib/models/Subscription";
import { Edit, UserMinus } from "lucide-react";
import Link from "next/link";

// Helper to extract role strings from role objects or strings
function extractRoleStrings(roles: any[] | undefined): string[] {
	if (!roles) return [];
	return roles.map((r) => (typeof r === "string" ? r : r?.role)).filter(Boolean);
}

interface MemberRowProps {
	member: ClubMember;
	clubId: string;
	currentUserRole?: ClubRole;
	subscription?: Subscription;
	onEdit: () => void;
	onRemove?: () => void;
}

const getSkillLevelBadge = (skillLevel?: string) => {
	if (!skillLevel) return null;

	const colors: Record<string, string> = {
		Beginner: "bg-success/20 text-success border-success/30",
		Intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		Advanced: "bg-primary/20 text-primary border-primary/30",
		Expert: "bg-red-500/20 text-red-400 border-red-500/30",
	};

	return (
		<span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[skillLevel] || "bg-surface text-muted-foreground border-border"}`}>{skillLevel}</span>
	);
};

export default function MemberRow({ member, clubId, currentUserRole, subscription, onEdit, onRemove }: MemberRowProps) {
	const memberUrl = `/hub/clubs/${clubId}/members/${member.userId}`;

	// Check if current user can remove this member
	// Owners and Admins can remove members, but not themselves or other owners
	const canRemove = onRemove && (currentUserRole === ClubRole.Owner || currentUserRole === ClubRole.Admin) && !extractRoleStrings(member.roles).includes(ClubRole.Owner);

	return (
		<tr className="border-b border-border hover:bg-muted/10 group">
			<td className="px-4 py-3">
				<Link href={memberUrl} className="flex items-center gap-3">
					{member.userProfile && <Avatar name={member.userProfile.name + " " + member.userProfile.surname} src={member.userProfile.imageUrl} />}
					<div>
						<div className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
							{member.userProfile?.name} {member.userProfile?.surname}
						</div>
						<div className="text-xs text-muted-foreground">{member.userProfile?.email || "No email"}</div>
					</div>
				</Link>
			</td>
			<td className="px-4 py-3">
				<Link href={memberUrl} className="flex flex-wrap items-center gap-1">
					<RoleBadgeList roles={extractRoleStrings(member.roles)} />
					{subscription && (
						<SubscriptionBadge status={subscription.status} planName={subscription.planName} />
					)}
				</Link>
			</td>
			<td className="px-4 py-3">
				<Link href={memberUrl}>
					{getSkillLevelBadge(member.skillLevel)}
					{!member.skillLevel && <span className="text-xs text-muted-foreground">—</span>}
				</Link>
			</td>
			<td className="px-4 py-3">
				<Link href={memberUrl} className="text-sm text-muted-foreground">
					{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "Unknown"}
				</Link>
			</td>
			<td className="px-4 py-3">
				<Link href={memberUrl}>
					{member.isActive ? (
						<span className="inline-flex items-center gap-1.5 text-xs text-success">
							<span className="w-1.5 h-1.5 rounded-full bg-success" />
							Active
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
							<span className="w-1.5 h-1.5 rounded-full bg-muted" />
							Inactive
						</span>
					)}
				</Link>
			</td>
			<td className="px-4 py-3 text-right">
				<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onEdit();
						}}
						className="p-2 rounded-lg hover:bg-hover text-muted hover:text-foreground transition-colors"
						title="Edit member">
						<Edit size={16} />
					</button>
					{canRemove && (
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onRemove();
							}}
							className="p-2 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
							title="Remove member">
							<UserMinus size={16} />
						</button>
					)}
				</div>
			</td>
		</tr>
	);
}
