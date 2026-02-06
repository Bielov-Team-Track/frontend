import { useState } from "react";
import { useEventFormContext } from "../../context/EventFormContext";
import type { MatchTeamSlot } from "../../types/registration";
import { TeamSlotCard } from "./TeamSlotCard";

// Mock data - will be replaced with actual API call
const mockUserTeams = [
	{ id: "1", name: "Beach Volleyers", clubName: "Sunset Beach Club", color: "#FF6B6B" },
	{ id: "2", name: "Indoor Warriors", clubName: "City Sports Club", color: "#4ECDC4" },
	{ id: "3", name: "Sand Devils", clubName: "Sunset Beach Club", color: "#45B7D1" },
];

export function MatchTeamSlots() {
	const { form } = useEventFormContext();
	// These would be form fields in a real implementation
	const [homeTeam, setHomeTeam] = useState<MatchTeamSlot | null>(null);
	const [awayTeam, setAwayTeam] = useState<MatchTeamSlot | null>(null);

	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="space-y-3 sm:space-y-4">
				<h3 className="text-xs sm:text-sm font-medium text-foreground">Team Selection</h3>

				<TeamSlotCard label="Home Team" slot={homeTeam} onChange={setHomeTeam} />

				<div className="flex items-center gap-3 sm:gap-4">
					<div className="flex-1 h-px bg-hover" />
					<span className="text-[10px] sm:text-xs text-muted font-medium">VS</span>
					<div className="flex-1 h-px bg-hover" />
				</div>

				<TeamSlotCard label="Away Team" slot={awayTeam} onChange={setAwayTeam} />
			</div>
		</div>
	);
}
