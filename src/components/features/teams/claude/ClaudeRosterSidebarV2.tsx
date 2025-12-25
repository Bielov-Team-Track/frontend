"use client";

import { Avatar } from "@/components";
import { TeamMember, VolleyballPosition } from "@/lib/models/Club";
import { GripVertical, ChevronUp, ChevronDown, ArrowUpDown, Crown, Pencil, X, User, Shield, Target, Crosshair, CircleDot } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { VOLLEYBALL_POSITIONS_OPTIONS } from "../constants";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface ClaudeRosterSidebarV2Props {
	members: TeamMember[];
	clubId: string;
	isDragEnabled?: boolean;
	onReorderInPosition?: (position: VolleyballPosition | "Unassigned", oldIndex: number, newIndex: number) => void;
	positionPriorities?: Record<string, string[]>;
	onEditMember?: (member: TeamMember) => void;
	onRemoveFromPosition?: (member: TeamMember, position: VolleyballPosition | "Unassigned") => void;
}

// Position display order
export const CLAUDE_POSITION_ORDER: (VolleyballPosition | "Unassigned")[] = [
	VolleyballPosition.Setter,
	VolleyballPosition.OutsideHitter,
	VolleyballPosition.OppositeHitter,
	VolleyballPosition.MiddleBlocker,
	VolleyballPosition.Libero,
	"Unassigned",
];

// Position icons mapping
const POSITION_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
	[VolleyballPosition.Setter]: Target,
	[VolleyballPosition.OutsideHitter]: Crosshair,
	[VolleyballPosition.OppositeHitter]: Shield,
	[VolleyballPosition.MiddleBlocker]: Shield,
	[VolleyballPosition.Libero]: CircleDot,
	"Unassigned": User,
};

// Position colors for the broadcast look
const POSITION_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
	[VolleyballPosition.Setter]: {
		bg: "from-yellow-500/20 to-yellow-600/10",
		border: "border-yellow-500/30",
		text: "text-yellow-400",
		glow: "shadow-yellow-500/20",
	},
	[VolleyballPosition.OutsideHitter]: {
		bg: "from-blue-500/20 to-blue-600/10",
		border: "border-blue-500/30",
		text: "text-blue-400",
		glow: "shadow-blue-500/20",
	},
	[VolleyballPosition.OppositeHitter]: {
		bg: "from-red-500/20 to-red-600/10",
		border: "border-red-500/30",
		text: "text-red-400",
		glow: "shadow-red-500/20",
	},
	[VolleyballPosition.MiddleBlocker]: {
		bg: "from-purple-500/20 to-purple-600/10",
		border: "border-purple-500/30",
		text: "text-purple-400",
		glow: "shadow-purple-500/20",
	},
	[VolleyballPosition.Libero]: {
		bg: "from-green-500/20 to-green-600/10",
		border: "border-green-500/30",
		text: "text-green-400",
		glow: "shadow-green-500/20",
	},
	"Unassigned": {
		bg: "from-gray-500/20 to-gray-600/10",
		border: "border-gray-500/30",
		text: "text-gray-400",
		glow: "shadow-gray-500/20",
	},
};

function getPositionLabel(position: VolleyballPosition | "Unassigned"): string {
	if (position === "Unassigned") return "Unassigned";
	return VOLLEYBALL_POSITIONS_OPTIONS.find((p) => p.value === position)?.label || position;
}

function getPositionAbbreviation(position: VolleyballPosition | "Unassigned"): string {
	const abbrevMap: Record<string, string> = {
		[VolleyballPosition.Setter]: "SET",
		[VolleyballPosition.OutsideHitter]: "OH",
		[VolleyballPosition.OppositeHitter]: "OPP",
		[VolleyballPosition.MiddleBlocker]: "MB",
		[VolleyballPosition.Libero]: "LIB",
		"Unassigned": "N/A",
	};
	return abbrevMap[position] || "N/A";
}

function groupMembersByPosition(
	members: TeamMember[],
	positionPriorities?: Record<string, string[]>
): Record<string, TeamMember[]> {
	return CLAUDE_POSITION_ORDER.reduce((acc, position) => {
		let positionMembers = members.filter((member) => {
			if (position === "Unassigned") {
				return !member.positions || member.positions.length === 0;
			}
			return member.positions?.includes(position);
		});

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

export default function ClaudeRosterSidebarV2({
	members,
	clubId,
	isDragEnabled = true,
	onReorderInPosition,
	positionPriorities,
	onEditMember,
	onRemoveFromPosition,
}: ClaudeRosterSidebarV2Props) {
	const [showArrowControls, setShowArrowControls] = useState(false);
	const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set(CLAUDE_POSITION_ORDER));

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

	const togglePosition = (position: string) => {
		setExpandedPositions(prev => {
			const next = new Set(prev);
			if (next.has(position)) {
				next.delete(position);
			} else {
				next.add(position);
			}
			return next;
		});
	};

	return (
		<div className="broadcast-gradient rounded-2xl border border-white/10 flex flex-col h-[700px] overflow-hidden">
			{/* Header */}
			<div className="px-5 py-4 border-b border-white/10 diagonal-lines">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-1 h-8 bg-accent rounded-full" />
						<div>
							<h4 className="font-display text-lg font-bold text-white uppercase tracking-wider">
								Full Roster
							</h4>
							<p className="font-condensed text-xs text-muted">
								{members.length} Players registered
							</p>
						</div>
					</div>

					{onReorderInPosition && (
						<button
							onClick={() => setShowArrowControls(!showArrowControls)}
							className={`p-2 rounded-xl transition-all font-condensed text-xs uppercase tracking-wider flex items-center gap-2 ${
								showArrowControls
									? "bg-accent text-white shadow-lg shadow-accent/30"
									: "bg-white/5 text-muted hover:bg-white/10 hover:text-white border border-white/10"
							}`}
							title={showArrowControls ? "Hide reorder controls" : "Show reorder controls"}
						>
							<ArrowUpDown size={14} />
							<span className="hidden sm:inline">Reorder</span>
						</button>
					)}
				</div>
			</div>

			{/* Roster Content */}
			<div className="flex-1 overflow-y-auto custom-scrollbar">
				{hasMembers ? (
					<div className="p-4 space-y-3">
						{CLAUDE_POSITION_ORDER.map((position, posIdx) => {
							const positionMembers = groupedMembers[position];
							if (!positionMembers || positionMembers.length === 0) return null;

							const colors = POSITION_COLORS[position];
							const Icon = POSITION_ICONS[position];
							const isExpanded = expandedPositions.has(position);

							return (
								<div
									key={position}
									className="animate-slide-in"
									style={{ animationDelay: `${posIdx * 0.05}s` }}
								>
									{/* Position Header */}
									<button
										onClick={() => togglePosition(position)}
										className={`w-full flex items-center gap-3 p-3 rounded-xl bg-linear-to-r ${colors.bg} border ${colors.border} transition-all hover:scale-[1.01] group`}
									>
										<div className={`w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center ${colors.text}`}>
											<Icon size={20} />
										</div>
										<div className="flex-1 text-left">
											<div className="font-display text-sm font-bold text-white uppercase tracking-wider">
												{getPositionLabel(position)}
											</div>
											<div className="font-condensed text-xs text-muted">
												{positionMembers.length} {positionMembers.length === 1 ? "player" : "players"}
											</div>
										</div>
										<div className={`font-display text-lg font-bold ${colors.text} bg-black/20 px-3 py-1 rounded-lg`}>
											{getPositionAbbreviation(position)}
										</div>
										<ChevronDown
											size={18}
											className={`text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
										/>
									</button>

									{/* Members List */}
									{isExpanded && (
										<div className="mt-2 space-y-2 pl-2">
											{positionMembers.map((member, index) => (
												<ClaudeDraggableMemberRow
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
													positionColors={colors}
													onMoveUp={() => handleMoveUp(position, index)}
													onMoveDown={() => handleMoveDown(position, index, positionMembers.length)}
													onEdit={onEditMember}
													onRemoveFromPosition={onRemoveFromPosition}
												/>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-muted p-8">
						<div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
							<User className="opacity-30" size={40} />
						</div>
						<p className="font-display text-lg text-white/50 uppercase tracking-wider">No Players</p>
						<p className="font-condensed text-sm text-muted mt-1">Add players to build your roster</p>
					</div>
				)}
			</div>
		</div>
	);
}

interface ClaudeDraggableMemberRowProps {
	member: TeamMember;
	clubId: string;
	isDragEnabled: boolean;
	showArrowControls: boolean;
	canReorder: boolean;
	isFirst: boolean;
	isLast: boolean;
	index: number;
	position: VolleyballPosition | "Unassigned";
	positionColors: { bg: string; border: string; text: string; glow: string };
	onMoveUp: () => void;
	onMoveDown: () => void;
	onEdit?: (member: TeamMember) => void;
	onRemoveFromPosition?: (member: TeamMember, position: VolleyballPosition | "Unassigned") => void;
}

function ClaudeDraggableMemberRow({
	member,
	clubId,
	isDragEnabled,
	showArrowControls,
	canReorder,
	isFirst,
	isLast,
	index,
	position,
	positionColors,
	onMoveUp,
	onMoveDown,
	onEdit,
	onRemoveFromPosition,
}: ClaudeDraggableMemberRowProps) {
	const uniqueId = `player-${member.id}-${position}`;

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
			position,
			index,
		},
		disabled: !isDragEnabled || showArrowControls,
	});

	const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
		id: uniqueId,
		data: {
			type: "player",
			member,
			position,
			index,
		},
	});

	const setNodeRef = (node: HTMLElement | null) => {
		setDragNodeRef(node);
		setDropNodeRef(node);
	};

	const style = transform ? {
		transform: CSS.Translate.toString(transform),
		zIndex: 1000,
	} : undefined;

	const isStarter = index === 0 && position !== "Unassigned";

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-2 transition-all ${
				isDragging
					? "opacity-50 scale-105"
					: isOver && !isDragging
					? "scale-[1.02]"
					: ""
			}`}
		>
			{/* Drag Handle */}
			{isDragEnabled && !showArrowControls && (
				<div
					{...listeners}
					{...attributes}
					className="hidden lg:flex cursor-grab active:cursor-grabbing p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors items-center justify-center border border-white/5"
					title="Drag to reorder or assign to court"
				>
					<GripVertical size={14} />
				</div>
			)}

			{/* Arrow Controls */}
			{showArrowControls && canReorder && (
				<div className="flex flex-col gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/10">
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onMoveUp();
						}}
						disabled={isFirst}
						className={`p-1 rounded transition-colors ${
							isFirst
								? "text-muted/30 cursor-not-allowed"
								: "text-muted hover:text-white hover:bg-white/10"
						}`}
					>
						<ChevronUp size={12} />
					</button>
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onMoveDown();
						}}
						disabled={isLast}
						className={`p-1 rounded transition-colors ${
							isLast
								? "text-muted/30 cursor-not-allowed"
								: "text-muted hover:text-white hover:bg-white/10"
						}`}
					>
						<ChevronDown size={12} />
					</button>
				</div>
			)}

			{/* Player Card */}
			<div className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-all group relative overflow-hidden ${
				isDragging
					? "bg-accent/20 ring-2 ring-accent"
					: isOver
					? "bg-accent/10 ring-1 ring-accent/50"
					: "bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10"
			}`}>
				{/* Starter indicator line */}
				{isStarter && (
					<div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-yellow-400 to-yellow-600" />
				)}

				{/* Priority Badge */}
				<div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-display font-bold shrink-0 ${
					isStarter
						? "bg-linear-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/30"
						: "bg-white/10 text-muted border border-white/10"
				}`}>
					{isStarter ? <Crown size={14} /> : index + 1}
				</div>

				{/* Avatar */}
				<Link
					href={`/dashboard/clubs/${clubId}/members/${member.userId}`}
					className="relative z-10 shrink-0"
					onClick={(e) => isDragging && e.preventDefault()}
				>
					<div className="relative">
						<div className={`rounded-xl overflow-hidden ring-2 transition-all ${
							isStarter ? "ring-yellow-500/50" : "ring-white/10 hover:ring-accent/50"
						}`}>
							{member.userProfile && <Avatar profile={member.userProfile} size="small" />}
						</div>
						{member.jerseyNumber && (
							<div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-accent text-black text-[10px] font-display font-bold flex items-center justify-center border-2 border-(--broadcast-dark) shadow-xs">
								{member.jerseyNumber}
							</div>
						)}
					</div>
				</Link>

				{/* Name & Status */}
				<Link
					href={`/dashboard/clubs/${clubId}/members/${member.userId}`}
					className="flex-1 min-w-0 z-10"
					onClick={(e) => isDragging && e.preventDefault()}
				>
					<div className="font-body text-sm font-semibold text-white hover:text-accent transition-colors truncate flex items-center gap-2">
						{member.userProfile?.name} {member.userProfile?.surname}
					</div>
					<div className="font-condensed text-xs text-muted truncate flex items-center gap-1.5">
						{isStarter && (
							<span className="text-yellow-400 font-semibold">STARTER</span>
						)}
						{!isStarter && position !== "Unassigned" && (
							<span className="text-muted/70">Backup #{index}</span>
						)}
						{position === "Unassigned" && (
							<span className="text-muted/50 italic">No position</span>
						)}
					</div>
				</Link>

				{/* Action Buttons */}
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					{onEdit && (
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onEdit(member);
							}}
							className="p-2 rounded-lg bg-white/0 hover:bg-white/10 text-muted hover:text-accent transition-colors"
							title="Edit player"
						>
							<Pencil size={14} />
						</button>
					)}

					{onRemoveFromPosition && position !== "Unassigned" && (
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onRemoveFromPosition(member, position);
							}}
							className="p-2 rounded-lg bg-white/0 hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
							title="Remove from position"
						>
							<X size={14} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

// Drag overlay export
export function ClaudePlayerDragOverlay({ member }: { member: TeamMember }) {
	return (
		<div className="flex items-center gap-3 p-4 rounded-xl bg-(--broadcast-dark) border-2 border-accent shadow-2xl shadow-accent/30 min-w-[220px]">
			<div className="relative">
				<div className="rounded-xl overflow-hidden ring-2 ring-accent">
					{member.userProfile && <Avatar profile={member.userProfile} size="small" />}
				</div>
				{member.jerseyNumber && (
					<div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-accent text-black text-[10px] font-display font-bold flex items-center justify-center border-2 border-(--broadcast-dark)">
						{member.jerseyNumber}
					</div>
				)}
			</div>
			<div className="flex-1 min-w-0">
				<div className="font-display text-sm font-bold text-white uppercase tracking-wider truncate">
					{member.userProfile?.name} {member.userProfile?.surname}
				</div>
				<div className="font-condensed text-xs text-accent">
					Dragging...
				</div>
			</div>
		</div>
	);
}
