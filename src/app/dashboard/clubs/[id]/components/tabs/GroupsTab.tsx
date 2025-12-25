"use client";

import { Button } from "@/components";
import GroupCard from "@/components/features/clubs/components/GroupCard";
import ManageMembersModal from "@/components/features/clubs/components/ManageMembersModal";
import GroupFormModal from "@/components/features/clubs/forms/GroupFormModal";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import EmptyState from "@/components/ui/empty-state";
import { addGroupMember, createGroup, deleteGroup, removeGroupMember, updateGroup } from "@/lib/api/clubs";
import { ClubMember, CreateGroupRequest, Group, UpdateGroupRequest } from "@/lib/models/Club";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus } from "lucide-react";
import { useState } from "react";

interface GroupsTabProps {
	groups: Group[];
	clubId: string;
	clubMembers: ClubMember[];
}

export default function GroupsTab({ groups, clubId, clubMembers }: GroupsTabProps) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingGroup, setEditingGroup] = useState<Group | null>(null);
	const [managingGroup, setManagingGroup] = useState<Group | null>(null);
	const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: createGroup,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-groups", clubId] });
			setShowCreateModal(false);
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ groupId, data }: { groupId: string; data: UpdateGroupRequest }) => updateGroup(groupId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-groups", clubId] });
			setEditingGroup(null);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteGroup,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-groups", clubId] });
			setDeletingGroup(null);
		},
	});

	const addMemberMutation = useMutation({
		mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => addGroupMember(groupId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-groups", clubId] });
		},
	});

	const removeMemberMutation = useMutation({
		mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => removeGroupMember(groupId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-groups", clubId] });
		},
	});

	const groupMemberClubMemberIds = managingGroup ? new Set(managingGroup.members?.map((m) => m.clubMemberId) || []) : new Set<string>();

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-white">Groups ({groups.length})</h3>
				<Button variant="default" color="accent" onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={16} />}>
					Create Group
				</Button>
			</div>

			{/* Groups Grid */}
			{groups.length === 0 ? (
				<EmptyState
					icon={Layers}
					title="No groups yet"
					description="Create groups to organize members for events and activities"
					action={{
						label: "Create Group",
						onClick: () => setShowCreateModal(true),
						icon: Plus,
					}}
				/>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{groups.map((group) => (
						<GroupCard
							key={group.id}
							group={group}
							onManage={() => setManagingGroup(group)}
							onEdit={() => setEditingGroup(group)}
							onDelete={() => setDeletingGroup(group)}
						/>
					))}
				</div>
			)}

			{/* Create Group Modal */}
			<GroupFormModal
				isOpen={showCreateModal}
				clubId={clubId}
				onClose={() => setShowCreateModal(false)}
				onSubmit={(data) => createMutation.mutate(data as CreateGroupRequest)}
				isLoading={createMutation.isPending}
			/>

			{/* Edit Group Modal */}
			<GroupFormModal
				isOpen={!!editingGroup}
				group={editingGroup}
				clubId={clubId}
				onClose={() => setEditingGroup(null)}
				onSubmit={(data) =>
					editingGroup &&
					updateMutation.mutate({
						groupId: editingGroup.id,
						data: data as UpdateGroupRequest,
					})
				}
				isLoading={updateMutation.isPending}
			/>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={!!deletingGroup}
				title="Delete Group"
				itemName={deletingGroup?.name || ""}
				onClose={() => setDeletingGroup(null)}
				onConfirm={() => deletingGroup && deleteMutation.mutate(deletingGroup.id)}
				isLoading={deleteMutation.isPending}
			/>

			{/* Manage Members Modal */}
			{managingGroup && (
				<ManageMembersModal
					isOpen={!!managingGroup}
					title="Manage Group Members"
					subtitle={managingGroup.name}
					icon={
						<div
							className="w-10 h-10 rounded-lg flex items-center justify-center"
							style={{
								backgroundColor: managingGroup.color || "#6B7280",
							}}>
							<Layers className="text-white" size={18} />
						</div>
					}
					members={clubMembers}
					currentMemberIds={groupMemberClubMemberIds}
					getMemberId={(member) => member.id}
					onClose={() => setManagingGroup(null)}
					onAddMember={(userId) => addMemberMutation.mutate({ groupId: managingGroup.id, userId })}
					onRemoveMember={(userId) => removeMemberMutation.mutate({ groupId: managingGroup.id, userId })}
					isLoading={addMemberMutation.isPending || removeMemberMutation.isPending}
					memberCount={managingGroup.members?.length || 0}
					accentColor={managingGroup.color || "#6B7280"}
				/>
			)}
		</div>
	);
}
