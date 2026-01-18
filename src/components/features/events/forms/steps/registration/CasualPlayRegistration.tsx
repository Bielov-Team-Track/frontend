import { useState } from "react";
import { RadioCards } from "@/components/ui";
import { Unit } from "@/lib/models/EventBudget";
import { User, Users } from "lucide-react";
import { CasualPlayFormatSelector } from "./CasualPlayFormatSelector";
import { RegistrationTypeSelector } from "./RegistrationTypeSelector";
import { RegistrationTimingFields } from "./RegistrationTimingFields";
import { CapacityField } from "./CapacityField";
import { CasualPlayTeamSlots } from "./CasualPlayTeamSlots";
import { ListRegistration } from "./ListRegistration";
import { useEventFormContext } from "../../context/EventFormContext";
import type { CasualPlayFormat, CasualTeamSlot } from "../../types/registration";
import { Controller } from "react-hook-form";

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

export function CasualPlayRegistration() {
	const { form } = useEventFormContext();
	const { watch, control, formState: { errors } } = form;

	const casualPlayFormat = watch("casualPlayFormat") as CasualPlayFormat | undefined;
	const registrationType = watch("registrationType");

	// Local state for team slots (will be moved to form state later)
	const [teamSlots, setTeamSlots] = useState<CasualTeamSlot[]>([
		{ name: "Team 1", color: "#FF6B6B" },
		{ name: "Team 2", color: "#4ECDC4" },
	]);

	// If list format, use ListRegistration
	if (casualPlayFormat === "list") {
		return (
			<div className="space-y-6">
				<CasualPlayFormatSelector />
				<ListRegistration />
			</div>
		);
	}

	// If teams format
	if (casualPlayFormat === "openTeams" || casualPlayFormat === "teamsWithPositions") {
		return (
			<div className="space-y-6">
				<CasualPlayFormatSelector />
				<RegistrationTypeSelector />

				{registrationType === "open" && (
					<>
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

						{/* Team Slots */}
						<div className="p-4 rounded-xl bg-white/5 border border-white/10">
							<CasualPlayTeamSlots
								slots={teamSlots}
								onChange={setTeamSlots}
							/>
						</div>
					</>
				)}

				{registrationType === "closed" && (
					<div className="p-4 rounded-xl bg-white/5 border border-white/10">
						<h3 className="text-sm font-medium text-white mb-2">Teams</h3>
						<p className="text-muted text-sm mb-4">
							Invite existing teams or create teams with captains who will manage rosters.
						</p>
						<div className="p-8 border-2 border-dashed border-white/20 rounded-xl text-center text-muted text-sm">
							Closed registration team management coming in Phase 5...
						</div>
					</div>
				)}

				<div className="p-4 rounded-xl bg-white/5 border border-white/10">
					<RegistrationTimingFields />
				</div>
			</div>
		);
	}

	// No format selected yet - just show format selector
	return (
		<div className="space-y-6">
			<CasualPlayFormatSelector />

			<div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
				<p className="text-muted text-sm">
					Select a format above to configure registration settings.
				</p>
			</div>
		</div>
	);
}
