import { RadioCards } from "@/components/ui";
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

export function CasualPlayFormatSelector() {
	const { form } = useEventFormContext();
	const {
		control,
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
					onChange={field.onChange}
					error={errors.casualPlayFormat?.message}
					columns={3}
				/>
			)}
		/>
	);
}
