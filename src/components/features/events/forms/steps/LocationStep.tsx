import { useState } from "react";
import { Controller } from "react-hook-form";
import { MapPin } from "lucide-react";
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
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-white mb-1">Location</h2>
				<p className="text-muted text-sm">Where will your event take place?</p>
			</div>

			<div className="space-y-4">
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
							defaultAddress={values.location?.address}
							onAddressSelected={handleAddressSelected}
							onPositionChanged={handleMapPositionChanged}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
