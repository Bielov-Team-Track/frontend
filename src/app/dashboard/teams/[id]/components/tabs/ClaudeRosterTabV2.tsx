"use client";

import { ClaudeRosterSidebarV2, ClaudeVolleyballCourtV2, ClaudePlayerDragOverlay } from "@/components/features/teams/claude";
import { AddTeamMemberModal, EditTeamMemberModal } from "@/components/features/teams";
import { POSITION_ORDER } from "@/components/features/teams/components/RosterSidebar";
import Button from "@/components/ui/button";
import { ClubMember, Team, TeamMember, VolleyballPosition, PositionAssignment } from "@/lib/models/Club";
import { addTeamMember, updateTeamMember } from "@/lib/api/clubs";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverEvent, rectIntersection } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Users, Zap, Trophy } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

interface ClaudeRosterTabV2Props {
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

export default function ClaudeRosterTabV2({ team, clubMembers, teamId }: ClaudeRosterTabV2Props) {
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
	const [assigningPosition, setAssigningPosition] = useState<string | null>(null);
	const [courtAssignments, setCourtAssignments] = useState<Record<string, PositionAssignment[]>>({});
	const [sidebarPriorities, setSidebarPriorities] = useState<Record<string, string[]>>({});
	const [activeDragMember, setActiveDragMember] = useState<TeamMember | null>(null);
	const [activeOverPosition, setActiveOverPosition] = useState<string | null>(null);
	const [activeView, setActiveView] = useState<"court" | "roster">("court");

	const queryClient = useQueryClient();

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

	const updatePositionMutation = useMutation({
		mutationFn: async ({ memberId, positions }: { memberId: string; positions: VolleyballPosition[] }) => {
			return updateTeamMember(teamId, memberId, { positions });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", teamId] });
		},
	});

	const editMemberMutation = useMutation({
		mutationFn: async ({ memberId, positions, jerseyNumber }: { memberId: string; positions: VolleyballPosition[]; jerseyNumber?: string }) => {
			return updateTeamMember(teamId, memberId, { positions, jerseyNumber });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", teamId] });
			setEditingMember(null);
		},
	});

	const getAssignmentMemberIds = useCallback((positionId: string): string[] => {
		return (courtAssignments[positionId] || [])
			.sort((a, b) => a.priority - b.priority)
			.map(a => a.memberId);
	}, [courtAssignments]);

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
				const newAssignments = current.filter(a => a.memberId !== memberId);
				const reindexed = newAssignments.map((a, idx) => ({ ...a, priority: idx }));

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
				const newPriority = current.length;

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

		const overId = over.id as string;
		const draggedMember = active.data.current?.member as TeamMember | undefined;
		if (!draggedMember) return;
		const draggedMemberId = draggedMember.id;

		if (overId.startsWith("position-")) {
			const positionId = overId.replace("position-", "");

			setCourtAssignments((prev) => {
				const current = prev[positionId] || [];
				const existingIdx = current.findIndex(a => a.memberId === draggedMemberId);

				if (existingIdx >= 0) return prev;

				const newPriority = current.length;

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

		if (overId.startsWith("player-")) {
			const targetMember = over.data.current?.member as TeamMember | undefined;
			if (!targetMember) return;

			const draggedPosition = active.data.current?.position as VolleyballPosition | "Unassigned" | undefined;
			const draggedIndex = active.data.current?.index as number | undefined;
			const targetPosition = over.data.current?.position as VolleyballPosition | "Unassigned" | undefined;
			const targetIndex = over.data.current?.index as number | undefined;

			if (draggedPosition === undefined || draggedIndex === undefined) return;
			if (targetPosition === undefined || targetIndex === undefined) return;

			if (draggedPosition === targetPosition) {
				handleReorderInSidebarPosition(draggedPosition, draggedIndex, targetIndex);
			}
		}
	};

	const handleDragCancel = () => {
		setActiveDragMember(null);
		setActiveOverPosition(null);
	};

	const handleReorderInPosition = useCallback((positionId: string, oldIndex: number, newIndex: number) => {
		setCourtAssignments((prev) => {
			const current = [...(prev[positionId] || [])];
			if (oldIndex < 0 || oldIndex >= current.length || newIndex < 0 || newIndex >= current.length) {
				return prev;
			}

			const [moved] = current.splice(oldIndex, 1);
			current.splice(newIndex, 0, moved);

			const reindexed = current.map((a, idx) => ({ ...a, priority: idx }));

			return {
				...prev,
				[positionId]: reindexed,
			};
		});
	}, []);

	const handleReorderInSidebarPosition = useCallback((position: VolleyballPosition | "Unassigned", oldIndex: number, newIndex: number) => {
		const positionMembers = (team.members || []).filter((member) => {
			if (position === "Unassigned") {
				return !member.positions || member.positions.length === 0;
			}
			return member.positions?.includes(position);
		});

		const currentOrder = sidebarPriorities[position] || positionMembers.map(m => m.id);

		const newOrder = [...currentOrder];
		const [moved] = newOrder.splice(oldIndex, 1);
		newOrder.splice(newIndex, 0, moved);

		setSidebarPriorities(prev => ({
			...prev,
			[position]: newOrder,
		}));
	}, [team.members, sidebarPriorities]);

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

		if (member) {
			const positionToRemove = COURT_TO_POSITION[positionId];
			if (positionToRemove && member.positions?.includes(positionToRemove)) {
				const newPositions = member.positions.filter(p => p !== positionToRemove);
				updatePositionMutation.mutate({ memberId, positions: newPositions });
			}
		}
	}, [team.members, updatePositionMutation]);

	const handleRemoveFromSidebarPosition = useCallback((member: TeamMember, position: VolleyballPosition | "Unassigned") => {
		if (position === "Unassigned") return;

		const currentPositions = member.positions || [];
		const newPositions = currentPositions.filter(p => p !== position);

		updatePositionMutation.mutate({
			memberId: member.id,
			positions: newPositions,
		});
	}, [updatePositionMutation]);

	// Calculate stats
	const totalMembers = team.members?.length || 0;
	const assignedMembers = team.members?.filter(m => m.positions && m.positions.length > 0).length || 0;
	const startersCount = Object.keys(courtAssignmentsForCourt).filter(k => courtAssignmentsForCourt[k]?.length > 0).length;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={rectIntersection}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			{/* Custom CSS for the broadcast aesthetic */}
			<style jsx global>{`
				@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap');

				.claude-roster-v2 {
					--broadcast-red: #e63946;
					--broadcast-gold: #ffd60a;
					--broadcast-dark: #0d1117;
					--broadcast-darker: #010409;
					--broadcast-gray: #161b22;
					--broadcast-border: #30363d;
					--broadcast-accent: hsl(29 100% 50%);
				}

				.claude-roster-v2 .font-display {
					font-family: 'Oswald', sans-serif;
				}

				.claude-roster-v2 .font-body {
					font-family: 'Barlow', sans-serif;
				}

				.claude-roster-v2 .font-condensed {
					font-family: 'Barlow Condensed', sans-serif;
				}

				.claude-roster-v2 .broadcast-gradient {
					background: linear-gradient(135deg, var(--broadcast-dark) 0%, var(--broadcast-darker) 100%);
				}

				.claude-roster-v2 .accent-stripe {
					background: linear-gradient(90deg, var(--broadcast-accent), transparent);
				}

				.claude-roster-v2 .stat-card {
					background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
					border: 1px solid rgba(255,255,255,0.08);
					position: relative;
					overflow: hidden;
				}

				.claude-roster-v2 .stat-card::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					height: 3px;
					background: var(--broadcast-accent);
				}

				.claude-roster-v2 .view-toggle-active {
					background: linear-gradient(135deg, var(--broadcast-accent), hsl(29 100% 40%));
					box-shadow: 0 4px 20px rgba(255, 149, 0, 0.3);
				}

				.claude-roster-v2 .diagonal-lines {
					background-image: repeating-linear-gradient(
						-45deg,
						transparent,
						transparent 2px,
						rgba(255,255,255,0.02) 2px,
						rgba(255,255,255,0.02) 4px
					);
				}

				@keyframes slideInFromLeft {
					from {
						opacity: 0;
						transform: translateX(-20px);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}

				@keyframes pulseGlow {
					0%, 100% {
						box-shadow: 0 0 20px rgba(255, 149, 0, 0.2);
					}
					50% {
						box-shadow: 0 0 30px rgba(255, 149, 0, 0.4);
					}
				}

				.claude-roster-v2 .animate-slide-in {
					animation: slideInFromLeft 0.4s ease-out forwards;
				}

				.claude-roster-v2 .animate-pulse-glow {
					animation: pulseGlow 2s ease-in-out infinite;
				}
			`}</style>

			<div className="claude-roster-v2 space-y-6">
				{/* Broadcast-style Header Bar */}
				<div className="broadcast-gradient rounded-2xl border border-white/10 overflow-hidden">
					{/* Top accent stripe */}
					<div className="h-1 accent-stripe" />

					<div className="p-4 lg:p-6">
						<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
							{/* Title Section */}
							<div className="flex items-center gap-4">
								<div className="relative">
									<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shadow-lg animate-pulse-glow">
										<Users className="w-7 h-7 text-white" />
									</div>
									<div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-[var(--broadcast-dark)] flex items-center justify-center">
										<span className="text-[8px] font-bold text-white">{totalMembers}</span>
									</div>
								</div>
								<div>
									<h2 className="font-display text-2xl lg:text-3xl font-bold text-white uppercase tracking-wider">
										Team Roster
									</h2>
									<p className="font-condensed text-sm text-muted tracking-wide">
										Manage players, positions & starting lineup
									</p>
								</div>
							</div>

							{/* Stats Row */}
							<div className="flex items-center gap-3">
								<div className="stat-card px-4 py-3 rounded-xl">
									<div className="flex items-center gap-2">
										<Users size={16} className="text-accent" />
										<span className="font-condensed text-xs text-muted uppercase tracking-wider">Players</span>
									</div>
									<div className="font-display text-2xl font-bold text-white">{totalMembers}</div>
								</div>

								<div className="stat-card px-4 py-3 rounded-xl">
									<div className="flex items-center gap-2">
										<Zap size={16} className="text-yellow-400" />
										<span className="font-condensed text-xs text-muted uppercase tracking-wider">Assigned</span>
									</div>
									<div className="font-display text-2xl font-bold text-white">{assignedMembers}</div>
								</div>

								<div className="stat-card px-4 py-3 rounded-xl hidden sm:block">
									<div className="flex items-center gap-2">
										<Trophy size={16} className="text-green-400" />
										<span className="font-condensed text-xs text-muted uppercase tracking-wider">Starters</span>
									</div>
									<div className="font-display text-2xl font-bold text-white">{startersCount}/6</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-3">
								{/* Mobile View Toggle */}
								<div className="lg:hidden flex bg-white/5 rounded-xl p-1 border border-white/10">
									<button
										onClick={() => setActiveView("court")}
										className={`px-4 py-2 rounded-lg font-condensed text-sm font-semibold uppercase tracking-wider transition-all ${
											activeView === "court"
												? "view-toggle-active text-white"
												: "text-muted hover:text-white"
										}`}
									>
										Court
									</button>
									<button
										onClick={() => setActiveView("roster")}
										className={`px-4 py-2 rounded-lg font-condensed text-sm font-semibold uppercase tracking-wider transition-all ${
											activeView === "roster"
												? "view-toggle-active text-white"
												: "text-muted hover:text-white"
										}`}
									>
										Roster
									</button>
								</div>

								<Button
									variant="solid"
									color="accent"
									onClick={() => setShowAddModal(true)}
									leftIcon={<UserPlus size={18} />}
									className="font-body font-semibold"
								>
									<span className="hidden sm:inline">Add Player</span>
									<span className="sm:hidden">Add</span>
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Court Visualization */}
					<div className={`lg:col-span-8 ${activeView === "roster" ? "hidden lg:block" : ""}`}>
						<div className="broadcast-gradient rounded-2xl border border-white/10 overflow-hidden">
							<div className="px-5 py-4 border-b border-white/10 flex items-center justify-between diagonal-lines">
								<div className="flex items-center gap-3">
									<div className="w-1 h-8 bg-accent rounded-full" />
									<div>
										<h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">
											Starting Lineup
										</h3>
										<p className="font-condensed text-xs text-muted">
											Drag players to assign positions
										</p>
									</div>
								</div>
								<div className="font-condensed text-xs text-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
									{startersCount}/6 Positions Filled
								</div>
							</div>

							<div className="p-4 lg:p-6">
								<ClaudeVolleyballCourtV2
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
						</div>
					</div>

					{/* Roster Sidebar */}
					<div className={`lg:col-span-4 ${activeView === "court" ? "hidden lg:block" : ""}`}>
						<ClaudeRosterSidebarV2
							members={team.members || []}
							clubId={team.clubId}
							onReorderInPosition={handleReorderInSidebarPosition}
							positionPriorities={sidebarPriorities}
							onEditMember={setEditingMember}
							onRemoveFromPosition={handleRemoveFromSidebarPosition}
						/>
					</div>
				</div>

				{/* Modals */}
				<AddTeamMemberModal
					isOpen={showAddModal}
					clubMembers={clubMembers}
					currentMemberIds={team.members?.map((m) => m.clubMemberId) || []}
					onClose={() => setShowAddModal(false)}
					onAdd={(data) => addMemberMutation.mutate(data)}
					isLoading={addMemberMutation.isPending}
				/>

				<EditTeamMemberModal
					isOpen={!!editingMember}
					member={editingMember}
					onClose={() => setEditingMember(null)}
					onSave={(data) => editMemberMutation.mutate(data)}
					isLoading={editMemberMutation.isPending}
				/>
			</div>

			{/* Drag Overlay */}
			<DragOverlay dropAnimation={null}>
				{activeDragMember && <ClaudePlayerDragOverlay member={activeDragMember} />}
			</DragOverlay>
		</DndContext>
	);
}
