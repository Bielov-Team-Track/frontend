"use client";

import { Avatar } from "@/components";
import { TeamMember, VolleyballPosition } from "@/lib/models/Club";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpDown, ChevronDown, ChevronUp, GripVertical, Pencil, Star, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { VOLLEYBALL_POSITIONS_OPTIONS } from "../constants";

interface RosterSidebarProps {
	members: TeamMember[];
	clubId: string;
	isDragEnabled?: boolean;
	onReorderInPosition?: (position: VolleyballPosition | "Unassigned", oldIndex: number, newIndex: number) => void;
	positionPriorities?: Record<string, string[]>; // position -> ordered member IDs
	onEditMember?: (member: TeamMember) => void;
	onRemoveFromPosition?: (member: TeamMember, position: VolleyballPosition | "Unassigned") => void;
}

// Position display order - exported for use in RosterTab
export const POSITION_ORDER: (VolleyballPosition | "Unassigned")[] = [
	VolleyballPosition.Setter,
	VolleyballPosition.OutsideHitter,
	VolleyballPosition.OppositeHitter,
	VolleyballPosition.MiddleBlocker,
	VolleyballPosition.Libero,
	"Unassigned",
];

function getPositionLabel(position: VolleyballPosition | "Unassigned"): string {
	if (position === "Unassigned") return "Unassigned";
	return VOLLEYBALL_POSITIONS_OPTIONS.find((p) => p.value === position)?.label || position;
}

// Helper to group members by position - exported for use in RosterTab
export function groupMembersByPosition(members: TeamMember[], positionPriorities?: Record<string, string[]>): Record<string, TeamMember[]> {
	return POSITION_ORDER.reduce((acc, position) => {
		let positionMembers = members.filter((member) => {
			if (position === "Unassigned") {
				return !member.positions || member.positions.length === 0;
			}
			return member.positions?.includes(position);
		});

		// Sort by priority if available
		if (positionPriorities && positionPriorities[position]) {
			const priorityOrder = positionPriorities[position];
			positionMembers = [...positionMembers].sort((a, b) => {
				const aIdx = priorityOrder.indexOf(a.id);
				const bIdx = priorityOrder.indexOf(b.id);
				if (aIdx === -1 && bIdx === -1) return 0;
				if (aIdx === -1) return 1;
				if (bIdx === -1) return -1;
				return aIdx - bIdx;
			});
		}

		if (positionMembers.length > 0) {
			acc[position] = positionMembers;
		}
		return acc;
	}, {} as Record<string, TeamMember[]>);
}

export default function RosterSidebar({
	members,
	clubId,
	isDragEnabled = true,
	onReorderInPosition,
	positionPriorities,
	onEditMember,
	onRemoveFromPosition,
}: RosterSidebarProps) {
	const [showArrowControls, setShowArrowControls] = useState(false);

	// Group members by their position
	const groupedMembers = groupMembersByPosition(members, positionPriorities);

	const hasMembers = members.length > 0;

	const handleMoveUp = (position: VolleyballPosition | "Unassigned", memberIndex: number) => {
		if (memberIndex > 0) {
			onReorderInPosition?.(position, memberIndex, memberIndex - 1);
		}
	};

	const handleMoveDown = (position: VolleyballPosition | "Unassigned", memberIndex: number, totalMembers: number) => {
		if (memberIndex < totalMembers - 1) {
			onReorderInPosition?.(position, memberIndex, memberIndex + 1);
		}
	};

	return (
		<div className="rounded-2xl bg-white/5 border border-white/10 flex flex-col h-[600px] overflow-hidden">
			<div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-xs">
				<div className="flex items-center justify-between">
					<h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
						<span>Team Roster</span>
						<span className="text-xs bg-white/10 px-2 py-1 rounded-full text-muted font-normal">{members.length}</span>
					</h4>

					{/* Arrow Controls Toggle */}
					{onReorderInPosition && (
						<button
							onClick={() => setShowArrowControls(!showArrowControls)}
							className={`p-1.5 rounded-lg transition-colors ${
								showArrowControls ? "bg-accent text-white" : "bg-white/10 text-muted hover:bg-white/20 hover:text-white"
							}`}
							title={showArrowControls ? "Hide reorder controls" : "Show reorder controls"}>
							<ArrowUpDown size={14} />
						</button>
					)}
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4 custom-scrollbar isolate">
				{hasMembers ? (
					<div className="space-y-6">
						{POSITION_ORDER.map((position) => {
							const positionMembers = groupedMembers[position];
							if (!positionMembers || positionMembers.length === 0) return null;

							return (
								<div key={position}>
									{/* Position Header */}
									<div className="flex items-center gap-2 mb-3 sticky top-0 py-1 z-1000 backdrop-blur-xs bg-white/5">
										<div className="text-xs font-bold text-muted uppercase tracking-wider">{getPositionLabel(position)}</div>
										<div className="flex-1 h-px bg-white/10" />
										<span className="text-[10px] font-medium text-muted bg-white/5 px-1.5 py-0.5 rounded">{positionMembers.length}</span>
									</div>

									{/* Members in this position */}
									<div className="space-y-2">
										{positionMembers.map((member, index) => (
											<DraggableMemberRow
												key={member.id}
												member={member}
												clubId={clubId}
												isDragEnabled={isDragEnabled}
												showArrowControls={showArrowControls}
												canReorder={!!onReorderInPosition}
												isFirst={index === 0}
												isLast={index === positionMembers.length - 1}
												index={index}
												position={position}
												onMoveUp={() => handleMoveUp(position, index)}
												onMoveDown={() => handleMoveDown(position, index, positionMembers.length)}
												onEdit={onEditMember}
												onRemoveFromPosition={onRemoveFromPosition}
											/>
										))}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-muted text-sm gap-2">
						<div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
							<UsersIcon className="opacity-20" size={24} />
						</div>
						<p>No players in roster</p>
					</div>
				)}
			</div>
		</div>
	);
}

function UsersIcon({ className, size }: { className?: string; size?: number }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
			<circle cx="9" cy="7" r="4"></circle>
			<path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
			<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
		</svg>
	);
}

interface DraggableMemberRowProps {
	member: TeamMember;
	clubId: string;
	isDragEnabled: boolean;
	showArrowControls: boolean;
	canReorder: boolean;
	isFirst: boolean;
	isLast: boolean;
	index: number;
	position: VolleyballPosition | "Unassigned";
	onMoveUp: () => void;
	onMoveDown: () => void;
	onEdit?: (member: TeamMember) => void;
	onRemoveFromPosition?: (member: TeamMember, position: VolleyballPosition | "Unassigned") => void;
}

function DraggableMemberRow({
	member,
	clubId,
	isDragEnabled,
	showArrowControls,
	canReorder,
	isFirst,
	isLast,
	index,
	position,
	onMoveUp,
	onMoveDown,
	onEdit,
	onRemoveFromPosition,
}: DraggableMemberRowProps) {
	// Create unique ID for this card (member + position combination)
	// This prevents all cards for the same member from dragging together
	const uniqueId = `player-${member.id}-${position}`;

	// Single draggable that connects to parent DndContext
	// The ID includes position info so parent can handle both sorting and court assignment
	const {
		attributes,
		listeners,
		setNodeRef: setDragNodeRef,
		transform,
		isDragging,
	} = useDraggable({
		id: uniqueId,
		data: {
			type: "player",
			member,
			position, // Include position for sorting logic
			index, // Include index for sorting logic
		},
		disabled: !isDragEnabled || showArrowControls,
	});

	// Also make this row a drop target for reordering
	const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
		id: uniqueId,
		data: {
			type: "player",
			member,
			position,
			index,
		},
	});

	// Combine refs
	const setNodeRef = (node: HTMLElement | null) => {
		setDragNodeRef(node);
		setDropNodeRef(node);
	};

	const style = transform
		? {
				transform: CSS.Translate.toString(transform),
				zIndex: 1000,
		  }
		: undefined;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-1.5 rounded-xl transition-all ${
				isDragging ? "opacity-50 bg-accent/20 ring-2 ring-accent z-50" : isOver && !isDragging ? "ring-2 ring-accent/50 bg-accent/10" : ""
			}`}>
			{/* Drag Handle */}
			{isDragEnabled && !showArrowControls && (
				<div
					{...listeners}
					{...attributes}
					className="hidden lg:flex cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors items-center justify-center"
					title="Drag to reorder or to court position">
					<GripVertical size={16} />
				</div>
			)}

			{/* Arrow Controls for reordering */}
			{showArrowControls && canReorder && (
				<div className="flex flex-col gap-0.5 bg-white/5 rounded-lg p-0.5">
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onMoveUp();
						}}
						disabled={isFirst}
						className={`p-1 rounded transition-colors ${
							isFirst ? "text-muted/30 cursor-not-allowed" : "text-muted hover:text-white hover:bg-white/10"
						}`}>
						<ChevronUp size={14} />
					</button>
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onMoveDown();
						}}
						disabled={isLast}
						className={`p-1 rounded transition-colors ${
							isLast ? "text-muted/30 cursor-not-allowed" : "text-muted hover:text-white hover:bg-white/10"
						}`}>
						<ChevronDown size={14} />
					</button>
				</div>
			)}

			<div className="flex-1 flex items-center gap-3 p-2.5 rounded-xl transition-all group relative overflow-hidden">
				{/* Priority number badge */}
				{position !== "Unassigned" && (
					<div
						className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 z-10 ${
							index === 0 ? "bg-yellow-500 text-black" : "bg-white/10 text-muted"
						}`}>
						{index + 1}
					</div>
				)}

				{/* Avatar - clickable link to member page */}
				<Link
					href={`/dashboard/clubs/${clubId}/members/${member.userId}`}
					className="relative z-10 shrink-0"
					onClick={(e) => isDragging && e.preventDefault()}>
					<div className="relative">
						<div className="rounded-lg overflow-hidden ring-1 ring-white/10 hover:ring-accent/50 transition-all">
							{member.userProfile && <Avatar profile={member.userProfile} size="small" />}
						</div>
						{member.jerseyNumber && (
							<div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-background-dark text-[10px] font-bold flex items-center justify-center border-2 border-background-dark shadow-xs">
								{member.jerseyNumber}
							</div>
						)}
					</div>
				</Link>

				{/* Name - clickable link to member page */}
				<Link
					href={`/dashboard/clubs/${clubId}/members/${member.userId}`}
					className="flex-1 min-w-0 z-10"
					onClick={(e) => isDragging && e.preventDefault()}>
					<div className="text-sm font-medium text-white hover:text-accent transition-colors truncate flex items-center gap-1.5">
						{member.userProfile?.name} {member.userProfile?.surname}
						{/* Star icon next to name for starter */}
						{index === 0 && position !== "Unassigned" && <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />}
					</div>
					<div className="text-xs text-muted/70 truncate flex items-center gap-1">
						{index === 0 && position !== "Unassigned" && <span className="text-yellow-500/80">Starter</span>}
						{index > 0 && position !== "Unassigned" && <span>Backup</span>}
					</div>
				</Link>

				{/* Edit button - visible on hover and always on mobile */}
				{onEdit && (
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onEdit(member);
						}}
						className="p-1.5 rounded-lg bg-white/0 hover:bg-white/10 text-muted hover:text-accent transition-colors z-10 opacity-100 lg:opacity-0 group-hover:opacity-100"
						title="Edit player">
						<Pencil size={14} />
					</button>
				)}

				{/* Remove from position button - visible on hover and always on mobile, only for assigned positions */}
				{onRemoveFromPosition && position !== "Unassigned" && (
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onRemoveFromPosition(member, position);
						}}
						className="p-1.5 rounded-lg bg-white/0 hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors z-10 opacity-100 lg:opacity-0 group-hover:opacity-100"
						title="Remove from position">
						<X size={14} />
					</button>
				)}
			</div>
		</div>
	);
}

// Export for drag overlay
export function PlayerDragOverlay({ member }: { member: TeamMember }) {
	return (
		<div className="flex items-center gap-3 p-3 rounded-xl bg-background-dark border-2 border-accent shadow-2xl min-w-[200px]">
			<div className="relative">
				<div className="rounded-lg overflow-hidden ring-2 ring-accent">
					{member.userProfile && <Avatar profile={member.userProfile} size="small" />}
				</div>
				{member.jerseyNumber && (
					<div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-background-dark text-[10px] font-bold flex items-center justify-center border-2 border-background-dark shadow-xs">
						{member.jerseyNumber}
					</div>
				)}
			</div>
			<div className="flex-1 min-w-0">
				<div className="text-sm font-medium text-white truncate">
					{member.userProfile?.name} {member.userProfile?.surname}
				</div>
			</div>
		</div>
	);
}
