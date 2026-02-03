import { Input } from "@/components/ui";
import { Users } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";

export function CapacityField() {
	const { form } = useEventFormContext();
	const { control, formState: { errors } } = form;

	return (
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
					data-testid="capacity-input"
				/>
			)}
		/>
	);
}
