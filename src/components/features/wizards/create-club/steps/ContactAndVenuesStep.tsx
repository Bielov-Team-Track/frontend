"use client";

import { Input } from "@/components/ui";
import { VenueForm, VenueFormData, VenueList } from "@/components/features/venues";
import { WizardStepProps } from "../../core/types";
import { ClubFormData } from "../types";

export function ContactAndVenuesStep({ form }: WizardStepProps<ClubFormData>) {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = form;

	const venues = watch("venues") || [];

	const handleAddVenue = (venue: VenueFormData) => {
		setValue("venues", [...venues, venue]);
	};

	const handleRemoveVenue = (tempId: string) => {
		setValue(
			"venues",
			venues.filter((v) => v.tempId !== tempId)
		);
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			{/* Contact Details Section */}
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Contact Details</h2>
				<p className="text-muted-foreground text-sm">How can members reach you?</p>
			</div>

			<div className="space-y-4">
				<Input
					label="Contact Email"
					type="email"
					placeholder="contact@club.com"
					error={errors.contactEmail?.message}
					optional
					{...register("contactEmail")}
				/>

				<Input
					label="Contact Phone"
					type="tel"
					placeholder="+1 (555) 000-0000"
					error={errors.contactPhone?.message}
					optional
					{...register("contactPhone")}
				/>
			</div>

			{/* Venues Section */}
			<div className="pt-6 border-t border-border">
				<div className="mb-4">
					<h2 className="text-xl font-bold text-foreground mb-1">Club Venues</h2>
					<p className="text-muted-foreground text-sm">Add locations where your club hosts activities (optional)</p>
				</div>

				<VenueList venues={venues} onRemove={handleRemoveVenue} className="mb-6" />

				<div className="p-4 rounded-lg border border-dashed border-border bg-muted/30">
					<VenueForm onAddVenue={handleAddVenue} buttonVariant="outline" />
				</div>
			</div>
		</div>
	);
}
