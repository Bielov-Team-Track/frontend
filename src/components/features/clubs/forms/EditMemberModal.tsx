"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import { ClubMember, ClubRole, SkillLevel } from "@/lib/models/Club";
import { UpdateClubMemberRequest } from "@/lib/api/clubs";

interface EditMemberModalProps {
	isOpen: boolean;
	member: ClubMember | null;
	onClose: () => void;
	onSubmit: (data: UpdateClubMemberRequest) => void;
	isLoading?: boolean;
}

export default function EditMemberModal({
	isOpen,
	member,
	onClose,
	onSubmit,
	isLoading = false,
}: EditMemberModalProps) {
	const [role, setRole] = useState<string>(ClubRole.Member);
	const [skillLevel, setSkillLevel] = useState<string>("");
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		if (member) {
			setRole(member.role);
			setSkillLevel(member.skillLevel || "");
			setIsActive(member.isActive);
		}
	}, [member]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			role,
			skillLevel: skillLevel || undefined,
			isActive,
		});
	};

	const memberName = member?.userProfile
		? `${member.userProfile.name} ${member.userProfile.surname}`
		: "Member";

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Edit Member"
			description={`Update settings for ${memberName}`}
			size="md">
			<form onSubmit={handleSubmit} className="space-y-5">
				{/* Role Selection */}
				<div>
					<label className="block text-sm font-medium text-white mb-2">
						Role
					</label>
					<div className="space-y-2">
						{Object.values(ClubRole).map((r) => (
							<label
								key={r}
								className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
									role === r
										? "bg-accent/20 border-accent"
										: "bg-white/5 border-white/10 hover:border-white/20"
								}`}>
								<div className="flex items-center gap-3">
									<input
										type="radio"
										name="role"
										value={r}
										checked={role === r}
										onChange={(e) => setRole(e.target.value)}
										className="accent-accent"
									/>
									<div>
										<span className="text-white">{r}</span>
										<p className="text-xs text-muted mt-0.5">
											{getRoleDescription(r)}
										</p>
									</div>
								</div>
							</label>
						))}
					</div>
				</div>

				{/* Skill Level */}
				<div>
					<label className="block text-sm font-medium text-white mb-2">
						Skill Level
					</label>
					<select
						value={skillLevel}
						onChange={(e) => setSkillLevel(e.target.value)}
						className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent">
						<option value="">Not specified</option>
						{Object.values(SkillLevel).map((level) => (
							<option key={level} value={level}>
								{level}
							</option>
						))}
					</select>
				</div>

				{/* Active Status */}
				<div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
					<div>
						<p className="text-sm font-medium text-white">Active Status</p>
						<p className="text-xs text-muted mt-0.5">
							Inactive members cannot participate in club activities
						</p>
					</div>
					<label className="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							checked={isActive}
							onChange={(e) => setIsActive(e.target.checked)}
							className="sr-only peer"
						/>
						<div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
					</label>
				</div>

				{/* Member Info (Read-only) */}
				{member?.createdAt && (
					<div className="p-4 rounded-xl bg-white/5 border border-white/10">
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
					<Button
						type="button"
						variant="ghost"
						color="neutral"
						fullWidth
						onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="solid"
						color="accent"
						fullWidth
						loading={isLoading}>
						Save Changes
					</Button>
				</div>
			</form>
		</Modal>
	);
}

function getRoleDescription(role: ClubRole): string {
	switch (role) {
		case ClubRole.Owner:
			return "Full control over club settings and members";
		case ClubRole.Admin:
			return "Can manage members, teams, and groups";
		case ClubRole.Coach:
			return "Can manage teams and training sessions";
		case ClubRole.Assistant:
			return "Can help with club activities";
		case ClubRole.Member:
			return "Regular club member";
		default:
			return "";
	}
}
