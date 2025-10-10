import { Controller } from "react-hook-form";
import { Input, Select, Checkbox } from "@/components/ui";
import { FaVolleyballBall, FaUsers, FaDollarSign } from "react-icons/fa";
import { EventFormat } from "@/lib/models/Event";
import { useEventFormContext } from "../context/EventFormContext";
import { eventFormatOptions } from "../constants/eventFormOptions";
import { FaUserGroup } from "react-icons/fa6";
import { RegistrationUnitOptions } from "@/lib/models/EventBudget";

export function EventSettingsStep() {
	const { form } = useEventFormContext();
	const {
		control,
		formState: { errors },
		watch,
	} = form;
	const values = watch();

	return (
		<div className="space-y-6">
			<div className="text-center mb-8">
				<span className="w-12 h-12 text-[48px] mx-auto mb-3">⚙️</span>
				<h2 className="text-xl font-semibold  mb-2">Event Settings</h2>
				<p className="/60">
					Configure teams, participants, and registration settings.
				</p>
			</div>

			<div className="space-y-6">
				<Controller
					name="eventFormat"
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							label="Event Format"
							placeholder="Select event format"
							leftIcon={<FaVolleyballBall />}
							options={eventFormatOptions}
							error={errors.eventFormat?.message}
						/>
					)}
				/>

				<div className="space-y-6">
					<Controller
						name="registrationUnit"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								label="Registration unit"
								placeholder="Select how participants will register"
								leftIcon={<FaUserGroup />}
								options={RegistrationUnitOptions}
								error={errors.registrationUnit?.message}
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
									leftIcon={<FaUsers />}
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
									label="Maximum Participants (Optional)"
									leftIcon={<FaUsers />}
									error={errors.capacity?.message}
									min="1"
									helperText="Leave empty for unlimited participants"
								/>
							)}
						/>
					)}

					<Controller
						name="isPrivate"
						control={control}
						render={({ field: { value, onChange, ...field } }) => (
							<Checkbox
								{...field}
								checked={value}
								onChange={onChange}
								label="Private Event"
								helperText="Private events are only visible to invited participants"
							/>
						)}
					/>

					<Controller
						name="approveGuests"
						control={control}
						render={({ field: { value, onChange, ...field } }) => (
							<Checkbox
								{...field}
								checked={value}
								onChange={onChange}
								label="Require approval for new participants"
								helperText="You'll need to approve each participant before they can join"
							/>
						)}
					/>
				</div>
			</div>
		</div>
	);
}
