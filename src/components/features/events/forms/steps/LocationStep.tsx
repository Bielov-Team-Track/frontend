import { useState } from "react";
import { Controller } from "react-hook-form";
import { FaMapMarkerAlt } from "react-icons/fa";
import { APIProvider } from "@vis.gl/react-google-maps";
import AddressAutocomplete from "@/components/ui/address-autocomplete";
import { Map } from "@/components";
import { useEventFormContext } from "../context/EventFormContext";
import { parseAddressComponents } from "../utils/addressUtils";

export function LocationStep() {
	const { form } = useEventFormContext();
	const {
		control,
		formState: { errors },
		watch,
		setValue,
	} = form;
	const values = watch();

	const [coordinates, setCoordinates] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	const handleAddressSelected = (address: string) => {
		setValue("location.name", address.split(",")[0]);
		setValue("location.address", address);
	};

	const handleMapPositionChanged = (lat: number, lng: number) => {
		setCoordinates({ lat, lng });
		setValue("location.latitude", lat);
		setValue("location.longitude", lng);
	};

	return (
		<div className="space-y-6">
			<div className="text-center mb-8">
				<span className="w-12 h-12 text-[48px] mx-auto mb-3">🗺️</span>
				<h2 className="text-xl font-semibold  mb-2">Location</h2>
				<p className="/60">Where will your event take place?</p>
			</div>

			<div className="grid gap-6">
				<Controller
					name="location"
					control={control}
					render={({ field }) => (
						<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
							<AddressAutocomplete
								value={field.value?.address || ""}
								onChange={(address) => {
									handleAddressSelected(address);
								}}
								onPlaceSelected={(place) => {
									const locationData = parseAddressComponents(place);

									// Set all location fields from parsed data
									Object.entries(locationData).forEach(([key, value]) => {
										if (value !== undefined) {
											setValue(`location.${key}` as any, value);
										}
									});

									// Update map position if place has geometry
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
							/>
						</APIProvider>
					)}
				/>
			</div>

			<div>
				<span className="text-sm text-primary-content/60">
					You can select the exact location by clicking on the map
				</span>
				<Map
					defaultAddress={values.location?.address}
					onAddressSelected={handleAddressSelected}
					onPositionChanged={handleMapPositionChanged}
				/>
			</div>
		</div>
	);
}
