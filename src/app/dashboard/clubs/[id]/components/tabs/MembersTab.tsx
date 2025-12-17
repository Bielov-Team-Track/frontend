"use client";

import { EditMemberModal, MemberRow } from "@/components/features/clubs";
import Button from "@/components/ui/button";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import EmptyState from "@/components/ui/empty-state";
import { ClubMember, ClubRole } from "@/lib/models/Club";
import { leaveClub, updateClubMember, UpdateClubMemberRequest } from "@/lib/requests/clubs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, UserPlus } from "lucide-react";
import { useState } from "react";

interface MembersTabProps {
	members: ClubMember[];
	clubId: string;
	currentUserRole?: ClubRole;
	onInvite: () => void;
}

export default function MembersTab({ members, clubId, currentUserRole, onInvite }: MembersTabProps) {
	const [editingMember, setEditingMember] = useState<ClubMember | null>(null);
	const [removingMember, setRemovingMember] = useState<ClubMember | null>(null);
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: (data: UpdateClubMemberRequest) => updateClubMember(clubId, editingMember!.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
			setEditingMember(null);
		},
	});

	const removeMutation = useMutation({
		mutationFn: (userId: string) => leaveClub(clubId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
			setRemovingMember(null);
		},
	});

	const getMemberDisplayName = (member: ClubMember) => {
		if (member.userProfile) {
			return `${member.userProfile.name} ${member.userProfile.surname}`;
		}
		return "this member";
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-white">Members ({members.length})</h3>
				<Button variant="solid" color="accent" onClick={onInvite} leftIcon={<Plus size={16} />}>
					Invite Member
				</Button>
			</div>

			{/* Members List */}
			{members.length === 0 ? (
				<EmptyState
					icon={UserPlus}
					title="No members yet"
					description="Invite members to join your club"
					action={{
						label: "Invite Member",
						onClick: onInvite,
						icon: Plus,
					}}
				/>
			) : (
				<div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
					<table className="w-full">
						<thead>
							<tr className="border-b border-white/10">
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Member</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Role</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Skill Level</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Joined</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Status</th>
								<th className="text-right text-xs font-medium text-muted px-4 py-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{members.map((member) => (
								<MemberRow
									key={member.id}
									member={member}
									clubId={clubId}
									currentUserRole={currentUserRole}
									onEdit={() => setEditingMember(member)}
									onRemove={() => setRemovingMember(member)}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Edit Member Modal */}
			<EditMemberModal
				isOpen={!!editingMember}
				member={editingMember}
				onClose={() => setEditingMember(null)}
				onSubmit={(data) => updateMutation.mutate(data)}
				isLoading={updateMutation.isPending}
			/>

			{/* Remove Member Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={!!removingMember}
				title="Remove Member"
				itemName={removingMember ? getMemberDisplayName(removingMember) : ""}
				description={
					removingMember
						? `Are you sure you want to remove ${getMemberDisplayName(removingMember)} from this club? They will lose access to all club resources.`
						: undefined
				}
				onClose={() => setRemovingMember(null)}
				onConfirm={() => removingMember && removeMutation.mutate(removingMember.userId)}
				isLoading={removeMutation.isPending}
				confirmText="Remove"
			/>
		</div>
	);
}
