"use client";

import { AddTeamMemberModal, EditTeamMemberModal, RosterSidebar, VolleyballCourt } from "@/components/features/teams";
import { PlayerDragOverlay, groupMembersByPosition, POSITION_ORDER } from "@/components/features/teams/components/RosterSidebar";
import Button from "@/components/ui/button";
import { ClubMember, Team, TeamMember, VolleyballPosition, PositionAssignment } from "@/lib/models/Club";
import { addTeamMember, updateTeamMember } from "@/lib/api/clubs";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverEvent, rectIntersection } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

interface RosterTabProps {
	team: Team;
	clubMembers: ClubMember[];
	teamId: string;
}

// Map court position IDs to VolleyballPosition enum
const COURT_TO_POSITION: Record<string, VolleyballPosition> = {
	"P1": VolleyballPosition.Setter,
	"P2": VolleyballPosition.OppositeHitter,
	"P3": VolleyballPosition.MiddleBlocker,
	"P4": VolleyballPosition.OutsideHitter,
	"P5": VolleyballPosition.OutsideHitter,
	"P6": VolleyballPosition.MiddleBlocker,
	"Libero": VolleyballPosition.Libero,
};

export default function RosterTab({ team, clubMembers, teamId }: RosterTabProps) {
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
	const [assigningPosition, setAssigningPosition] = useState<string | null>(null);
	// Court assignments: positionId -> array of member IDs in priority order
	const [courtAssignments, setCourtAssignments] = useState<Record<string, PositionAssignment[]>>({});
	// Sidebar position priorities: VolleyballPosition -> ordered member IDs
	const [sidebarPriorities, setSidebarPriorities] = useState<Record<string, string[]>>({});
	const [activeDragMember, setActiveDragMember] = useState<TeamMember | null>(null);
	const [activeOverPosition, setActiveOverPosition] = useState<string | null>(null);

	const queryClient = useQueryClient();

	// Configure sensors for drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	);

	const addMemberMutation = useMutation({
		mutationFn: ({ userId, positions, jerseyNumber }: { userId: string; positions: string[]; jerseyNumber?: string }) =>
			addTeamMember(teamId, userId, positions, jerseyNumber),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", teamId] });
			setShowAddModal(false);
		},
	});

	// Mutation for updating team member positions
	const updatePositionMutation = useMutation({
		mutationFn: async ({ memberId, positions }: { memberId: string; positions: VolleyballPosition[] }) => {
			return updateTeamMember(teamId, memberId, { positions });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", teamId] });
		},
	});

	// Mutation for editing team member (positions + jersey number)
	const editMemberMutation = useMutation({
		mutationFn: async ({ memberId, positions, jerseyNumber }: { memberId: string; positions: VolleyballPosition[]; jerseyNumber?: string }) => {
			return updateTeamMember(teamId, memberId, { positions, jerseyNumber });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", teamId] });
			setEditingMember(null);
		},
	});

	// Get member IDs array from assignments for a position (for compatibility with VolleyballCourt)
	const getAssignmentMemberIds = useCallback((positionId: string): string[] => {
		return (courtAssignments[positionId] || [])
			.sort((a, b) => a.priority - b.priority)
			.map(a => a.memberId);
	}, [courtAssignments]);

	// Convert assignments to the format VolleyballCourt expects
	const courtAssignmentsForCourt = useMemo(() => {
		return Object.keys(courtAssignments).reduce((acc, posId) => {
			acc[posId] = getAssignmentMemberIds(posId);
			return acc;
		}, {} as Record<string, string[]>);
	}, [courtAssignments, getAssignmentMemberIds]);

	const togglePlayerAssignment = useCallback((memberId: string) => {
		if (!assigningPosition) return;

		const member = team.members?.find(m => m.id === memberId);
		if (!member) return;

		setCourtAssignments((prev) => {
			const current = prev[assigningPosition] || [];
			const existingIdx = current.findIndex(a => a.memberId === memberId);

			if (existingIdx >= 0) {
				// Remove from position
				const newAssignments = current.filter(a => a.memberId !== memberId);
				// Update priorities
				const reindexed = newAssignments.map((a, idx) => ({ ...a, priority: idx }));

				// Also remove this position from member's positions
				const positionToRemove = COURT_TO_POSITION[assigningPosition];
				if (positionToRemove && member.positions?.includes(positionToRemove)) {
					const newPositions = member.positions.filter(p => p !== positionToRemove);
					updatePositionMutation.mutate({ memberId, positions: newPositions });
				}

				return {
					...prev,
					[assigningPosition]: reindexed,
				};
			} else {
				// Add to position at the end (lowest priority)
				const newPriority = current.length;

				// Add this position to member's positions
				const positionToAdd = COURT_TO_POSITION[assigningPosition];
				if (positionToAdd) {
					const currentPositions = member.positions || [];
					if (!currentPositions.includes(positionToAdd)) {
						updatePositionMutation.mutate({
							memberId,
							positions: [...currentPositions, positionToAdd]
						});
					}
				}

				return {
					...prev,
					[assigningPosition]: [...current, { memberId, priority: newPriority }],
				};
			}
		});
	}, [assigningPosition, team.members, updatePositionMutation]);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const member = active.data.current?.member as TeamMember | undefined;
		if (member) {
			setActiveDragMember(member);
		}
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { over } = event;
		if (over && (over.id as string).startsWith("position-")) {
			setActiveOverPosition((over.id as string).replace("position-", ""));
		} else {
			setActiveOverPosition(null);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveDragMember(null);
		setActiveOverPosition(null);

		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		// Get the dragged member from the data (more reliable than parsing ID)
		const draggedMember = active.data.current?.member as TeamMember | undefined;
		if (!draggedMember) return;
		const draggedMemberId = draggedMember.id;

		// Check if dropping on a court position
		if (overId.startsWith("position-")) {
			const positionId = overId.replace("position-", "");

			// Add player to the court position
			setCourtAssignments((prev) => {
				const current = prev[positionId] || [];
				const existingIdx = current.findIndex(a => a.memberId === draggedMemberId);

				// Already in this position
				if (existingIdx >= 0) return prev;

				// Add at the end (lowest priority)
				const newPriority = current.length;

				// Update member's positions in database
				const positionToAdd = COURT_TO_POSITION[positionId];
				if (positionToAdd) {
					const currentPositions = draggedMember.positions || [];
					if (!currentPositions.includes(positionToAdd)) {
						updatePositionMutation.mutate({
							memberId: draggedMemberId,
							positions: [...currentPositions, positionToAdd]
						});
					}
				}

				return {
					...prev,
					[positionId]: [...current, { memberId: draggedMemberId, priority: newPriority }],
				};
			});
			return;
		}

		// Check if dropping on another player (for reordering in sidebar)
		if (overId.startsWith("player-") && activeId !== overId) {
			// Get target member from over data
			const targetMember = over.data.current?.member as TeamMember | undefined;
			if (!targetMember) return;

			// Get the position and index info from dragged item's data
			const draggedPosition = active.data.current?.position as VolleyballPosition | "Unassigned" | undefined;
			const draggedIndex = active.data.current?.index as number | undefined;
			const targetPosition = over.data.current?.position as VolleyballPosition | "Unassigned" | undefined;
			const targetIndex = over.data.current?.index as number | undefined;

			if (draggedPosition === undefined || draggedIndex === undefined) return;
			if (targetPosition === undefined || targetIndex === undefined) return;

			// Only allow reordering within the same position
			if (draggedPosition === targetPosition) {
				handleReorderInSidebarPosition(draggedPosition, draggedIndex, targetIndex);
			}
		}
	};

	const handleDragCancel = () => {
		setActiveDragMember(null);
		setActiveOverPosition(null);
	};

	// Reorder players within a court position (change priority)
	const handleReorderInPosition = useCallback((positionId: string, oldIndex: number, newIndex: number) => {
		setCourtAssignments((prev) => {
			const current = [...(prev[positionId] || [])];
			if (oldIndex < 0 || oldIndex >= current.length || newIndex < 0 || newIndex >= current.length) {
				return prev;
			}

			// Remove from old position and insert at new
			const [moved] = current.splice(oldIndex, 1);
			current.splice(newIndex, 0, moved);

			// Reindex priorities
			const reindexed = current.map((a, idx) => ({ ...a, priority: idx }));

			return {
				...prev,
				[positionId]: reindexed,
			};
		});
	}, []);

	// Reorder players within a sidebar position section
	const handleReorderInSidebarPosition = useCallback((position: VolleyballPosition | "Unassigned", oldIndex: number, newIndex: number) => {
		// Get current members for this position
		const positionMembers = (team.members || []).filter((member) => {
			if (position === "Unassigned") {
				return !member.positions || member.positions.length === 0;
			}
			return member.positions?.includes(position);
		});

		// Get current priority order or create default from members
		const currentOrder = sidebarPriorities[position] || positionMembers.map(m => m.id);

		// Reorder
		const newOrder = [...currentOrder];
		const [moved] = newOrder.splice(oldIndex, 1);
		newOrder.splice(newIndex, 0, moved);

		setSidebarPriorities(prev => ({
			...prev,
			[position]: newOrder,
		}));

		// TODO: Optionally persist this order to the backend
	}, [team.members, sidebarPriorities]);

	// Remove a player from a court position (used by VolleyballCourt)
	const handleRemoveFromCourtPosition = useCallback((positionId: string, memberId: string) => {
		const member = team.members?.find(m => m.id === memberId);

		setCourtAssignments((prev) => {
			const current = prev[positionId] || [];
			const filtered = current.filter(a => a.memberId !== memberId);
			const reindexed = filtered.map((a, idx) => ({ ...a, priority: idx }));

			return {
				...prev,
				[positionId]: reindexed,
			};
		});

		// Remove this position from member's positions
		if (member) {
			const positionToRemove = COURT_TO_POSITION[positionId];
			if (positionToRemove && member.positions?.includes(positionToRemove)) {
				const newPositions = member.positions.filter(p => p !== positionToRemove);
				updatePositionMutation.mutate({ memberId, positions: newPositions });
			}
		}
	}, [team.members, updatePositionMutation]);

	// Remove a player from a position (used by RosterSidebar)
	const handleRemoveFromSidebarPosition = useCallback((member: TeamMember, position: VolleyballPosition | "Unassigned") => {
		if (position === "Unassigned") return;

		const currentPositions = member.positions || [];
		const newPositions = currentPositions.filter(p => p !== position);

		updatePositionMutation.mutate({
			memberId: member.id,
			positions: newPositions,
		});
	}, [updatePositionMutation]);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={rectIntersection}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<div className="space-y-6">
				{/* Action Header */}
				<div className="flex items-center justify-between lg:justify-end">
					{/* Mobile Title */}
					<h3 className="lg:hidden text-lg font-bold text-white">Team Roster</h3>

					<Button variant="solid" color="accent" onClick={() => setShowAddModal(true)} leftIcon={<UserPlus size={16} />}>
						Add Member
					</Button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
					{/* Volleyball Court Visualization - Hidden on mobile */}
					<div className="hidden lg:block lg:col-span-2 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-white">Starting Lineup</h3>
							<div className="text-xs text-muted">Drag & Drop or Click to assign positions</div>
						</div>
						<VolleyballCourt
							members={team.members || []}
							courtAssignments={courtAssignmentsForCourt}
							assigningPosition={assigningPosition}
							onPositionClick={setAssigningPosition}
							onTogglePlayer={togglePlayerAssignment}
							onRemoveFromPosition={handleRemoveFromCourtPosition}
							onReorderInPosition={handleReorderInPosition}
							sidebarPriorities={sidebarPriorities}
						/>
					</div>

					{/* Full Roster List */}
					<div className="lg:col-span-1">
						<RosterSidebar
							members={team.members || []}
							clubId={team.clubId}
							onReorderInPosition={handleReorderInSidebarPosition}
							positionPriorities={sidebarPriorities}
							onEditMember={setEditingMember}
							onRemoveFromPosition={handleRemoveFromSidebarPosition}
						/>
					</div>
				</div>

				{/* Add Member Modal */}
				<AddTeamMemberModal
					isOpen={showAddModal}
					clubMembers={clubMembers}
					currentMemberIds={team.members?.map((m) => m.clubMemberId) || []}
					onClose={() => setShowAddModal(false)}
					onAdd={(data) => addMemberMutation.mutate(data)}
					isLoading={addMemberMutation.isPending}
				/>

				{/* Edit Member Modal */}
				<EditTeamMemberModal
					isOpen={!!editingMember}
					member={editingMember}
					onClose={() => setEditingMember(null)}
					onSave={(data) => editMemberMutation.mutate(data)}
					isLoading={editMemberMutation.isPending}
				/>
			</div>

			{/* Drag Overlay - Shows dragged player */}
			<DragOverlay dropAnimation={null}>
				{activeDragMember && <PlayerDragOverlay member={activeDragMember} />}
			</DragOverlay>
		</DndContext>
	);
}
