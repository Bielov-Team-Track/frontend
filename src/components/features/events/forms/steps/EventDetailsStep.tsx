import { Checkbox, Input, RadioCards, TextArea } from "@/components";
import { EventType, PlayingSurface } from "@/lib/models/Event";
import { Dumbbell, Gamepad2, PartyPopper, Trees, Trophy, Warehouse, Waves } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../context/EventFormContext";

const eventTypeCards = [
	{
		value: EventType.CasualPlay,
		label: "Casual",
		description: "Relaxed games for fun",
		icon: Gamepad2,
	},
	{
		value: EventType.Match,
		label: "Match",
		description: "Competitive game",
		icon: Trophy,
	},
	{
		value: EventType.Social,
		label: "Social",
		description: "Hangout, meetup, or celebration",
		icon: PartyPopper,
	},
	{
		value: EventType.TrainingSession,
		label: "Training",
		description: "Practice drills and skill work",
		icon: Dumbbell,
	},
];

const surfaceCards = [
	{
		value: PlayingSurface.Indoor,
		label: "Indoor",
		description: "Gymnasium or sports hall",
		icon: Warehouse,
	},
	{
		value: PlayingSurface.Grass,
		label: "Grass",
		description: "Outdoor grass court",
		icon: Trees,
	},
	{
		value: PlayingSurface.Beach,
		label: "Beach",
		description: "Sand volleyball",
		icon: Waves,
	},
];

export function EventDetailsStep() {
	const { form } = useEventFormContext();
	const {
		control,
		formState: { errors },
	} = form;

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b-2 pb-4">
				<h2 className="text-xl font-bold text-white mb-1">Event Details</h2>
				<p className="text-muted text-sm">Let&apos;s start with the basic information about your event.</p>
			</div>

			<div className="space-y-6">
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<Input {...field} label="Name" placeholder="e.g., Sunday Beach Volleyball Tournament" error={errors.name?.message} required />
					)}
				/>

				<Controller
					name="description"
					control={control}
					render={({ field }) => (
						<TextArea
							{...field}
							label="Description"
							placeholder="Describe your event, rules, what to bring, etc..."
							maxLength={500}
							showCharCount
							minRows={4}
							optional
						/>
					)}
				/>
				<div className="p-4 rounded-xl bg-white/5 border border-white/10">
					<Controller
						name="isPrivate"
						control={control}
						render={({ field: { value, onChange, ...field } }) => (
							<Checkbox
								{...field}
								checked={value}
								onChange={onChange}
								label="Public Event"
								helperText="Public events are visible to non-members and can be found via search."
							/>
						)}
					/>
				</div>

				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<RadioCards
							label="Event Type"
							options={eventTypeCards}
							value={field.value}
							onChange={field.onChange}
							error={errors.type?.message}
							columns={2}
						/>
					)}
				/>

				<Controller
					name="surface"
					control={control}
					render={({ field }) => (
						<RadioCards
							label="Playing Surface"
							options={surfaceCards}
							value={field.value}
							onChange={field.onChange}
							error={errors.surface?.message}
							columns={3}
						/>
					)}
				/>
			</div>
		</div>
	);
}
