"use client";

import { Map } from "@/components";
import AddressAutocomplete, { ParsedAddress } from "@/components/ui/address-autocomplete";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Building2, MapPin } from "lucide-react";
import { useCallback } from "react";
import { Controller } from "react-hook-form";
import { WizardStepProps } from "../../core/types";
import { EventFormData } from "../types";

// TODO: Fetch venues from club API when implemented
interface Venue {
	id: string;
	name: string;
	address: string;
	latitude?: number;
	longitude?: number;
}

export function LocationStep({ form, context }: WizardStepProps<EventFormData>) {
	const {
		control,
		watch,
		setValue,
		formState: { errors },
	} = form;
	const clubId = watch("clubId") || context.clubId;
	const locationSource = watch("locationSource");
	// Watch only the specific field needed for the map
	const locationAddress = watch("location.address");

	// TODO: Replace with actual venue query
	const venues: Venue[] = [];

	const handleAddressSelected = useCallback(
		(address: ParsedAddress) => {
			setValue("location.name", address.addressName || "");
			setValue("location.address", [address.addressName, address.formattedAddress].filter(Boolean).join(", "));
			setValue("location.city", address.city || "");
			setValue("location.country", address.country || "");
			setValue("location.postalCode", address.postalCode || "");

			// Also update coordinates if available (from map click)
			if (address.latitude && address.longitude) {
				setValue("location.latitude", address.latitude);
				setValue("location.longitude", address.longitude);
			}
		},
		[setValue]
	);

	const handleVenueSelected = useCallback(
		(venue: Venue) => {
			setValue("venueId", venue.id);
			setValue("location.name", venue.name);
			setValue("location.address", venue.address);
			if (venue.latitude) setValue("location.latitude", venue.latitude);
			if (venue.longitude) setValue("location.longitude", venue.longitude);
		},
		[setValue]
	);

	const handleMapPositionChanged = useCallback(
		(lat: number, lng: number) => {
			setValue("location.latitude", lat);
			setValue("location.longitude", lng);
		},
		[setValue]
	);

	// If no club selected, show only custom location
	if (!clubId) {
		return (
			<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
				<div>
					<h2 className="text-xl font-bold text-foreground mb-1">Location</h2>
					<p className="text-muted-foreground text-sm">Where will your event take place?</p>
				</div>

				<CustomLocationForm
					control={control}
					errors={errors}
					locationAddress={locationAddress}
					onAddressSelected={handleAddressSelected}
					onMapPositionChanged={handleMapPositionChanged}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Location</h2>
				<p className="text-muted-foreground text-sm">Where will your event take place?</p>
			</div>

			<Controller
				name="locationSource"
				control={control}
				render={({ field }) => (
					<Tabs value={field.value} onValueChange={field.onChange} className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="club" className="flex items-center gap-2">
								<Building2 size={14} />
								Club Venues
							</TabsTrigger>
							<TabsTrigger value="custom" className="flex items-center gap-2">
								<MapPin size={14} />
								Custom Location
							</TabsTrigger>
						</TabsList>

						<TabsContent value="club" className="mt-4">
							{venues.length > 0 ? (
								<div className="space-y-2">
									{venues.map((venue) => (
										<button
											key={venue.id}
											type="button"
											onClick={() => handleVenueSelected(venue)}
											className="w-full p-4 text-left rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors">
											<div className="font-medium">{venue.name}</div>
											<div className="text-sm text-muted-foreground">{venue.address}</div>
										</button>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<Building2 size={32} className="mx-auto mb-2 opacity-50" />
									<p>No saved venues for this club.</p>
									<p className="text-sm">Switch to Custom Location tab.</p>
								</div>
							)}
						</TabsContent>

						<TabsContent value="custom" className="mt-4">
							<CustomLocationForm
								control={control}
								errors={errors}
								locationAddress={locationAddress}
								onAddressSelected={handleAddressSelected}
								onMapPositionChanged={handleMapPositionChanged}
							/>
						</TabsContent>
					</Tabs>
				)}
			/>
		</div>
	);
}

// Extracted custom location form
function CustomLocationForm({
	control,
	errors,
	locationAddress,
	onAddressSelected,
	onMapPositionChanged,
}: {
	control: any;
	errors: any;
	locationAddress: string | undefined;
	onAddressSelected: (address: ParsedAddress) => void;
	onMapPositionChanged: (lat: number, lng: number) => void;
}) {
	return (
		<div className="space-y-4">
			<Controller
				name="location"
				control={control}
				render={({ field }) => (
					<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
						<AddressAutocomplete
							value={field.value?.address || ""}
							onAddressSelected={onAddressSelected}
							label="Address"
							placeholder="e.g., 12 Taylors Court, London"
							error={errors.location?.address?.message}
							required
						/>
					</APIProvider>
				)}
			/>

			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<MapPin size={14} />
					<span>Click on the map to fine-tune location</span>
				</div>
				<div className="rounded-xl overflow-hidden border border-border h-50">
					<Map
						readonly={false}
						defaultAddress={locationAddress}
						onAddressSelected={onAddressSelected}
						onPositionChanged={onMapPositionChanged}
					/>
				</div>
			</div>
		</div>
	);
}
