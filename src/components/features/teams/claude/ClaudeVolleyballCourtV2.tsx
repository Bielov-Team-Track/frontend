"use client";

import { TeamMember, VolleyballPosition } from "@/lib/models/Club";
import { useDroppable } from "@dnd-kit/core";
import { Plus, Crown, User, Users, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { COURT_POSITIONS } from "../constants";
import PositionAssignmentPopup from "../components/PositionAssignmentPopup";

interface ClaudeVolleyballCourtV2Props {
	members: TeamMember[];
	courtAssignments?: Record<string, string[]>;
	assigningPosition: string | null;
	onPositionClick: (positionId: string | null) => void;
	onTogglePlayer: (memberId: string) => void;
	onRemoveFromPosition?: (positionId: string, memberId: string) => void;
	onReorderInPosition?: (positionId: string, oldIndex: number, newIndex: number) => void;
	sidebarPriorities?: Record<string, string[]>;
}

// Position colors for court display
const COURT_POSITION_STYLES: Record<string, { gradient: string; border: string; glow: string; label: string }> = {
	"P1": { gradient: "from-yellow-500 to-yellow-600", border: "border-yellow-500", glow: "shadow-yellow-500/40", label: "S" },
	"P2": { gradient: "from-red-500 to-red-600", border: "border-red-500", glow: "shadow-red-500/40", label: "OPP" },
	"P3": { gradient: "from-purple-500 to-purple-600", border: "border-purple-500", glow: "shadow-purple-500/40", label: "MB" },
	"P4": { gradient: "from-blue-500 to-blue-600", border: "border-blue-500", glow: "shadow-blue-500/40", label: "OH" },
	"P5": { gradient: "from-blue-500 to-blue-600", border: "border-blue-500", glow: "shadow-blue-500/40", label: "OH" },
	"P6": { gradient: "from-purple-500 to-purple-600", border: "border-purple-500", glow: "shadow-purple-500/40", label: "MB" },
	"Libero": { gradient: "from-green-500 to-green-600", border: "border-green-500", glow: "shadow-green-500/40", label: "LIB" },
	"Coach": { gradient: "from-gray-500 to-gray-600", border: "border-gray-500", glow: "shadow-gray-500/40", label: "COACH" },
};

export default function ClaudeVolleyballCourtV2({
	members,
	courtAssignments,
	assigningPosition,
	onPositionClick,
	onTogglePlayer,
	onRemoveFromPosition,
	onReorderInPosition,
	sidebarPriorities,
}: ClaudeVolleyballCourtV2Props) {
	const autoAssignments = useMemo(() => {
		const assignments: Record<string, TeamMember[]> = {};

		const sortByPriority = (positionMembers: TeamMember[], position: VolleyballPosition): TeamMember[] => {
			if (!sidebarPriorities || !sidebarPriorities[position]) {
				return positionMembers;
			}
			const priorityOrder = sidebarPriorities[position];
			return [...positionMembers].sort((a, b) => {
				const aIdx = priorityOrder.indexOf(a.id);
				const bIdx = priorityOrder.indexOf(b.id);
				if (aIdx === -1 && bIdx === -1) return 0;
				if (aIdx === -1) return 1;
				if (bIdx === -1) return -1;
				return aIdx - bIdx;
			});
		};

		COURT_POSITIONS.forEach((courtPos) => {
			const matchingMembers = members.filter((member) => member.positions?.includes(courtPos.position));
			if (matchingMembers.length > 0) {
				assignments[courtPos.id] = sortByPriority(matchingMembers, courtPos.position);
			}
		});

		const liberos = members.filter((member) => member.positions?.includes(VolleyballPosition.Libero));
		if (liberos.length > 0) {
			assignments["Libero"] = sortByPriority(liberos, VolleyballPosition.Libero);
		}

		return assignments;
	}, [members, sidebarPriorities]);

	const getAssignedMembers = (positionId: string): TeamMember[] => {
		if (courtAssignments && courtAssignments[positionId]?.length > 0) {
			const memberIds = courtAssignments[positionId];
			return memberIds.map((id) => members.find((m) => m.id === id)).filter((m): m is TeamMember => m !== undefined);
		}
		return autoAssignments[positionId] || [];
	};

	return (
		<div className="space-y-6">
			{/* Main Court */}
			<div
				className="relative aspect-[1.6] rounded-2xl overflow-hidden"
				onClick={() => onPositionClick(null)}
			>
				{/* Court Background with gradient and texture */}
				<div className="absolute inset-0 bg-linear-to-b from-orange-600/30 via-orange-500/20 to-orange-600/30" />

				{/* Court texture overlay */}
				<div className="absolute inset-0 opacity-30" style={{
					backgroundImage: `
						repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px),
						repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px)
					`
				}} />

				{/* Court border glow */}
				<div className="absolute inset-0 rounded-2xl ring-2 ring-border ring-inset" />

				{/* Court outer boundary */}
				<div className="absolute inset-4 border-2 border-border rounded-xl" />

				{/* Attack line */}
				<div className="absolute top-[35%] left-4 right-4 h-0.5 bg-surface0" />
				<div className="absolute top-[35%] left-4 transform -translate-y-1/2">
					<span className="font-condensed text-[10px] text-white/40 uppercase tracking-wider">Attack Line</span>
				</div>

				{/* Center line indicator */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 rounded-b-lg">
					<span className="font-condensed text-[10px] text-white/60 uppercase tracking-wider">Net</span>
				</div>

				{/* Court positions */}
				{COURT_POSITIONS.map((pos) => {
					const assignedMembers = getAssignedMembers(pos.id);
					const isSelecting = assigningPosition === pos.id;
					const styles = COURT_POSITION_STYLES[pos.id];

					return (
						<ClaudeDroppableCourtPosition
							key={pos.id}
							positionId={pos.id}
							label={pos.label}
							name={pos.name}
							x={pos.x}
							y={pos.y}
							styles={styles}
							assignedMembers={assignedMembers}
							isSelecting={isSelecting}
							onPositionClick={() => onPositionClick(assigningPosition === pos.id ? null : pos.id)}
							members={members}
							onTogglePlayer={onTogglePlayer}
							onRemoveFromPosition={onRemoveFromPosition}
							showPopup={assigningPosition === pos.id}
						/>
					);
				})}

				{/* Position legend */}
				<div className="absolute bottom-2 right-2 flex items-center gap-2 bg-black/50 backdrop-blur-xs rounded-lg px-3 py-1.5">
					<span className="font-condensed text-[10px] text-white/50 uppercase">Front Row</span>
					<ChevronRight size={12} className="text-white/30" />
					<span className="font-condensed text-[10px] text-white/50 uppercase">Back Row</span>
				</div>
			</div>

			{/* Bench Area - Libero & Coach */}
			<div className="grid grid-cols-2 gap-4">
				{["Libero", "Coach"].map((role) => {
					const assigned = getAssignedMembers(role);
					const isSelecting = assigningPosition === role;
					const styles = COURT_POSITION_STYLES[role];

					return (
						<ClaudeDroppableRolePosition
							key={role}
							role={role}
							styles={styles}
							assignedMembers={assigned}
							isSelecting={isSelecting}
							onPositionClick={() => onPositionClick(isSelecting ? null : role)}
							members={members}
							onTogglePlayer={onTogglePlayer}
							onRemoveFromPosition={onRemoveFromPosition}
							showPopup={isSelecting}
						/>
					);
				})}
			</div>
		</div>
	);
}

interface ClaudeDroppableCourtPositionProps {
	positionId: string;
	label: string;
	name: string;
	x: string;
	y: string;
	styles: { gradient: string; border: string; glow: string; label: string };
	assignedMembers: TeamMember[];
	isSelecting: boolean;
	onPositionClick: () => void;
	members: TeamMember[];
	onTogglePlayer: (memberId: string) => void;
	onRemoveFromPosition?: (positionId: string, memberId: string) => void;
	showPopup: boolean;
}

function ClaudeDroppableCourtPosition({
	positionId,
	label,
	name,
	x,
	y,
	styles,
	assignedMembers,
	isSelecting,
	onPositionClick,
	members,
	onTogglePlayer,
	onRemoveFromPosition,
	showPopup,
}: ClaudeDroppableCourtPositionProps) {
	const { isOver, setNodeRef } = useDroppable({
		id: `position-${positionId}`,
		data: {
			type: "position",
			positionId,
			name,
		},
	});

	const isAssigned = assignedMembers.length > 0;
	const starter = assignedMembers[0];

	return (
		<div
			ref={setNodeRef}
			className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 z-10"
			style={{ left: x, top: y }}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				onClick={onPositionClick}
				className={`w-full h-full flex flex-col items-center justify-center transition-all duration-300 ${
					isSelecting ? "scale-110 z-20" : "hover:scale-105 active:scale-95"
				} ${isOver ? "scale-110" : ""}`}
			>
				{isAssigned ? (
					<div className="relative">
						{/* Main avatar */}
						<div className={`relative w-16 h-16 rounded-2xl overflow-hidden transition-all ${
							isOver
								? `ring-4 ring-accent ${styles.glow} shadow-lg`
								: isSelecting
								? `ring-2 ${styles.border} ${styles.glow} shadow-lg`
								: "ring-2 ring-border"
						}`}>
							{starter.userProfile?.imageUrl ? (
								<Image
									fill
									alt={`${starter.userProfile?.name} ${starter.userProfile?.surname}`}
									src={starter.userProfile?.imageUrl}
									className="object-cover"
								/>
							) : (
								<div className={`w-full h-full bg-linear-to-br ${styles.gradient} flex items-center justify-center`}>
									<span className="font-display text-xl font-bold text-white">
										{starter.userProfile?.name?.[0]}
									</span>
								</div>
							)}

							{/* Starter crown */}
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
								<Crown size={10} className="text-black" />
							</div>

							{/* Jersey number */}
							{starter.jerseyNumber && (
								<div className="absolute -bottom-1 -left-1 bg-black/80 text-white font-display text-xs font-bold px-1.5 py-0.5 rounded-md">
									#{starter.jerseyNumber}
								</div>
							)}
						</div>

						{/* Backup indicators */}
						{assignedMembers.length > 1 && (
							<div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex -space-x-1">
								{assignedMembers.slice(1, 4).map((member, idx) => (
									<div
										key={member.id}
										className="w-5 h-5 rounded-full bg-hover border border-border flex items-center justify-center text-[8px] font-display text-white"
										style={{ zIndex: 10 - idx }}
									>
										{member.userProfile?.name?.[0]}
									</div>
								))}
								{assignedMembers.length > 4 && (
									<div className="w-5 h-5 rounded-full bg-accent/80 border border-accent flex items-center justify-center text-[8px] font-display text-white">
										+{assignedMembers.length - 4}
									</div>
								)}
							</div>
						)}

						{/* Name label */}
						<div className="mt-2 text-center">
							<span className="font-body text-xs font-semibold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md truncate max-w-[80px] block">
								{starter.userProfile?.name}
							</span>
						</div>
					</div>
				) : (
					<>
						{/* Empty position slot */}
						<div className={`w-16 h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
							isOver
								? `bg-accent/30 border-accent ${styles.glow} shadow-lg scale-105`
								: isSelecting
								? `bg-linear-to-br ${styles.gradient} ${styles.border} border-solid`
								: "bg-surface border-border hover:bg-hover hover:border-border"
						}`}>
							<Plus size={20} className={isOver || isSelecting ? "text-white" : "text-white/50"} />
							<span className={`font-display text-xs font-bold mt-0.5 ${
								isOver || isSelecting ? "text-white" : "text-white/50"
							}`}>
								{styles.label}
							</span>
						</div>
						<span className={`mt-1.5 font-condensed text-[10px] uppercase tracking-wider ${
							isOver ? "text-accent" : "text-white/40"
						}`}>
							{label}
						</span>
					</>
				)}
			</button>

			{/* Assignment popup */}
			{showPopup && (
				<PositionAssignmentPopup
					title={name}
					members={members}
					assignedMembers={assignedMembers}
					onToggle={onTogglePlayer}
					onRemove={onRemoveFromPosition ? (memberId) => onRemoveFromPosition(positionId, memberId) : undefined}
					showPriority
				/>
			)}
		</div>
	);
}

interface ClaudeDroppableRolePositionProps {
	role: string;
	styles: { gradient: string; border: string; glow: string; label: string };
	assignedMembers: TeamMember[];
	isSelecting: boolean;
	onPositionClick: () => void;
	members: TeamMember[];
	onTogglePlayer: (memberId: string) => void;
	onRemoveFromPosition?: (positionId: string, memberId: string) => void;
	showPopup: boolean;
}

function ClaudeDroppableRolePosition({
	role,
	styles,
	assignedMembers,
	isSelecting,
	onPositionClick,
	members,
	onTogglePlayer,
	onRemoveFromPosition,
	showPopup,
}: ClaudeDroppableRolePositionProps) {
	const { isOver, setNodeRef } = useDroppable({
		id: `position-${role}`,
		data: {
			type: "position",
			positionId: role,
			name: role,
		},
	});

	const starter = assignedMembers[0];
	const isLibero = role === "Libero";

	return (
		<div ref={setNodeRef} className="relative" onClick={(e) => e.stopPropagation()}>
			<button
				onClick={onPositionClick}
				className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
					isOver
						? "bg-accent/20 border-accent ring-2 ring-accent/30 shadow-lg shadow-accent/20"
						: isSelecting
						? `bg-linear-to-r ${styles.gradient}/20 ${styles.border} ring-1 ring-current`
						: "bg-surface border-border hover:bg-hover hover:border-border"
				}`}
			>
				{/* Role icon/label */}
				<div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
					isOver
						? "bg-accent"
						: assignedMembers.length > 0
						? `bg-linear-to-br ${styles.gradient}`
						: "bg-hover"
				}`}>
					{assignedMembers.length > 0 ? (
						starter.userProfile?.imageUrl ? (
							<Image
								width={48}
								height={48}
								alt={starter.userProfile?.name || ""}
								src={starter.userProfile?.imageUrl}
								className="w-full h-full object-cover rounded-xl"
							/>
						) : (
							<span className="font-display text-lg font-bold text-white">
								{starter.userProfile?.name?.[0]}
							</span>
						)
					) : (
						<Plus size={20} className={isOver ? "text-white" : "text-muted"} />
					)}
				</div>

				{/* Info */}
				<div className="flex-1 text-left">
					<div className="font-display text-sm font-bold text-white uppercase tracking-wider">
						{role}
					</div>
					{assignedMembers.length > 0 ? (
						<div className="font-body text-xs text-muted">
							{starter.userProfile?.name} {starter.userProfile?.surname}
							{assignedMembers.length > 1 && (
								<span className="text-accent ml-1">+{assignedMembers.length - 1}</span>
							)}
						</div>
					) : (
						<div className="font-condensed text-xs text-muted/50">
							Click to assign
						</div>
					)}
				</div>

				{/* Status badge */}
				<div className={`px-2 py-1 rounded-lg font-condensed text-xs uppercase tracking-wider ${
					assignedMembers.length > 0
						? `bg-linear-to-r ${styles.gradient} text-white`
						: "bg-surface text-muted"
				}`}>
					{styles.label}
				</div>
			</button>

			{/* Assignment popup */}
			{showPopup && (
				<PositionAssignmentPopup
					title={role}
					members={members}
					assignedMembers={assignedMembers}
					onToggle={onTogglePlayer}
					onRemove={onRemoveFromPosition ? (memberId) => onRemoveFromPosition(role, memberId) : undefined}
					className="bottom-full mb-2"
					showPriority
				/>
			)}
		</div>
	);
}
