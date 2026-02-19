import { RadioCards } from "@/components/ui";
import { EventFormat } from "@/lib/models/Event";
import { LayoutGrid, List, Users } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";
import type { CasualPlayFormat } from "../../types/registration";

const formatCards = [
	{
		value: "list" as CasualPlayFormat,
		label: "List",
		description: "Simple participant list",
		icon: List,
	},
	{
		value: "openTeams" as CasualPlayFormat,
		label: "Open Teams",
		description: "Teams with generic player slots. Good for begginers, casual games",
		icon: Users,
	},
	{
		value: "teamsWithPositions" as CasualPlayFormat,
		label: "Positions",
		description: "Teams with volleyball positions. Good for experienced players.",
		icon: LayoutGrid,
	},
];

const casualPlayToEventFormat: Record<CasualPlayFormat, EventFormat> = {
	list: EventFormat.List,
	openTeams: EventFormat.OpenTeams,
	teamsWithPositions: EventFormat.TeamsWithPositions,
};

export function CasualPlayFormatSelector() {
	const { form } = useEventFormContext();
	const {
		control,
		setValue,
		formState: { errors },
	} = form;

	return (
		<Controller
			name="casualPlayFormat"
			control={control}
			render={({ field }) => (
				<RadioCards
					label="Event Format"
					options={formatCards}
					value={field.value}
					onChange={(value: string) => {
						field.onChange(value);
						setValue("eventFormat", casualPlayToEventFormat[value as CasualPlayFormat]);
					}}
					error={errors.casualPlayFormat?.message}
					columns={3}
				/>
			)}
		/>
	);
}
