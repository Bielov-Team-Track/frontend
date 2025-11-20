"use client";

import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useMemo } from "react";

function Marker({ location, addressCallback }: MarkerProps) {
	const map = useMap();
	const geocodingLib = useMapsLibrary("geocoding");
	const geocoder = useMemo(
		() => geocodingLib && new geocodingLib.Geocoder(),
		[geocodingLib]
	);

	useEffect(() => {
		if (!geocoder || !map || !location) return;

		map!.setCenter(location);

		geocoder.geocode({ location }, function (results, status) {
			if (status == "OK") {
				new google.maps.Marker({
					map: map,
					position: results![0].geometry.location,
				});
				addressCallback();
			} else {
				console.error(
					"Geocode was not successful for the following reason: " +
						status
				);
			}
		});
	}, [location, geocoder, map, addressCallback]);

	return <></>;
}

type MarkerProps = {
	location: google.maps.LatLng;
	addressCallback: Function;
};

export default Marker;
