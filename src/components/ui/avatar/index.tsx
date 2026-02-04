"use client";

import { AvatarFallback, AvatarImage, Avatar as AvatarRoot } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { stringToColor } from "@/lib/utils/color";
import { ImageOff, Shield, User, Users, UsersRound } from "lucide-react";
import * as React from "react";

type AvatarVariant = "user" | "club" | "team" | "group";
type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type AvatarProps = {
	src?: string | null;
	alt?: string;
	name?: string;
	icon?: React.ReactNode;
	variant?: AvatarVariant;
	size?: AvatarSize;
	color?: string;
	className?: string;
};

const VARIANT_ICONS: Record<AvatarVariant, React.ElementType> = {
	user: User,
	club: Shield,
	team: Users,
	group: UsersRound,
};

const SIZE_CLASSES: Record<AvatarSize, string> = {
	xs: "size-8",
	sm: "size-10",
	md: "size-12",
	lg: "size-16",
	xl: "size-24",
	"2xl": "size-40",
};

const FONT_CLASSES: Record<AvatarSize, string> = {
	xs: "text-xs",
	sm: "text-sm",
	md: "text-base",
	lg: "text-lg",
	xl: "text-2xl",
	"2xl": "text-3xl",
};

const ICON_CLASSES: Record<AvatarSize, string> = {
	xs: "size-3",
	sm: "size-4",
	md: "size-5",
	lg: "size-6",
	xl: "size-8",
	"2xl": "size-12",
};

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

const Avatar = ({ src, alt, name, icon, variant, size = "md", color, className }: AvatarProps) => {
	const backgroundColor = color ?? (name ? stringToColor(name) : undefined);

	// Determine what to render in fallback
	const renderFallback = () => {
		const iconClass = ICON_CLASSES[size];
		const fontClass = FONT_CLASSES[size];

		// Priority 1: Custom icon provided
		if (icon) {
			return <span className={iconClass}>{icon}</span>;
		}

		// Priority 2: Variant default icon
		if (variant) {
			const VariantIcon = VARIANT_ICONS[variant];
			return <VariantIcon className={iconClass} />;
		}

		// Priority 3: Initials from name
		if (name) {
			return <span className={cn("font-medium", fontClass)}>{getInitials(name)}</span>;
		}

		// Priority 4: Image not available
		return <ImageOff className={iconClass} />;
	};

	return (
		<AvatarRoot className={cn(SIZE_CLASSES[size], className)}>
			{src && <AvatarImage src={src} alt={alt ?? name ?? "Avatar"} className={"bg-black"} />}
			<AvatarFallback
				style={backgroundColor ? { backgroundColor } : undefined}
				className={cn("bg-surface-elevated", backgroundColor ? "text-white" : undefined)}>
				{renderFallback()}
			</AvatarFallback>
		</AvatarRoot>
	);
};

export default Avatar;
export { Avatar };
export type { AvatarProps, AvatarSize, AvatarVariant };
