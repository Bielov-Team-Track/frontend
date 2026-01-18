"use client";

import { Map } from "@/components";
import { Button, Input } from "@/components/ui";
import AddressAutocomplete, { ParsedAddress } from "@/components/ui/address-autocomplete";
import { APIProvider } from "@vis.gl/react-google-maps";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { WizardStepProps } from "../../core/types";
import { ClubFormData, VenueFormData } from "../types";

export function ContactAndVenuesStep({ form }: WizardStepProps<ClubFormData>) {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = form;

	const venues = watch("venues") || [];

	// Local state for the venue being added
	const [newVenue, setNewVenue] = useState<Partial<VenueFormData>>({
		name: "",
		addressLine1: "",
	});

	const handleAddressSelected = useCallback((address: ParsedAddress) => {
		setNewVenue((prev) => ({
			...prev,
			name: prev.name || address.addressName || "",
			addressLine1: [address.addressName, address.formattedAddress].filter(Boolean).join(", "),
			city: address.city,
			country: address.country,
			postalCode: address.postalCode,
			latitude: address.latitude,
			longitude: address.longitude,
		}));
	}, []);

	const handleMapPositionChanged = useCallback((lat: number, lng: number) => {
		setNewVenue((prev) => ({
			...prev,
			latitude: lat,
			longitude: lng,
		}));
	}, []);

	const handleAddVenue = () => {
		if (!newVenue.name || !newVenue.addressLine1) return;

		const venueToAdd: VenueFormData = {
			tempId: crypto.randomUUID(),
			name: newVenue.name,
			addressLine1: newVenue.addressLine1,
			addressLine2: newVenue.addressLine2,
			city: newVenue.city,
			country: newVenue.country,
			region: newVenue.region,
			postalCode: newVenue.postalCode,
			latitude: newVenue.latitude,
			longitude: newVenue.longitude,
			howToGetThereInstructions: newVenue.howToGetThereInstructions,
		};

		setValue("venues", [...venues, venueToAdd]);

		// Reset form
		setNewVenue({
			name: "",
			addressLine1: "",
		});
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

				{/* List of Added Venues */}
				{venues.length > 0 && (
					<div className="space-y-2 mb-6">
						{venues.map((venue) => (
							<div
								key={venue.tempId}
								className="flex items-start justify-between p-4 rounded-lg border border-border bg-card">
								<div className="flex items-start gap-3">
									<MapPin size={18} className="text-muted-foreground mt-0.5 shrink-0" />
									<div>
										<div className="font-medium text-foreground">{venue.name}</div>
										<div className="text-sm text-muted-foreground">{venue.addressLine1}</div>
										{venue.city && (
											<div className="text-sm text-muted-foreground">
												{venue.city}
												{venue.country && `, ${venue.country}`}
											</div>
										)}
									</div>
								</div>
								<button
									type="button"
									onClick={() => handleRemoveVenue(venue.tempId!)}
									className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
									<Trash2 size={16} />
								</button>
							</div>
						))}
					</div>
				)}

				{/* Add New Venue Form */}
				<div className="space-y-4 p-4 rounded-lg border border-dashed border-border bg-muted/30">
					<div className="text-sm font-medium text-foreground">Add a venue</div>

					<Input
						label="Venue Name"
						placeholder="e.g., Main Training Hall"
						value={newVenue.name || ""}
						onChange={(e) => setNewVenue((prev) => ({ ...prev, name: e.target.value }))}
					/>

					<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
						<AddressAutocomplete
							value={newVenue.addressLine1 || ""}
							onAddressSelected={handleAddressSelected}
							label="Address"
							placeholder="e.g., 123 Sports Center Drive"
						/>
					</APIProvider>

					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<MapPin size={14} />
							<span>Click on the map to fine-tune location</span>
						</div>
						<div className="rounded-xl overflow-hidden border border-border h-48">
							<Map
								readonly={false}
								defaultAddress={newVenue.addressLine1}
								onAddressSelected={handleAddressSelected}
								onPositionChanged={handleMapPositionChanged}
							/>
						</div>
					</div>

					<Button
						type="button"
						variant="outline"
						onClick={handleAddVenue}
						disabled={!newVenue.name || !newVenue.addressLine1}
						leftIcon={<Plus size={16} />}
						className="w-full">
						Add Venue
					</Button>
				</div>
			</div>
		</div>
	);
}
