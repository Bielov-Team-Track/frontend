"use client";

import { Checkbox, Input, RadioCards, TextArea } from "@/components/ui";
import { EventType, EventTypeOptions, PlayingSurface } from "@/lib/models/Event";
import { Trees, Warehouse, Waves } from "lucide-react";
import { useEventSettingsContext } from "../EventSettingsContext";
import { SettingsSection } from "./SettingsSection";

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

// Get display label for event type
const getEventTypeLabel = (type: string) => {
	const option = EventTypeOptions.find((o) => o.value === type);
	return option?.label || type;
};

export function GeneralSection() {
	const { formData, updateField } = useEventSettingsContext();

	return (
		<SettingsSection title="General" description="Basic event information">
			<Input
				label="Event Name"
				value={formData.name}
				onChange={(e) => updateField("name", e.target.value)}
				placeholder="e.g., Sunday Beach Volleyball"
				required
			/>

			<TextArea
				label="Description"
				value={formData.description}
				onChange={(e) => updateField("description", e.target.value)}
				placeholder="Describe your event, rules, what to bring, etc..."
				maxLength={500}
				showCharCount
				minRows={3}
				optional
			/>

			{/* Event type is read-only since changing it affects registration structure */}
			<div>
				<label className="text-sm font-medium text-white block mb-2">Event Type</label>
				<div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
					<span className="text-white">{getEventTypeLabel(formData.type)}</span>
					<p className="text-xs text-muted mt-1">
						Event type cannot be changed after creation as it affects the registration structure.
					</p>
				</div>
			</div>

			<RadioCards
				label="Playing Surface"
				options={surfaceCards}
				value={formData.surface as PlayingSurface}
				onChange={(value) => updateField("surface", value)}
				columns={3}
				size="sm"
			/>

			<div className="p-4 rounded-xl bg-white/5 border border-white/10">
				<Checkbox
					checked={!formData.isPrivate}
					onChange={(checked) => updateField("isPrivate", !checked)}
					label="Public Event"
					helperText="Public events are visible to non-members and can be found via search."
				/>
			</div>
		</SettingsSection>
	);
}
