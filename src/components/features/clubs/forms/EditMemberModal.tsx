"use client";

import { Button } from "@/components";
import Modal from "@/components/ui/modal";
import { RoleCheckboxGroup } from "@/components/ui/role-checkbox-group";
import { UpdateClubMemberRequest } from "@/lib/api/clubs";
import { CLUB_ROLE_OPTIONS } from "@/lib/constants/roles";
import { ClubMember, ClubRole, SkillLevel } from "@/lib/models/Club";
import { useEffect, useState } from "react";

// Helper to extract role strings from role objects or strings
function extractRoleStrings(roles: any[] | undefined): string[] {
	if (!roles) return [];
	return roles.map((r) => (typeof r === "string" ? r : r?.role)).filter(Boolean);
}

interface EditMemberModalProps {
	isOpen: boolean;
	member: ClubMember | null;
	onClose: () => void;
	onSubmit: (data: UpdateClubMemberRequest) => void;
	isLoading?: boolean;
}

export default function EditMemberModal({ isOpen, member, onClose, onSubmit, isLoading = false }: EditMemberModalProps) {
	const [roles, setRoles] = useState<ClubRole[]>([]);
	const [skillLevel, setSkillLevel] = useState<string>("");
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		if (member) {
			setRoles(extractRoleStrings(member.roles) as ClubRole[]);
			setSkillLevel(member.skillLevel || "");
			setIsActive(member.isActive);
		}
	}, [member]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			roles,
			skillLevel: skillLevel || undefined,
			isActive,
		});
	};

	const memberName = member?.userProfile ? `${member.userProfile.name} ${member.userProfile.surname}` : "Member";

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Edit Member" description={`Update settings for ${memberName}`} size="md">
			<form onSubmit={handleSubmit} className="space-y-5">
				{/* Role Selection */}
				<div>
					<label className="block text-sm font-medium text-white mb-3">Assign Roles</label>
					<RoleCheckboxGroup
						availableRoles={CLUB_ROLE_OPTIONS}
						selectedRoles={roles}
						onChange={setRoles}
					/>
				</div>

				{/* Skill Level */}
				<div>
					<label className="block text-sm font-medium text-white mb-2">Skill Level</label>
					<select
						value={skillLevel}
						onChange={(e) => setSkillLevel(e.target.value)}
						className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-hidden focus:border-accent">
						<option value="">Not specified</option>
						{Object.values(SkillLevel).map((level) => (
							<option key={level} value={level}>
								{level}
							</option>
						))}
					</select>
				</div>

				{/* Active Status */}
				<div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
					<div>
						<p className="text-sm font-medium text-white">Active Status</p>
						<p className="text-xs text-muted mt-0.5">Inactive members cannot participate in club activities</p>
					</div>
					<label className="relative inline-flex items-center cursor-pointer">
						<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
						<div className="w-11 h-6 bg-hover peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:rtl:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
					</label>
				</div>

				{/* Member Info (Read-only) */}
				{member?.createdAt && (
					<div className="p-4 rounded-xl bg-surface border border-border">
						<p className="text-xs text-muted mb-1">Member since</p>
						<p className="text-sm text-white">
							{new Date(member.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-3 pt-4">
					<Button type="button" variant="ghost" color="neutral" fullWidth onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="default" color="accent" fullWidth loading={isLoading}>
						Save Changes
					</Button>
				</div>
			</form>
		</Modal>
	);
}
