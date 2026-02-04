"use client";

import { Loader } from "@/components/ui";
import { ParsedAddress, parseGeocoderResult } from "@/lib/utils/address";
import { APIProvider, AdvancedMarker, Map as GoogleMap, MapMouseEvent, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Map(props: MapProps) {
	return (
		<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
			<MapComponent {...props} />
		</APIProvider>
	);
}

const DEFAULT_CENTER = {
	lat: 54.9783,
	lng: -1.6178,
};

function MapComponent({ defaultAddress, onAddressSelected, onLocationCalculated, onPositionChanged, onError, readonly = false }: MapProps) {
	const map = useMap();
	const [isLoading, setIsLoading] = useState(true);
	const [position, setPosition] = useState<google.maps.LatLngLiteral>();

	const geocodingLib = useMapsLibrary("geocoding");
	const geocoder = useMemo(() => geocodingLib && new geocodingLib.Geocoder(), [geocodingLib]);

	// Use refs for callbacks to prevent useEffect from firing on every render
	// and to keep handleClick stable
	const onPositionChangedRef = useRef(onPositionChanged);
	const onErrorRef = useRef(onError);
	const onAddressSelectedRef = useRef(onAddressSelected);
	const onLocationCalculatedRef = useRef(onLocationCalculated);
	useEffect(() => {
		onPositionChangedRef.current = onPositionChanged;
		onErrorRef.current = onError;
		onAddressSelectedRef.current = onAddressSelected;
		onLocationCalculatedRef.current = onLocationCalculated;
	});

	useEffect(() => {
		if (!defaultAddress || !geocoder || !map) {
			return;
		}
		geocoder.geocode({ address: defaultAddress }, function (results, status) {
			if (status == "OK") {
				const loc = results![0].geometry.location;
				const newPosition = { lat: loc.lat(), lng: loc.lng() };
				setPosition(newPosition);
				map.setCenter(newPosition);
				onPositionChangedRef.current?.(loc.lat(), loc.lng());
			} else {
				onErrorRef.current?.("Address is not found");
				setPosition(undefined);
			}
		});
	}, [geocoder, map, defaultAddress]);

	const handleClick = useCallback(
		async (clickEvent: MapMouseEvent) => {
			if (readonly) return;

			const latLng = clickEvent.detail.latLng;
			if (!latLng) return;

			setPosition(latLng);
			const addressResponse = await geocoder?.geocode({
				location: latLng,
			});
			const result = addressResponse?.results[0];
			if (result) {
				const parsedAddress = parseGeocoderResult(result);
				onAddressSelectedRef.current?.(parsedAddress);
			}
			onLocationCalculatedRef.current?.(latLng.lat, latLng.lng);
		},
		[geocoder, readonly]
	);

	const handleCenterOnMarker = () => {
		if (position && map) {
			map.setCenter(position);
		}
	};

	return (
		<div className="w-full h-56 resize-y overflow-hidden border border-border rounded-lg min-h-32 max-h-96 relative">
			{isLoading && <Loader className="bg-overlay-light absolute inset-0 rounded-md" />}
			<GoogleMap
				mapId={"31199ddcdd9ac2de"}
				defaultZoom={12}
				defaultCenter={DEFAULT_CENTER}
				onClick={handleClick}
				gestureHandling={readonly ? "cooperative" : "greedy"}
				disableDefaultUI={readonly}
				onTilesLoaded={() => setIsLoading(false)}>
				{position && <AdvancedMarker position={position} />}
			</GoogleMap>

			{/* Center on Marker Button - Only show in readonly mode when marker exists */}
			{readonly && position && (
				<button
					onClick={handleCenterOnMarker}
					className="absolute top-2 right-2 bg-white hover:bg-gray-50 border border-border rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-xs transition-colors duration-200 flex items-center gap-1.5 z-10"
					type="button">
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					Center on Location
				</button>
			)}
		</div>
	);
}

type MapProps = {
	defaultAddress?: string;
	/** Called when user clicks on the map and address is reverse-geocoded */
	onAddressSelected?: (address: ParsedAddress) => void;
	onLocationCalculated?: (lat: number, lng: number) => void;
	onPositionChanged?: (lat: number, lng: number) => void;
	onError?: (error: string) => void;
	readonly?: boolean;
};
