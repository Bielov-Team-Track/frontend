"use client";

import { Avatar } from "@/components";
import { Club, Venue } from "@/lib/models/Club";
import { shimmerBlur } from "@/lib/utils/image";
import { thumbHashToBlurUrl } from "@/lib/utils/thumbhash";
import { ImageOff, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function formatVenueLocation(venues?: Venue[]): string | null {
	if (!venues || venues.length === 0) return null;
	const firstCity = venues[0].city || venues[0].name;
	if (!firstCity) return null;
	if (venues.length === 1) return firstCity;
	return `${firstCity} +${venues.length - 1} more`;
}

interface ClubCardProps {
	club: Club;
	href?: string;
}

export default function ClubCard({ club, href }: ClubCardProps) {
	const [bannerError, setBannerError] = useState(false);
	const location = formatVenueLocation(club.venues) || club.location;

	return (
		<Link href={href || `/clubs/${club.id}`} className="group block h-full">
			<div className="flex flex-col h-full rounded-2xl bg-card ring-1 ring-foreground/10 overflow-hidden hover:ring-accent/40 hover:-translate-y-0.5 transition-all duration-300">
				{/* Banner with accent line */}
				<div className="relative h-28 bg-muted/30 overflow-hidden">
					{club.bannerUrl && !bannerError ? (
						<Image
							src={club.bannerUrl}
							alt={`${club.name} banner`}
							fill
							sizes="(max-width: 640px) 100vw, 400px"
							className="object-cover"
							placeholder="blur"
							blurDataURL={thumbHashToBlurUrl(club.bannerThumbHash) ?? shimmerBlur(400, 200)}
							onError={() => setBannerError(true)}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<ImageOff className="text-muted-foreground/20" size={28} />
						</div>
					)}
					<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/60" />
				</div>

				{/* Content */}
				<div className="px-4 pb-4 pt-2 relative z-10 flex flex-col flex-1">
					{/* Logo + Name row */}
					<div className="flex items-start gap-3 mb-2">
						<div className="shrink-0 rounded-xl -mt-7 ring-[3px] ring-border/60 shadow-md">
							<Avatar size="lg" variant="club" src={club.logoUrl || undefined} name={club.name} />
						</div>
						<h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
							{club.name}
						</h3>
					</div>

					{/* Description */}
					{club.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{club.description}</p>}

					{/* Footer */}
					<div className="mt-auto pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
						{location ? (
							<span className="flex items-center gap-1.5 min-w-0">
								<MapPin size={11} className="shrink-0" />
								<span className="truncate">{location}</span>
							</span>
						) : (
							<span />
						)}
						<span className="flex items-center gap-1 shrink-0 tabular-nums">
							<Users size={11} />
							{club.memberCount ?? 0}
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
}
