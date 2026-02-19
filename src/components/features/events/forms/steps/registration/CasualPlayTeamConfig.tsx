import { RadioCards } from "@/components/ui";
import { Unit } from "@/lib/models/EventPaymentConfig";
import { User, Users } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";
import { CasualPlayTeamSlots } from "./CasualPlayTeamSlots";
import type { CasualTeamSlot } from "../../types/registration";
import { useState } from "react";

const registrationUnitCards = [
	{
		value: Unit.Individual,
		label: "Individual",
		description: "Join any team with open slot",
		icon: User,
	},
	{
		value: Unit.Team,
		label: "Team",
		description: "Register as a full team",
		icon: Users,
	},
];

export function CasualPlayTeamConfig() {
	const { form } = useEventFormContext();
	const { watch, control, formState: { errors } } = form;
	const registrationType = watch("registrationType");

	const [teamSlots, setTeamSlots] = useState<CasualTeamSlot[]>([
		{ name: "Team 1", color: "#FF6B6B" },
		{ name: "Team 2", color: "#4ECDC4" },
	]);

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Registration Unit */}
			<Controller
				name="registrationUnit"
				control={control}
				render={({ field }) => (
					<RadioCards
						label="Registration Unit"
						options={registrationUnitCards}
						value={field.value}
						onChange={field.onChange}
						error={errors.registrationUnit?.message}
						columns={2}
					/>
				)}
			/>

			{/* Team Slots (only for open registration) */}
			{registrationType === "open" && (
				<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border">
					<CasualPlayTeamSlots slots={teamSlots} onChange={setTeamSlots} />
				</div>
			)}

			{registrationType === "closed" && (
				<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border">
					<h3 className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Teams</h3>
					<p className="text-muted-foreground text-[10px] sm:text-sm mb-3 sm:mb-4">
						Invite existing teams or create teams with captains who will manage rosters.
					</p>
					<div className="p-4 sm:p-8 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground text-xs sm:text-sm">
						Closed registration team management coming soon...
					</div>
				</div>
			)}
		</div>
	);
}
