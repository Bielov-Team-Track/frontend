"use client";

import { Input } from "@/components";
import { TeamMember } from "@/lib/models/Club";
import { Search, Star, X } from "lucide-react";
import { useState } from "react";
import { VOLLEYBALL_POSITIONS_OPTIONS } from "../constants";

interface PositionAssignmentPopupProps {
	title: string;
	members: TeamMember[];
	assignedMembers: TeamMember[];
	onToggle: (memberId: string) => void;
	onRemove?: (memberId: string) => void;
	className?: string;
	showPriority?: boolean;
}

export default function PositionAssignmentPopup({
	title,
	members,
	assignedMembers,
	onToggle,
	onRemove,
	className,
	showPriority = false,
}: PositionAssignmentPopupProps) {
	const [search, setSearch] = useState("");

	const filteredMembers = members.filter((m) => {
		const name = `${m.userProfile?.name || ""} ${m.userProfile?.surname || ""}`.toLowerCase();
		return name.includes(search.toLowerCase()) || (m.jerseyNumber && m.jerseyNumber.includes(search));
	});

	// Separate assigned and unassigned for display when showing priority
	const assignedMemberIds = new Set(assignedMembers.map((m) => m.id));
	const unassignedFiltered = filteredMembers.filter((m) => !assignedMemberIds.has(m.id));

	return (
		<div
			className={`absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-surface-elevated border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-96 ${
				className || "top-full"
			}`}
			onClick={(e) => e.stopPropagation()}>
			<div className="p-3 border-b border-border bg-hover">
				<div className="text-xs font-bold text-muted-foreground uppercase mb-2 text-center">{title}</div>
				<div className="relative">
					<Input
						type="text"
						placeholder="Search player..."
						className="bg-overlay-light"
						autoFocus
						value={search}
						leftIcon={<Search size={16} className="text-muted-foreground" />}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<div className="overflow-y-auto flex-1">
				{/* Assigned members section with priority */}
				{showPriority && assignedMembers.length > 0 && (
					<div className="p-2 border-b border-border">
						<div className="text-[10px] font-bold text-muted-foreground uppercase mb-2 px-1 flex items-center gap-1">
							<Star size={10} className="text-yellow-500" />
							Assigned ({assignedMembers.length})
						</div>
						<div className="space-y-1">
							{assignedMembers.map((member, index) => (
								<div key={member.id} className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 border border-accent/30 group">
									{/* Priority number */}
									<div
										className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
											index === 0 ? "bg-yellow-500 text-black" : "bg-foreground/20 text-foreground"
										}`}>
										{index + 1}
									</div>

									<div className="w-7 h-7 rounded-full bg-background flex items-center justify-center text-xs font-bold text-muted-foreground">
										{member.jerseyNumber || "#"}
									</div>

									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium text-foreground truncate">
											{member.userProfile?.name} {member.userProfile?.surname}
										</div>
										{index === 0 && <div className="text-[10px] text-yellow-500 font-medium">Starter</div>}
									</div>

									{/* Remove button */}
									{onRemove && (
										<button
											onClick={(e) => {
												e.stopPropagation();
												onRemove(member.id);
											}}
											className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
											<X size={14} />
										</button>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Unassigned / All members section */}
				<div className="p-1 space-y-0.5">
					{showPriority && unassignedFiltered.length > 0 && (
						<div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 px-2 pt-1">Available Players</div>
					)}
					{(showPriority ? unassignedFiltered : filteredMembers).map((member) => {
						const isSelected = assignedMemberIds.has(member.id);
						return (
							<button
								key={member.id}
								onClick={() => onToggle(member.id)}
								className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
									isSelected ? "bg-accent/20 border border-accent/50" : "hover:bg-hover border border-transparent"
								}`}>
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
										isSelected ? "bg-accent text-white" : "bg-background text-muted-foreground"
									}`}>
									{member.jerseyNumber || "#"}
								</div>
								<div className="flex-1 min-w-0">
									<div className={`text-sm font-medium truncate ${isSelected ? "text-accent" : "text-foreground"}`}>
										{member.userProfile?.name} {member.userProfile?.surname}
									</div>
									<div className="text-xs text-muted-foreground truncate">
										{member.positions?.map((p) => VOLLEYBALL_POSITIONS_OPTIONS.find((opt) => opt.value === p)?.label || p).join(", ") ||
											"No pos"}
									</div>
								</div>
								{isSelected && !showPriority && <div className="w-2 h-2 rounded-full bg-accent" />}
							</button>
						);
					})}
					{(showPriority ? unassignedFiltered : filteredMembers).length === 0 && (
						<div className="p-4 text-center text-xs text-muted-foreground">
							{showPriority && assignedMembers.length > 0 ? "All players assigned" : "No members found"}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
