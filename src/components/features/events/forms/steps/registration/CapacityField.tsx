import { Slider } from "@/components/ui";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";

export function CapacityField() {
	const { form } = useEventFormContext();
	const { control, formState: { errors } } = form;

	return (
		<Controller
			name="capacity"
			control={control}
			render={({ field: { value, onChange } }) => (
				<Slider
					label="Maximum Participants"
					value={value ?? null}
					onValueChange={(val) => onChange(val)}
					min={1}
					max={100}
					step={1}
					clearable
					editable
					placeholder="Unlimited"
					helperText="Slide to set a limit, or leave as unlimited"
					error={errors.capacity?.message}
					optional
				/>
			)}
		/>
	);
}
