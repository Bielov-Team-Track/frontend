import { Input, RadioCards, TextArea } from "@/components";
import { EventType, PlayingSurface } from "@/lib/models/Event";
import { Gamepad2, Trees, Trophy, Warehouse, Waves } from "lucide-react";
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
		value: EventType.Tournament,
		label: "Tournament",
		description: "Competitive matches",
		icon: Trophy,
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
			<div>
				<h2 className="text-xl font-bold text-white mb-1">Event Details</h2>
				<p className="text-muted text-sm">Let&apos;s start with the basic information about your event.</p>
			</div>

			<div className="space-y-6">
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							placeholder="e.g., Sunday Beach Volleyball Tournament"
							error={errors.name?.message}
							helperText="Give your event a catchy and descriptive name"
							required
						/>
					)}
				/>

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
							helperText="Help participants know what to expect"
							optional
						/>
					)}
				/>
			</div>
		</div>
	);
}
