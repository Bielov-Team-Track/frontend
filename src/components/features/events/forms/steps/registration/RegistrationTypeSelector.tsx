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
		setValue,
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
					onChange={(value) => {
						field.onChange(value);
						// Also set isPublic based on registration type
						setValue("isPublic", value === "open");
					}}
					error={errors.registrationType?.message}
					columns={2}
				/>
			)}
		/>
	);
}
