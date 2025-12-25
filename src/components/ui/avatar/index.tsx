"use client";

import { cn } from "@/lib/utils";
import { UserProfile } from "@/lib/models/User";
import { stringToColor } from "@/lib/utils/color";
import Image from "next/image";
import { useState } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

type AvatarProps = {
	profile: Partial<UserProfile>;
	size?: AvatarSize;
	online?: boolean;
	offline?: boolean;
	mask?: "squircle" | "hexagon" | "triangle" | "circle";
};

const Avatar = ({ profile, size = "md", online, offline, mask }: AvatarProps) => {
	const [imageError, setImageError] = useState(false);

	if (!profile) {
		return null;
	}

	// DaisyUI avatar size classes
	const sizeClasses = {
		xs: "w-8",
		sm: "w-12",
		md: "w-16",
		lg: "w-24",
		xl: "w-32",
	};

	// Font size for initials based on avatar size
	const fontSizeClasses = {
		xs: "text-xs",
		sm: "text-sm",
		md: "text-xl",
		lg: "text-3xl",
		xl: "text-5xl",
	};

	// Mask classes
	const maskClass = mask ? `mask mask-${mask}` : "rounded";

	const backgroundColor = stringToColor(profile?.email!);

	// Show initials fallback if no imageUrl or if image failed to load
	const shouldShowFallback = !profile.imageUrl || imageError;

	const initials = profile.name
		?.split(" ")
		.map((w) => w[0])
		.join("");

	return (
		<div
			className={cn(
				"avatar",
				online && "avatar-online",
				offline && "avatar-offline",
				shouldShowFallback && "avatar-placeholder"
			)}
		>
			<div className={cn(sizeClasses[size], maskClass)}>
				{!shouldShowFallback ? (
					<Image
						alt={profile.name ?? "User Avatar"}
						src={profile.imageUrl as string}
						fill
						className="object-cover"
						onError={() => setImageError(true)}
					/>
				) : (
					<div
						style={{ backgroundColor }}
						className={cn("w-full h-full flex items-center justify-center text-neutral-content font-bold", fontSizeClasses[size])}
					>
						{initials}
					</div>
				)}
			</div>
		</div>
	);
};

export default Avatar;
