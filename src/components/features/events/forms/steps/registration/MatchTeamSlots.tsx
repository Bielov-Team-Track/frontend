import { useEventFormContext } from "../../context/EventFormContext";
import type { MatchTeamSlot } from "../../types/registration";
import { TeamSlotCard } from "./TeamSlotCard";

export function MatchTeamSlots() {
	const { form } = useEventFormContext();
	const homeTeam = form.watch("homeTeamSlot") as MatchTeamSlot | null;
	const awayTeam = form.watch("awayTeamSlot") as MatchTeamSlot | null;

	return (
		<div className="@container">
			<div className="grid grid-cols-1 @xl:grid-cols-[1fr_auto_1fr] @xl:items-stretch @xl:gap-3">
				<TeamSlotCard
					label="Home"
					slot={homeTeam}
					onChange={(slot) => form.setValue("homeTeamSlot", slot, { shouldValidate: true })}
				/>

				{/* VS Divider - horizontal when narrow, vertical when wide */}
				<div className="flex @xl:flex-col items-center gap-2 @xl:gap-1 py-2 @xl:py-0 @xl:px-1">
					<div className="flex-1 h-px @xl:h-auto @xl:w-px bg-border" />
					<div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[11px] font-bold tracking-wide shrink-0">
						VS
					</div>
					<div className="flex-1 h-px @xl:h-auto @xl:w-px bg-border" />
				</div>

				<TeamSlotCard
					label="Away"
					slot={awayTeam}
					onChange={(slot) => form.setValue("awayTeamSlot", slot, { shouldValidate: true })}
				/>
			</div>
		</div>
	);
}
