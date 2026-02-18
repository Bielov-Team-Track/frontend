import { useEventFormContext } from "../../context/EventFormContext";
import type { MatchTeamSlot } from "../../types/registration";
import { TeamSlotCard } from "./TeamSlotCard";

export function MatchTeamSlots() {
	const { form } = useEventFormContext();
	const homeTeam = form.watch("homeTeamSlot") as MatchTeamSlot | null;
	const awayTeam = form.watch("awayTeamSlot") as MatchTeamSlot | null;

	return (
		<div className="flex flex-col sm:flex-row sm:items-stretch sm:gap-3">
			<div className="sm:flex-1">
				<TeamSlotCard
					label="Home"
					slot={homeTeam}
					onChange={(slot) => form.setValue("homeTeamSlot", slot, { shouldValidate: true })}
				/>
			</div>

			{/* VS Divider - horizontal on mobile, vertical on desktop */}
			<div className="flex sm:flex-col items-center gap-2 sm:gap-1 py-2 sm:py-0 sm:px-1">
				<div className="flex-1 h-px sm:h-auto sm:w-px bg-border sm:flex-1" />
				<div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[11px] font-bold tracking-wide shrink-0">
					VS
				</div>
				<div className="flex-1 h-px sm:h-auto sm:w-px bg-border sm:flex-1" />
			</div>

			<div className="sm:flex-1">
				<TeamSlotCard
					label="Away"
					slot={awayTeam}
					onChange={(slot) => form.setValue("awayTeamSlot", slot, { shouldValidate: true })}
				/>
			</div>
		</div>
	);
}
