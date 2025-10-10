import { Controller } from "react-hook-form";
import { Input, Select, TextArea } from "@/components/ui";
import { FaVolleyballBall } from "react-icons/fa";
import { useEventFormContext } from "../context/EventFormContext";
import {
	eventTypeOptions,
	surfaceOptions,
} from "../constants/eventFormOptions";
import { GiRunningShoe } from "react-icons/gi";

export function EventDetailsStep() {
	const { form } = useEventFormContext();
	const {
		control,
		formState: { errors },
	} = form;

	return (
		<div className="space-y-6">
			<div className="text-center mb-8">
				<span className="w-12 h-12 mx-auto text-[48px]">🏐</span>
				<h2 className="text-xl font-semibold  mb-2">Event Details</h2>
				<p className="/60">
					Let&apos;s start with the basic information about your event
				</p>
			</div>

			<div className="grid gap-6">
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							label="Event Name"
							placeholder="e.g., Sunday Beach Volleyball Tournament"
							error={errors.name?.message}
							helperText="Give your event a catchy and descriptive name"
							required
						/>
					)}
				/>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Controller
						name="type"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder="Select event type"
								leftIcon={<FaVolleyballBall />}
								options={eventTypeOptions}
								error={errors.type?.message}
								required
							/>
						)}
					/>

					<Controller
						name="surface"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								placeholder="Select surface"
								options={surfaceOptions}
								error={errors.surface?.message}
								leftIcon={<GiRunningShoe />}
								required
							/>
						)}
					/>
				</div>

				<Controller
					name="description"
					control={control}
					render={({ field }) => (
						<TextArea
							{...field}
							label="Description (Optional)"
							placeholder="Describe your event, rules, what to bring, etc..."
							maxLength={500}
							showCharCount
							minRows={3}
							helperText="Help participants know what to expect"
						/>
					)}
				/>
			</div>
		</div>
	);
}
