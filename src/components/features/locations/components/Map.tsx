'use client'

import { APIProvider, AdvancedMarker, Map as GoogleMap, MapMouseEvent, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Map(props: MapProps) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <MapComponent {...props} />
    </APIProvider>
  );
}

function MapComponent({ defaultAddress, onAddressSelected, onLocationCalculated, onPositionChanged, onError }: MapProps) {
  const [position, setPosition] = useState<google.maps.LatLngLiteral>();
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ lat: 54.9783, lng: -1.6178 });
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoder = useMemo(
    () => geocodingLib && new geocodingLib.Geocoder(),
    [geocodingLib],
  );

  useEffect(() => {
    if (!defaultAddress) {
      return
    }
    geocoder?.geocode({ address: defaultAddress }, function (results, status) {
      if (status == 'OK') {
        const loc = results![0].geometry.location
        const position = { lat: loc.lat(), lng: loc.lng() }
        setPosition(position)
        setCenter(position)
        onPositionChanged && onPositionChanged(position)
      } else {
        onError && onError("Address is not found");
        setPosition(undefined)
      }
    })
  }, [geocoder, defaultAddress])

  const handleClick = useCallback(async (clickEvent: MapMouseEvent) => {
    setPosition(clickEvent.detail.latLng!);
    const addressResponse = await geocoder?.geocode({ location: clickEvent.detail.latLng });
    const address = addressResponse?.results[0];
    onAddressSelected && onAddressSelected(address?.formatted_address);
    onLocationCalculated && onLocationCalculated(clickEvent.detail.latLng)
  }, [geocoder]);

  return (
    <div className="w-full h-56">
      <GoogleMap mapId={'31199ddcdd9ac2de'} defaultZoom={12} onCameraChanged={(e) => setCenter(e.detail.center)} center={center} onClick={handleClick}>
        {position && <AdvancedMarker position={position} />}
      </GoogleMap>
    </div>
  );
}

type MapProps = {
  defaultAddress?: string,
  onAddressSelected?: Function
  onLocationCalculated?: Function
  onPositionChanged?: Function
  onError?: Function
}

