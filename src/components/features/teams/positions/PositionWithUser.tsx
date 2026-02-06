"use client";

import { Avatar } from "@/components";
import { loadWaitlist } from "@/lib/api/waitlist";
import { Position as PositionModel } from "@/lib/models/Position";
import { Team } from "@/lib/models/Team";
import { ChevronDown, Crown, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import PositionWaitlist from "./PositionWaitlist";

type PositionWithUserProps = {
	position: PositionModel;
	userId: string;
	team: Team;
	onPositionLeave?: (positionId: string) => void;
	open?: boolean;
	editable?: boolean;
};

function PositionWithUser({ position, userId, team, onPositionLeave, open = false, editable = false }: PositionWithUserProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleLeavePosition = () => {
		if (onPositionLeave) {
			onPositionLeave(position.id);
			loadWaitlist(position.id);
		}
	};

	const collapseOtherPositions = (positionId: string) => {
		const checkboxes = document.querySelectorAll(`input[type="checkbox"][name="${team.id}"]`);
		checkboxes.forEach((checkbox) => {
			if ((checkbox as HTMLInputElement).id !== positionId) {
				(checkbox as HTMLInputElement).checked = false;
			}
		});
	};

	const collapsable = open || editable || position.eventParticipant?.userProfile?.id === userId;

	const userProfile = position.eventParticipant?.userProfile;

	if (!collapsable) {
		return (
			<div className="p-3 rounded-xl bg-surface-elevated border border-border w-full flex justify-between items-center transition-all hover:bg-hover">
				<Link href={`/profiles/${userProfile?.id}`} className="flex gap-3 items-center z-50 group">
					<Avatar src={userProfile?.imageUrl} name={`${userProfile?.name} ${userProfile?.surname}`} className="w-9 h-9 border-2 border-transparent group-hover:border-accent transition-colors" />
					<div className="flex flex-col">
						<span className="whitespace-nowrap font-bold text-sm text-foreground group-hover:text-accent transition-colors">
							{userProfile?.name} {userProfile?.surname}
						</span>
						<span className="text-muted text-[10px] uppercase font-bold tracking-wider">{position.name}</span>
					</div>
				</Link>
			</div>
		);
	}

	return (
		<div
			className={`rounded-xl border transition-all duration-300 overflow-hidden ${
				isExpanded ? "bg-surface-elevated border-border shadow-lg" : "bg-surface-elevated border-border"
			}`}>
			{/* Header / Trigger */}
			<div
				className="p-3 flex items-center justify-between cursor-pointer hover:bg-hover transition-colors"
				onClick={() => {
					const newValue = !isExpanded;
					setIsExpanded(newValue);
					if (newValue) collapseOtherPositions(position.id);
				}}>
				<Link
					href={`/profiles/${userProfile?.id}`}
					className="flex gap-3 items-center group flex-1 min-w-0"
					onClick={(e) => e.stopPropagation()} // Prevent expansion when clicking profile
				>
					<Avatar src={userProfile?.imageUrl} name={`${userProfile?.name} ${userProfile?.surname}`} className="w-9 h-9 border-2 border-transparent group-hover:border-accent transition-colors shrink-0" />
					<div className="flex flex-col min-w-0">
						<div className="flex items-center gap-1.5">
							<span className="whitespace-nowrap font-bold text-sm text-foreground group-hover:text-accent transition-colors truncate">
								{userProfile?.name} {userProfile?.surname}
							</span>
							{team.captain?.id === userProfile?.id && <Crown size={12} className="text-accent shrink-0 fill-accent" />}
						</div>
						<span className="text-muted text-[10px] uppercase font-bold tracking-wider truncate">{position.name}</span>
					</div>
				</Link>

				{/* Arrow */}
				<div className={`p-1 text-muted transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
					<ChevronDown size={16} />
				</div>
			</div>

			{/* Collapsible Content */}
			<div
				className={`transition-all duration-300 ease-in-out ${
					isExpanded ? "max-h-96 opacity-100 border-t border-border" : "max-h-0 opacity-0 border-none"
				}`}>
				<div className="p-3 bg-hover">
					{(userProfile?.id === userId || editable) && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleLeavePosition();
							}}
							className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-error hover:bg-red-500/20 transition-colors text-xs font-bold uppercase tracking-wide border border-red-500/20">
							<LogOut size={14} /> Free Position
						</button>
					)}

					{open && (
						<div className="mt-3">
							<PositionWaitlist position={position} team={team} userId={userId} shouldLoad={isExpanded} />
						</div>
					)}
				</div>
			</div>

			{/* Hidden Checkbox for Logic Preservation (if needed by other components, though mostly handled by state now) */}
			<input
				id={position.id}
				type="checkbox"
				name={team?.id!}
				checked={isExpanded}
				onChange={() => {}} // Controlled by div click
				className="hidden"
			/>
		</div>
	);
}

export default PositionWithUser;
