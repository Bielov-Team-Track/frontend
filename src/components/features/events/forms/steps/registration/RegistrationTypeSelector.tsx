import { RadioCards } from "@/components/ui";
import { Lock, Unlock } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";
import type { RegistrationType } from "../../types/registration";

const registrationTypeCards = [
	{
		value: "open" as RegistrationType,
		label: "Open",
		description: "Anyone with access can register",
		icon: Unlock,
	},
	{
		value: "closed" as RegistrationType,
		label: "Closed",
		description: "Invitees only",
		icon: Lock,
	},
];

export function RegistrationTypeSelector() {
	const { form } = useEventFormContext();
	const {
		control,
		formState: { errors },
	} = form;

	return (
		<Controller
			name="registrationType"
			control={control}
			render={({ field }) => (
				<RadioCards
					label="Registration Type"
					options={registrationTypeCards}
					value={field.value}
					onChange={field.onChange}
					error={errors.registrationType?.message}
					columns={2}
				/>
			)}
		/>
	);
}
