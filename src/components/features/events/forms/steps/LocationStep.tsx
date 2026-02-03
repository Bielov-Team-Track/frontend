import { Map } from "@/components";
import AddressAutocomplete, { ParsedAddress } from "@/components/ui/address-autocomplete";
import { Venue } from "@/lib/models/Club";
import { cn } from "@/lib/utils";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Building2, MapPin } from "lucide-react";
import { useCallback, useState } from "react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../context/EventFormContext";
import { parseAddressComponents } from "../utils/addressUtils";

export function LocationStep() {
	const { form, context } = useEventFormContext();
	const {
		control,
		formState: { errors },
		watch,
		setValue,
	} = form;
	// Watch only the specific field needed for the map, not all form fields
	const locationAddress = watch("location.address");

	const [coordinates, setCoordinates] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

	const venues: Venue[] = (context as any)?.venues || (context as any)?.club?.venues || [];

	const handleVenueSelect = useCallback(
		(venue: Venue) => {
			setSelectedVenueId(venue.id);

			const address = [venue.name, venue.addressLine1, venue.city, venue.country].filter(Boolean).join(", ");

			setValue("location.name", venue.name);
			setValue("location.address", address);
			setValue("location.city", venue.city || "");
			setValue("location.country", venue.country || "");
			setValue("location.postalCode", venue.postalCode || "");

			if (venue.latitude && venue.longitude) {
				setCoordinates({ lat: venue.latitude, lng: venue.longitude });
				setValue("location.latitude", venue.latitude);
				setValue("location.longitude", venue.longitude);
			}
		},
		[setValue]
	);

	const handleAddressSelected = useCallback(
		(address: ParsedAddress) => {
			setSelectedVenueId(null);
			setValue("location.name", address.addressName || "");
			setValue("location.address", [address.addressName, address.formattedAddress].filter(Boolean).join(", "));
			setValue("location.city", address.city || "");
			setValue("location.country", address.country || "");
			setValue("location.postalCode", address.postalCode || "");

			// Also update coordinates if available (from map click)
			if (address.latitude && address.longitude) {
				setCoordinates({ lat: address.latitude, lng: address.longitude });
				setValue("location.latitude", address.latitude);
				setValue("location.longitude", address.longitude);
			}
		},
		[setValue]
	);

	const handleMapPositionChanged = useCallback(
		(lat: number, lng: number) => {
			setCoordinates({ lat, lng });
			setValue("location.latitude", lat);
			setValue("location.longitude", lng);
		},
		[setValue]
	);

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="location-step">
			<div className="border-b-2 pb-4">
				<h2 className="text-xl font-bold text-white mb-1">Location</h2>
				<p className="text-muted text-sm">Where will your event take place?</p>
			</div>

			<div className="space-y-4">
				{venues.length > 0 && (
					<div className="space-y-2">
						<label className="text-sm font-medium text-white">Club Venues</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{venues.map((venue) => (
								<button
									key={venue.id}
									type="button"
									onClick={() => handleVenueSelect(venue)}
									className={cn(
										"flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
										selectedVenueId === venue.id ? "border-accent bg-accent/10" : "border-white/10 bg-white/5 hover:border-white/20"
									)}>
									<Building2 className="w-4 h-4 mt-0.5 text-muted shrink-0" />
									<div className="min-w-0">
										<p className="text-sm font-medium text-white truncate">{venue.name}</p>
										<p className="text-xs text-muted truncate">{[venue.addressLine1, venue.city].filter(Boolean).join(", ")}</p>
									</div>
								</button>
							))}
						</div>
						<p className="text-xs text-muted">Or enter a custom address below</p>
					</div>
				)}

				<Controller
					name="location"
					control={control}
					render={({ field }) => (
						<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
							<AddressAutocomplete
								value={field.value?.address || ""}
								onAddressSelected={(address) => {
									handleAddressSelected(address);
								}}
								onPlaceSelected={(place) => {
									setSelectedVenueId(null);
									const locationData = parseAddressComponents(place);

									Object.entries(locationData).forEach(([key, value]) => {
										if (value !== undefined) {
											setValue(`location.${key}` as any, value);
										}
									});

									if (place.geometry?.location) {
										const lat = place.geometry.location.lat();
										const lng = place.geometry.location.lng();
										handleMapPositionChanged(lat, lng);
									}
								}}
								label="Address"
								placeholder="e.g., 12 Taylors Court, London"
								error={errors.location?.address?.message}
								required
								data-testid="location-address-input"
							/>
						</APIProvider>
					)}
				/>

				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm text-muted">
						<MapPin size={14} />
						<span>Click on the map to fine-tune the exact location</span>
					</div>
					<div className="rounded-xl overflow-hidden border border-white/10">
						<Map
							readonly={false}
							defaultAddress={locationAddress}
							onAddressSelected={handleAddressSelected}
							onPositionChanged={handleMapPositionChanged}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
