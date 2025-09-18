"use client";

import {
  APIProvider,
  AdvancedMarker,
  Map as GoogleMap,
  MapMouseEvent,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Map(props: MapProps) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <MapComponent {...props} />
    </APIProvider>
  );
}

function MapComponent({
  defaultAddress,
  onAddressSelected,
  onLocationCalculated,
  onPositionChanged,
  onError,
  readonly = false,
}: MapProps) {
  const [position, setPosition] = useState<google.maps.LatLngLiteral>();
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 54.9783,
    lng: -1.6178,
  });
  const geocodingLib = useMapsLibrary("geocoding");
  const geocoder = useMemo(
    () => geocodingLib && new geocodingLib.Geocoder(),
    [geocodingLib]
  );

  useEffect(() => {
    if (!defaultAddress) {
      return;
    }
    geocoder?.geocode({ address: defaultAddress }, function (results, status) {
      if (status == "OK") {
        const loc = results![0].geometry.location;
        const position = { lat: loc.lat(), lng: loc.lng() };
        setPosition(position);
        setCenter(position);
        onPositionChanged && onPositionChanged(loc.lat(), loc.lng());
      } else {
        onError && onError("Address is not found");
        setPosition(undefined);
      }
    });
  }, [geocoder, defaultAddress]);

  const handleClick = useCallback(
    async (clickEvent: MapMouseEvent) => {
      if (readonly) return; // Disable clicks in readonly mode

      setPosition(clickEvent.detail.latLng!);
      const addressResponse = await geocoder?.geocode({
        location: clickEvent.detail.latLng,
      });
      const address = addressResponse?.results[0];
      onAddressSelected &&
        address &&
        onAddressSelected(address.formatted_address);
      onLocationCalculated && onLocationCalculated(clickEvent.detail.latLng?.lat!, clickEvent.detail.latLng?.lng!);
    },
    [geocoder, readonly]
  );

  const handleCenterOnMarker = () => {
    if (position) {
      setCenter(position);
    }
  };

  return (
    <div className="w-full h-56 resize-y overflow-hidden border border-base-300 rounded-lg min-h-32 max-h-96 relative">
      <GoogleMap
        mapId={"31199ddcdd9ac2de"}
        defaultZoom={12}
        onCameraChanged={(e) => setCenter(e.detail.center)}
        center={center}
        onClick={handleClick}
        gestureHandling="auto"
        disableDefaultUI={readonly}
      >
        {position && <AdvancedMarker position={position} />}
      </GoogleMap>

      {/* Center on Marker Button - Only show in readonly mode when marker exists */}
      {readonly && position && (
        <button
          onClick={handleCenterOnMarker}
          className="absolute top-2 right-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 flex items-center gap-1.5 z-10"
          type="button"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Center on Location
        </button>
      )}
    </div>
  );
}

type MapProps = {
  defaultAddress?: string;
  onAddressSelected?: (address: string) => void;
  onLocationCalculated?: (lat: number, lng: number) => void;
  onPositionChanged?: (lat: number, lng: number) => void;
  onError?: Function;
  readonly?: boolean;
};
