"use client";

import { TeamMember, VolleyballPosition } from "@/lib/models/Club";
import { useDroppable } from "@dnd-kit/core";
import { Plus, Star } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { COURT_POSITIONS } from "../constants";
import PositionAssignmentPopup from "./PositionAssignmentPopup";

interface VolleyballCourtProps {
	members: TeamMember[];
	courtAssignments?: Record<string, string[]>;
	assigningPosition: string | null;
	onPositionClick: (positionId: string | null) => void;
	onTogglePlayer: (memberId: string) => void;
	onRemoveFromPosition?: (positionId: string, memberId: string) => void;
	onReorderInPosition?: (positionId: string, oldIndex: number, newIndex: number) => void;
	sidebarPriorities?: Record<string, string[]>; // VolleyballPosition -> ordered member IDs
}

export default function VolleyballCourt({
	members,
	courtAssignments,
	assigningPosition,
	onPositionClick,
	onTogglePlayer,
	onRemoveFromPosition,
	onReorderInPosition,
	sidebarPriorities,
}: VolleyballCourtProps) {
	// Auto-assign members based on their positions from roster
	// Uses sidebarPriorities to determine display order
	const autoAssignments = useMemo(() => {
		const assignments: Record<string, TeamMember[]> = {};

		// Helper to sort members by sidebar priority
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

		// Handle Libero separately (not on main court positions)
		const liberos = members.filter((member) => member.positions?.includes(VolleyballPosition.Libero));
		if (liberos.length > 0) {
			assignments["Libero"] = sortByPriority(liberos, VolleyballPosition.Libero);
		}

		return assignments;
	}, [members, sidebarPriorities]);

	const getAssignedMembers = (positionId: string): TeamMember[] => {
		// If manual assignments provided, use those (in order); otherwise use auto-assignments
		if (courtAssignments && courtAssignments[positionId]?.length > 0) {
			const memberIds = courtAssignments[positionId];
			// Preserve order from courtAssignments
			return memberIds.map((id) => members.find((m) => m.id === id)).filter((m): m is TeamMember => m !== undefined);
		}
		return autoAssignments[positionId] || [];
	};

	return (
		<div>
			<div className="aspect-[1.8] bg-orange-500/20 rounded-xl border-4 border-white/20 relative p-8 shadow-inner" onClick={() => onPositionClick(null)}>
				{/* Court Lines */}
				<div className="absolute inset-0 m-4 border-2 border-white/20 pointer-events-none" />
				<div className="absolute top-[33%] left-4 right-4 h-0.5 bg-white/20 border-t-2 border-dashed border-white/20 pointer-events-none" />

				{/* Positions */}
				{COURT_POSITIONS.map((pos) => {
					const assignedMembers = getAssignedMembers(pos.id);
					const isSelecting = assigningPosition === pos.id;

					return (
						<DroppableCourtPosition
							key={pos.id}
							positionId={pos.id}
							label={pos.label}
							name={pos.name}
							x={pos.x}
							y={pos.y}
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
			</div>

			{/* Libero & Coach */}
			<div className="flex gap-4 mt-4 justify-center">
				{["Libero", "Coach"].map((role) => {
					const assigned = getAssignedMembers(role);
					const isSelecting = assigningPosition === role;
					return (
						<DroppableRolePosition
							key={role}
							role={role}
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

// Droppable court position component
interface DroppableCourtPositionProps {
	positionId: string;
	label: string;
	name: string;
	x: string;
	y: string;
	assignedMembers: TeamMember[];
	isSelecting: boolean;
	onPositionClick: () => void;
	members: TeamMember[];
	onTogglePlayer: (memberId: string) => void;
	onRemoveFromPosition?: (positionId: string, memberId: string) => void;
	showPopup: boolean;
}

function DroppableCourtPosition({
	positionId,
	label,
	name,
	x,
	y,
	assignedMembers,
	isSelecting,
	onPositionClick,
	members,
	onTogglePlayer,
	onRemoveFromPosition,
	showPopup,
}: DroppableCourtPositionProps) {
	const { isOver, setNodeRef } = useDroppable({
		id: `position-${positionId}`,
		data: {
			type: "position",
			positionId,
			name,
		},
	});

	const isAssigned = assignedMembers.length > 0;

	return (
		<div
			ref={setNodeRef}
			className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 z-10"
			style={{ left: x, top: y }}
			onClick={(e) => e.stopPropagation()}>
			<button
				onClick={onPositionClick}
				className={`w-full h-full flex flex-col items-center justify-center transition-all ${
					isSelecting ? "scale-110 z-20" : "hover:scale-105 active:scale-95"
				} ${isOver ? "scale-110" : ""}`}>
				{isAssigned ? (
					<>
						<div
							className={`relative w-14 h-14 transition-all ${
								isOver ? "ring-4 ring-accent ring-offset-2 ring-offset-transparent rounded-full" : ""
							}`}>
							{assignedMembers.slice(0, 2).map((member, idx) => (
								<div
									key={member.id}
									className={`absolute inset-0 rounded-full bg-background-dark border-2 flex items-center justify-center text-sm font-bold text-white shadow-lg overflow-hidden ${
										idx === 0 ? "border-yellow-500 z-10" : "border-accent translate-x-2 translate-y-2 z-0"
									}`}>
									{member.userProfile?.imageUrl ? (
										<Image
											width={56}
											height={56}
											alt={`Profile for ${member.userProfile?.name} ${member.userProfile?.surname}`}
											src={member.userProfile?.imageUrl}
										/>
									) : (
										member.userProfile?.name?.[0]
									)}
									{/* Star indicator for starter (priority 0) */}
									{idx === 0 && assignedMembers.length > 1 && (
										<div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center z-20">
											<Star size={10} className="text-black fill-black" />
										</div>
									)}
								</div>
							))}
							{assignedMembers.length > 2 && (
								<div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold z-20 border border-white">
									+{assignedMembers.length - 2}
								</div>
							)}
						</div>
						<span className="mt-1 text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-full truncate max-w-full">
							{assignedMembers.length === 1 ? assignedMembers[0].userProfile?.name : `${assignedMembers.length} Players`}
						</span>
					</>
				) : (
					<>
						<div
							className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
								isOver
									? "bg-accent text-white border-accent scale-110 ring-4 ring-accent/30"
									: isSelecting
									? "bg-accent text-white border-accent"
									: "bg-white/10 border-white/30 text-white/50 hover:bg-white/20 hover:text-white"
							}`}>
							<Plus size={20} />
						</div>
						<span className={`mt-1 text-xs ${isOver ? "text-accent font-medium" : "text-white/50"}`}>{label}</span>
					</>
				)}
			</button>

			{/* Popup with priority list */}
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

// Droppable role position (Libero/Coach)
interface DroppableRolePositionProps {
	role: string;
	assignedMembers: TeamMember[];
	isSelecting: boolean;
	onPositionClick: () => void;
	members: TeamMember[];
	onTogglePlayer: (memberId: string) => void;
	onRemoveFromPosition?: (positionId: string, memberId: string) => void;
	showPopup: boolean;
}

function DroppableRolePosition({
	role,
	assignedMembers,
	isSelecting,
	onPositionClick,
	members,
	onTogglePlayer,
	onRemoveFromPosition,
	showPopup,
}: DroppableRolePositionProps) {
	const { isOver, setNodeRef } = useDroppable({
		id: `position-${role}`,
		data: {
			type: "position",
			positionId: role,
			name: role,
		},
	});

	return (
		<div ref={setNodeRef} className="relative" onClick={(e) => e.stopPropagation()}>
			<div
				className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
					isOver ? "bg-accent/20 border-accent ring-2 ring-accent/30" : "bg-white/5 border-white/10 hover:bg-white/10"
				}`}
				onClick={onPositionClick}>
				<div className="text-xs text-muted font-bold uppercase tracking-wider">{role}</div>
				<div
					className={`w-10 h-10 rounded-full border flex items-center justify-center relative transition-all ${
						isOver ? "bg-accent/20 border-accent" : "bg-white/10 border-white/20"
					}`}>
					{assignedMembers.length > 0 ? (
						<span className="text-white font-bold">{assignedMembers[0].userProfile?.name?.[0]}</span>
					) : (
						<Plus size={16} className={isOver ? "text-accent" : "text-muted"} />
					)}
					{assignedMembers.length > 1 && (
						<div className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-[10px] rounded-full flex items-center justify-center text-white border border-background-dark">
							{assignedMembers.length}
						</div>
					)}
				</div>
			</div>
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
