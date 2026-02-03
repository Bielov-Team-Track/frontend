"use client";

import { Input, RadioCards } from "@/components/ui";
import { Calendar, Lock, Unlock, Users } from "lucide-react";
import { useEventSettingsContext } from "../EventSettingsContext";
import { SettingsSection } from "./SettingsSection";

const registrationTypeCards = [
	{
		value: "open" as const,
		label: "Open Registration",
		description: "Anyone can join this event",
		icon: Unlock,
	},
	{
		value: "closed" as const,
		label: "Invite Only",
		description: "Only invited users can join",
		icon: Lock,
	},
];

export function RegistrationSection() {
	const { formData, updateField } = useEventSettingsContext();

	// Format date for datetime-local input
	const formatForInput = (date: Date | undefined) => {
		if (!date) return "";
		const d = new Date(date);
		return d.toISOString().slice(0, 16);
	};

	return (
		<SettingsSection title="Registration" description="Configure how participants can join">
			<RadioCards
				label="Registration Type"
				options={registrationTypeCards}
				value={formData.registrationType}
				onChange={(value) => updateField("registrationType", value)}
				columns={2}
				size="sm"
			/>

			<Input
				type="number"
				label="Maximum Participants"
				value={formData.capacity?.toString() || ""}
				onChange={(e) =>
					updateField("capacity", e.target.value ? parseInt(e.target.value) : undefined)
				}
				placeholder="Leave empty for unlimited"
				leftIcon={<Users size={16} />}
				min={1}
				optional
				helperText="Set a limit on how many people can join"
			/>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					type="datetime-local"
					label="Registration Opens"
					value={formatForInput(formData.registrationOpenTime)}
					onChange={(e) =>
						updateField(
							"registrationOpenTime",
							e.target.value ? new Date(e.target.value) : undefined
						)
					}
					leftIcon={<Calendar size={16} />}
					optional
					helperText="When users can start joining"
				/>

				<Input
					type="datetime-local"
					label="Registration Deadline"
					value={formatForInput(formData.registrationDeadline)}
					onChange={(e) =>
						updateField(
							"registrationDeadline",
							e.target.value ? new Date(e.target.value) : undefined
						)
					}
					leftIcon={<Calendar size={16} />}
					optional
					helperText="Last chance to join"
				/>
			</div>
		</SettingsSection>
	);
}
