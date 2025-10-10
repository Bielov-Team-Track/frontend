"use client";

import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import React, { useEffect, useMemo } from "react";

function Address({ address }: { address: string }) {
	const map = useMap();
	const geocodingLib = useMapsLibrary("geocoding");
	const geocoder = useMemo(
		() => geocodingLib && new geocodingLib.Geocoder(),
		[geocodingLib],
	);

	useEffect(() => {
		if (!geocoder || !map || !address) return;

		geocoder.geocode({ address }, function (results, status) {
			if (status == "OK") {
				map!.setCenter(results![0].geometry.location);
				new google.maps.Marker({
					map: map,
					position: results![0].geometry.location,
				});
			} else {
				console.error(
					"Geocode was not successful for the following reason: " + status,
				);
			}
		});
	}, [address, geocoder, map]);

	return <></>;
}

export default Address;
