import { Input, RadioCards } from "@/components/ui";
import { EventFormat } from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventBudget";
import { LayoutGrid, User, UserPlus, Users, UsersRound } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../context/EventFormContext";

const eventFormatCards = [
	{
		value: EventFormat.Open,
		label: "Open",
		description: "Individual registration, no teams",
		icon: UserPlus,
	},
	{
		value: EventFormat.OpenTeams,
		label: "Open Teams",
		description: "Teams with flexible player slots",
		icon: UsersRound,
	},
	{
		value: EventFormat.TeamsWithPositions,
		label: "Positions",
		description: "Teams with volleyball positions",
		icon: LayoutGrid,
	},
];

const registrationUnitCards = [
	{
		value: Unit.Individual,
		label: "Individual",
		description: "Single person can register",
		icon: User,
	},
	{
		value: Unit.Team,
		label: "Team",
		description: "Only full teams can register",
		icon: Users,
	},
];

export function EventSettingsStep() {
	const { form } = useEventFormContext();
	const {
		control,
		formState: { errors },
		watch,
	} = form;
	const values = watch();

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b-2 pb-4">
				<h2 className="text-xl font-bold text-white mb-1">Event Settings</h2>
				<p className="text-muted text-sm">Configure teams, participants, and registration settings.</p>
			</div>

			<div className="space-y-6">
				<Controller
					name="eventFormat"
					control={control}
					render={({ field }) => (
						<RadioCards
							label="Event Format"
							options={eventFormatCards}
							value={field.value}
							onChange={field.onChange}
							error={errors.eventFormat?.message}
							columns={3}
						/>
					)}
				/>

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

				{values.eventFormat !== EventFormat.Open && (
					<Controller
						name="teamsNumber"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								type="number"
								label="Number of Teams"
								leftIcon={<Users size={16} />}
								error={errors.teamsNumber?.message}
								min="1"
							/>
						)}
					/>
				)}

				{values.eventFormat === EventFormat.Open && (
					<Controller
						name="capacity"
						control={control}
						render={({ field: { value, ...field } }) => (
							<Input
								{...field}
								value={value ?? ""}
								type="number"
								label="Maximum Participants"
								leftIcon={<Users size={16} />}
								error={errors.capacity?.message}
								min="1"
								helperText="Leave empty for unlimited participants"
								optional
							/>
						)}
					/>
				)}
			</div>
		</div>
	);
}
