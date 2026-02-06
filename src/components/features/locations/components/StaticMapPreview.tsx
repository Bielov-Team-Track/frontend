"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

interface StaticMapPreviewProps {
	latitude?: number;
	longitude?: number;
	width?: number;
	height?: number;
	zoom?: number;
	className?: string;
}

export default function StaticMapPreview({
	latitude,
	longitude,
	width = 200,
	height = 120,
	zoom = 14,
	className,
}: StaticMapPreviewProps) {
	const [error, setError] = useState(false);

	if (!latitude || !longitude || error) {
		return (
			<div
				className={`flex items-center justify-center bg-hover rounded-lg ${className ?? ""}`}
				style={{ width, height }}
			>
				<MapPin size={20} className="text-muted" />
			</div>
		);
	}

	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const src = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width * 2}x${height * 2}&scale=1&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={src}
			alt="Location preview"
			width={width}
			height={height}
			className={`rounded-lg object-cover ${className ?? ""}`}
			onError={() => setError(true)}
			loading="lazy"
		/>
	);
}
