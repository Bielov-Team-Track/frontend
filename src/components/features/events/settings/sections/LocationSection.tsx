"use client";

import { Input } from "@/components/ui";
import { MapPin } from "lucide-react";
import { useEventSettingsContext } from "../EventSettingsContext";
import { SettingsSection } from "./SettingsSection";

export function LocationSection() {
	const { formData, updateNestedField } = useEventSettingsContext();

	return (
		<SettingsSection title="Location" description="Where will your event take place?">
			<Input
				label="Venue Name"
				value={formData.location.name}
				onChange={(e) => updateNestedField("location", "name", e.target.value)}
				placeholder="e.g., Central Sports Hall"
				leftIcon={<MapPin size={16} />}
				required
			/>

			<Input
				label="Address"
				value={formData.location.address}
				onChange={(e) => updateNestedField("location", "address", e.target.value)}
				placeholder="e.g., 123 Main Street, London"
				optional
			/>

			<div className="grid grid-cols-2 gap-4">
				<Input
					label="City"
					value={formData.location.city || ""}
					onChange={(e) => updateNestedField("location", "city", e.target.value)}
					placeholder="e.g., London"
					optional
				/>
				<Input
					label="Postal Code"
					value={formData.location.postalCode || ""}
					onChange={(e) => updateNestedField("location", "postalCode", e.target.value)}
					placeholder="e.g., SW1A 1AA"
					optional
				/>
			</div>

			{formData.location.latitude && formData.location.longitude && (
				<div className="p-4 rounded-xl bg-white/5 border border-white/10">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
							<MapPin size={16} className="text-accent" />
						</div>
						<div>
							<span className="text-xs text-muted uppercase tracking-wider block">
								Coordinates
							</span>
							<span className="text-white text-sm font-mono">
								{formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
							</span>
						</div>
					</div>
				</div>
			)}
		</SettingsSection>
	);
}
