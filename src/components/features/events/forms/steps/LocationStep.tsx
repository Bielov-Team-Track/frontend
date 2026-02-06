import { Input, Map, TextArea } from "@/components";
import AddressAutocomplete, { ParsedAddress } from "@/components/ui/address-autocomplete";
import { Venue } from "@/lib/models/Club";
import { cn } from "@/lib/utils";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AlertTriangle, Building2, Edit3, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../context/EventFormContext";
import { useRecentLocations } from "../hooks/useRecentLocations";
import { parseAddressComponents } from "../utils/addressUtils";

export default function LocationStep() {
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
	const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);
	const [isManualEntry, setIsManualEntry] = useState(false);

	const venues: Venue[] = (context as any)?.venues || (context as any)?.club?.venues || [];
	const { data: recentLocations } = useRecentLocations();
	const locationName = watch("location.name");

	// Listen for Google Maps API errors
	useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			const message = event.message || "";
			if (
				message.includes("BillingNotEnabledMapError") ||
				message.includes("Google Maps JavaScript API error") ||
				message.includes("This API project is not authorized")
			) {
				setGoogleMapsError("Google Maps is temporarily unavailable. Please enter the address manually.");
				setIsManualEntry(true);
			}
		};

		window.addEventListener("error", handleError);
		return () => window.removeEventListener("error", handleError);
	}, []);

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
		<div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="location-step">
			<div className="border-b-2 pb-3 sm:pb-4">
				<h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Location</h2>
				<p className="text-muted-foreground text-xs sm:text-sm">Where will your event take place?</p>
			</div>

			<div className="space-y-3 sm:space-y-4">
				{/* Club Venues - Always show if available */}
				{venues.length > 0 && (
					<div className="space-y-2">
						<label className="text-xs sm:text-sm font-medium text-foreground">Club Venues</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{venues.map((venue) => (
								<button
									key={venue.id}
									type="button"
									onClick={() => handleVenueSelect(venue)}
									className={cn(
										"flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border text-left transition-all",
										selectedVenueId === venue.id ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-border/80"
									)}>
									<Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 text-muted-foreground shrink-0" />
									<div className="min-w-0">
										<p className="text-xs sm:text-sm font-medium text-foreground truncate">{venue.name}</p>
										<p className="text-[10px] sm:text-xs text-muted-foreground truncate">{[venue.addressLine1, venue.city].filter(Boolean).join(", ")}</p>
									</div>
								</button>
							))}
						</div>
						<p className="text-[10px] sm:text-xs text-muted-foreground">Or enter a custom address below</p>
					</div>
				)}

				{/* Recent Locations */}
				{recentLocations && recentLocations.length > 0 && (
					<div className="space-y-2">
						<label className="text-xs sm:text-sm font-medium text-foreground">Recent Locations</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{recentLocations.map((loc) => (
								<button
									key={loc.name}
									type="button"
									onClick={() => {
										setSelectedVenueId(null);
										setValue("location.name", loc.name || "");
										setValue("location.address", loc.address || "");
										setValue("location.city", loc.city || "");
										setValue("location.country", loc.country || "");
										setValue("location.postalCode", loc.postalCode || "");
										if (loc.latitude && loc.longitude) {
											setCoordinates({ lat: loc.latitude, lng: loc.longitude });
											setValue("location.latitude", loc.latitude);
											setValue("location.longitude", loc.longitude);
										}
									}}
									className={cn(
										"flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border text-left transition-all",
										locationName === loc.name
											? "border-accent bg-accent/10"
											: "border-border bg-surface hover:border-border/80"
									)}
								>
									<MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 text-muted-foreground shrink-0" />
									<div className="min-w-0">
										<p className="text-xs sm:text-sm font-medium text-foreground truncate">{loc.name}</p>
										{loc.address && (
											<p className="text-[10px] sm:text-xs text-muted-foreground truncate">{loc.address}</p>
										)}
									</div>
								</button>
							))}
						</div>
					</div>
				)}

				{/* Google Maps Error Banner */}
				{googleMapsError && (
					<div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-warning/10 border border-warning/20">
						<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning shrink-0 mt-0.5" />
						<div className="flex-1 min-w-0">
							<p className="text-xs sm:text-sm font-medium text-foreground">{googleMapsError}</p>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
								You can still enter your address details below.
							</p>
						</div>
					</div>
				)}

				{/* Manual Entry Toggle - Only show when Google Maps is working */}
				{!googleMapsError && (
					<button
						type="button"
						onClick={() => setIsManualEntry(!isManualEntry)}
						className="flex items-center gap-2 text-xs sm:text-sm text-accent hover:text-accent/80 transition-colors"
					>
						<Edit3 size={14} />
						<span>{isManualEntry ? "Use address search" : "Enter address manually"}</span>
					</button>
				)}

				{/* Google Maps Address Autocomplete - Show when not in manual entry mode */}
				{!isManualEntry && (
					<>
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
							<div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
								<MapPin size={12} className="sm:hidden" />
								<MapPin size={14} className="hidden sm:block" />
								<span>Click on the map to fine-tune the exact location</span>
							</div>
							<div className="rounded-lg sm:rounded-xl overflow-hidden border border-border">
								<Map
									readonly={false}
									defaultAddress={locationAddress}
									onAddressSelected={handleAddressSelected}
									onPositionChanged={handleMapPositionChanged}
								/>
							</div>
						</div>
					</>
				)}

				{/* Manual Entry Fields - Show in manual mode */}
				{isManualEntry && (
					<div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-xl bg-surface border border-border">
						<Controller
							name="location.name"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									label="Venue Name"
									placeholder="e.g., Sports Center, Beach Court 1"
									error={errors.location?.name?.message}
									required
									data-testid="location-name-input"
								/>
							)}
						/>

						<Controller
							name="location.address"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									label="Street Address"
									placeholder="e.g., 12 Taylors Court"
									error={errors.location?.address?.message}
									required
									leftIcon={<MapPin size={16} />}
									data-testid="location-address-manual-input"
								/>
							)}
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							<Controller
								name="location.city"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										label="City"
										placeholder="e.g., London"
										error={errors.location?.city?.message}
									/>
								)}
							/>

							<Controller
								name="location.postalCode"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										label="Postal Code"
										placeholder="e.g., SW1A 1AA"
										error={errors.location?.postalCode?.message}
									/>
								)}
							/>
						</div>

						<Controller
							name="location.country"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									label="Country"
									placeholder="e.g., United Kingdom"
									error={errors.location?.country?.message}
								/>
							)}
						/>
					</div>
				)}

				<Controller
					name="location.instructions"
					control={control}
					render={({ field }) => (
						<TextArea
							{...field}
							label="Instructions"
							placeholder="Parking information, entrance location, etc."
							maxLength={300}
							helperText="Help participants find the venue"
							minRows={3}
							optional
							data-testid="location-instructions-input"
						/>
					)}
				/>
			</div>
		</div>
	);
}
