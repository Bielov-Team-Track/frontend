"use client";

import Link from "next/link";
import { Edit, UserMinus } from "lucide-react";
import { Avatar } from "@/components";
import { ClubMember, ClubRole } from "@/lib/models/Club";

interface MemberRowProps {
	member: ClubMember;
	clubId: string;
	currentUserRole?: ClubRole;
	onEdit: () => void;
	onRemove?: () => void;
}

const getRoleBadgeColor = (role: ClubRole) => {
	switch (role) {
		case ClubRole.Owner:
			return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
		case ClubRole.Admin:
			return "bg-purple-500/20 text-purple-400 border-purple-500/30";
		case ClubRole.Coach:
			return "bg-blue-500/20 text-blue-400 border-blue-500/30";
		case ClubRole.Assistant:
			return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
		default:
			return "bg-white/10 text-muted border-white/10";
	}
};

const getSkillLevelBadge = (skillLevel?: string) => {
	if (!skillLevel) return null;

	const colors: Record<string, string> = {
		Beginner: "bg-green-500/20 text-green-400 border-green-500/30",
		Intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		Advanced: "bg-orange-500/20 text-orange-400 border-orange-500/30",
		Expert: "bg-red-500/20 text-red-400 border-red-500/30",
	};

	return (
		<span
			className={`px-2 py-0.5 rounded text-xs font-medium border ${
				colors[skillLevel] || "bg-white/10 text-muted border-white/10"
			}`}>
			{skillLevel}
		</span>
	);
};

export default function MemberRow({
	member,
	clubId,
	currentUserRole,
	onEdit,
	onRemove,
}: MemberRowProps) {
	const memberUrl = `/dashboard/clubs/${clubId}/members/${member.userId}`;

	// Check if current user can remove this member
	// Owners and Admins can remove members, but not themselves or other owners
	const canRemove =
		onRemove &&
		(currentUserRole === ClubRole.Owner || currentUserRole === ClubRole.Admin) &&
		member.role !== ClubRole.Owner;

	return (
		<tr className="border-b border-white/5 hover:bg-white/5 group">
			<td className="px-4 py-3">
				<Link href={memberUrl} className="flex items-center gap-3">
					{member.userProfile && <Avatar profile={member.userProfile} />}
					<div>
						<div className="text-sm font-medium text-white group-hover:text-accent transition-colors">
							{member.userProfile?.name} {member.userProfile?.surname}
						</div>
						<div className="text-xs text-muted">
							{member.userProfile?.email || "No email"}
						</div>
					</div>
				</Link>
			</td>
			<td className="px-4 py-3">
				<Link href={memberUrl}>
					<span
						className={`px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(
							member.role
						)}`}>
						{member.role}
					</span>
				</Link>
			</td>
			<td className="px-4 py-3">
				<Link href={memberUrl}>
					{getSkillLevelBadge(member.skillLevel)}
					{!member.skillLevel && (
						<span className="text-xs text-muted">—</span>
					)}
				</Link>
			</td>
			<td className="px-4 py-3">
				<Link href={memberUrl} className="text-sm text-muted">
					{member.createdAt
						? new Date(member.createdAt).toLocaleDateString()
						: "Unknown"}
				</Link>
			</td>
			<td className="px-4 py-3">
				<Link href={memberUrl}>
					{member.isActive ? (
						<span className="inline-flex items-center gap-1.5 text-xs text-green-400">
							<span className="w-1.5 h-1.5 rounded-full bg-green-400" />
							Active
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 text-xs text-muted">
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
						className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
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
