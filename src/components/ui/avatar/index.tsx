import React from "react";
import Image from "next/image";
import { stringToColor } from "@/lib/utils/color";
import { UserProfile, User } from "@/lib/models/User";

type AvatarProps = {
	profile: Partial<UserProfile>;
	size?: "small" | "large";
};

const Avatar = ({ profile, size = "small" }: AvatarProps) => {
	if (!profile) {
		return null;
	}

	const width = size === "small" ? 32 : 256;
	const height = size === "small" ? 32 : 256;
	const fontSize = size === "small" ? 16 : 128;

	const backgroundColor = stringToColor(profile?.email!);

	return profile.imageUrl ? (
		<Image
			alt={profile?.name!}
			className="avatar rounded"
			src={profile?.imageUrl}
			width={width}
			height={height}
		/>
	) : (
		<div
			style={{ backgroundColor, width, height, fontSize }}
			className="w-8 h-8 rounded-md font-bold flex items-center justify-center text-black"
		>
			{profile.name
				?.split(" ")
				.map((w) => w[0])
				.join("")}
		</div>
	);
};

export default Avatar;
