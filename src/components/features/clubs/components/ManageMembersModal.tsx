"use client";

import { Button } from "@/components";
import Modal from "@/components/ui/modal";
import { ClubMember } from "@/lib/models/Club";
import { Search, UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";

interface ManageMembersModalProps {
	isOpen: boolean;
	title: string;
	subtitle?: string;
	icon?: React.ReactNode;
	members: ClubMember[];
	currentMemberIds: Set<string>;
	getMemberId: (member: ClubMember) => string;
	onClose: () => void;
	onAddMember: (memberId: string) => void;
	onRemoveMember: (memberId: string) => void;
	isLoading?: boolean;
	memberCount?: number;
	accentColor?: string;
}

export default function ManageMembersModal({
	isOpen,
	title,
	subtitle,
	icon,
	members,
	currentMemberIds,
	getMemberId,
	onClose,
	onAddMember,
	onRemoveMember,
	isLoading = false,
	memberCount = 0,
	accentColor,
}: ManageMembersModalProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredMembers = members.filter((member) => {
		const name = `${member.userProfile?.name || ""} ${member.userProfile?.surname || ""}`.toLowerCase();
		const email = member.userProfile?.email?.toLowerCase() || "";
		const query = searchQuery.toLowerCase();
		return name.includes(query) || email.includes(query);
	});

	const isMemberIncluded = (member: ClubMember) => {
		return currentMemberIds.has(getMemberId(member));
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
			<div className="space-y-4">
				{/* Header with icon and subtitle */}
				{(icon || subtitle) && (
					<div className="flex items-center gap-3 -mt-2 mb-4">
						{icon}
						{subtitle && <p className="text-sm text-muted">{subtitle}</p>}
					</div>
				)}

				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search members..."
						className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent"
					/>
				</div>

				{/* Members List */}
				<div className="max-h-[400px] overflow-y-auto space-y-2">
					{filteredMembers.length === 0 ? (
						<div className="text-center py-8 text-muted">
							<Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
							<p>No members found</p>
						</div>
					) : (
						filteredMembers.map((member) => {
							const isIncluded = isMemberIncluded(member);
							return (
								<div
									key={member.id}
									className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
										isIncluded ? "bg-accent/10 border-accent/30" : "bg-white/5 border-white/10 hover:border-white/20"
									}`}>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-background-dark flex items-center justify-center text-sm font-bold text-muted">
											{member.userProfile?.name?.[0] || "?"}
										</div>
										<div>
											<div className="text-sm font-medium text-white">
												{member.userProfile?.name} {member.userProfile?.surname}
											</div>
											<div className="text-xs text-muted">{member.role}</div>
										</div>
									</div>
									<button
										onClick={() => (isIncluded ? onRemoveMember(getMemberId(member)) : onAddMember(getMemberId(member)))}
										disabled={isLoading}
										className={`p-2 rounded-lg transition-colors ${
											isIncluded ? "bg-red-500/20 hover:bg-red-500/30 text-red-400" : "bg-accent/20 hover:bg-accent/30 text-accent"
										}`}>
										{isIncluded ? <UserMinus size={18} /> : <UserPlus size={18} />}
									</button>
								</div>
							);
						})
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
					<div className="flex items-center gap-2">
						{accentColor && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />}
						<span className="text-muted">{memberCount} members selected</span>
					</div>
					<Button variant="ghost" color="neutral" onClick={onClose}>
						Done
					</Button>
				</div>
			</div>
		</Modal>
	);
}
