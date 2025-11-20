"use client";

import { UserProfile } from "@/lib/models/User";
import { stringToColor } from "@/lib/utils/color";
import Image from "next/image";
import { useState } from "react";

type AvatarProps = {
	profile: Partial<UserProfile>;
	size?: "small" | "large";
};

const Avatar = ({ profile, size = "small" }: AvatarProps) => {
	const [imageError, setImageError] = useState(false);

	if (!profile) {
		return null;
	}

	const width = size === "small" ? 32 : 256;
	const height = size === "small" ? 32 : 256;
	const fontSize = size === "small" ? 16 : 128;

	const backgroundColor = stringToColor(profile?.email!);

	// Show initials fallback if no imageUrl or if image failed to load
	const shouldShowFallback = !profile.imageUrl || imageError;

	return !shouldShowFallback ? (
		<Image
			alt={profile.name ?? "User Avatar"}
			className="avatar rounded"
			src={profile.imageUrl as string}
			width={width}
			height={height}
			onError={() => setImageError(true)}
		/>
	) : (
		<div
			style={{ backgroundColor, width, height, fontSize }}
			className="rounded-md font-bold flex items-center justify-center text-black">
			{profile.name
				?.split(" ")
				.map((w) => w[0])
				.join("")}
		</div>
	);
};

export default Avatar;
