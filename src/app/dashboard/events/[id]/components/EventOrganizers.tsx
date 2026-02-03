"use client";

import { EventParticipant } from "@/lib/models/EventParticipant";
import { Crown, Shield, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EventOrganizersProps {
	participants: EventParticipant[];
}

type OrganizerRole = "Owner" | "Organizer" | "Admin";

const roleConfig: Record<OrganizerRole, { icon: typeof Crown; label: string; color: string; bgColor: string }> = {
	Owner: {
		icon: Crown,
		label: "Owner",
		color: "text-amber-400",
		bgColor: "bg-amber-400/10 border-amber-400/30",
	},
	Organizer: {
		icon: Star,
		label: "Organizer",
		color: "text-primary",
		bgColor: "bg-primary/10 border-primary/30",
	},
	Admin: {
		icon: Shield,
		label: "Admin",
		color: "text-secondary",
		bgColor: "bg-secondary/10 border-secondary/30",
	},
};

function getInitials(name?: string, surname?: string): string {
	const first = name?.charAt(0) || "";
	const last = surname?.charAt(0) || "";
	return (first + last).toUpperCase() || "??";
}

export default function EventOrganizers({ participants }: EventOrganizersProps) {
	// Filter participants who are organizers/admins
	const organizers = participants.filter(
		(p) => p.role === "Owner" || p.role === "Organizer" || p.role === "Admin"
	);

	if (organizers.length === 0) {
		return null;
	}

	// Sort by role priority: Owner > Organizer > Admin
	const rolePriority: Record<string, number> = { Owner: 1, Organizer: 2, Admin: 3 };
	const sortedOrganizers = [...organizers].sort(
		(a, b) => (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99)
	);

	return (
		<div className="flex items-center gap-2">
			{/* Stacked avatars with role indicators */}
			<div className="flex -space-x-2">
				{sortedOrganizers.slice(0, 4).map((organizer, index) => {
					const profile = organizer.userProfile;
					const role = organizer.role as OrganizerRole;
					const config = roleConfig[role];
					const Icon = config?.icon || Shield;

					return (
						<Link
							key={organizer.id}
							href={`/profiles/${organizer.userId}`}
							className="group relative"
							style={{ zIndex: 10 - index }}>
							{/* Avatar */}
							<div
								className={`
									relative w-8 h-8 rounded-full overflow-hidden
									ring-2 ring-background
									transition-transform group-hover:scale-110 group-hover:z-20
								`}>
								{profile?.imageUrl ? (
									<Image
										src={profile.imageUrl}
										alt={`${profile.name || ""} ${profile.surname || ""}`}
										fill
										className="object-cover"
									/>
								) : (
									<div className="w-full h-full bg-gradient-to-br from-accent/30 to-secondary/30 flex items-center justify-center">
										<span className="text-xs font-bold text-white">
											{getInitials(profile?.name, profile?.surname)}
										</span>
									</div>
								)}
							</div>

							{/* Role badge - small icon overlay */}
							<div
								className={`
									absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full
									flex items-center justify-center
									${config?.bgColor || "bg-white/10"} border
									ring-1 ring-background
								`}>
								<Icon size={10} className={config?.color || "text-white"} />
							</div>

							{/* Tooltip */}
							<div
								className={`
									absolute bottom-full left-1/2 -translate-x-1/2 mb-2
									px-2 py-1 rounded-lg whitespace-nowrap
									bg-raised/95 backdrop-blur-sm border border-white/10 shadow-lg
									text-xs font-medium text-white
									opacity-0 invisible group-hover:opacity-100 group-hover:visible
									transition-all duration-200 z-30
								`}>
								<div className="flex items-center gap-1.5">
									<Icon size={12} className={config?.color || "text-white"} />
									<span>
										{profile?.name || "Unknown"} {profile?.surname || ""}
									</span>
									<span className="text-muted">•</span>
									<span className={config?.color}>{config?.label}</span>
								</div>
								{/* Tooltip arrow */}
								<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
									<div className="border-4 border-transparent border-t-raised/95" />
								</div>
							</div>
						</Link>
					);
				})}

				{/* "+N more" indicator */}
				{sortedOrganizers.length > 4 && (
					<div
						className={`
							w-8 h-8 rounded-full
							bg-white/5 border border-white/20
							flex items-center justify-center
							ring-2 ring-background
							text-xs font-bold text-muted
						`}>
						+{sortedOrganizers.length - 4}
					</div>
				)}
			</div>

			{/* "Hosted by" label with first organizer name */}
			<div className="hidden sm:flex flex-col text-left">
				<span className="text-[10px] uppercase tracking-wider text-muted/70 font-medium">Hosted by</span>
				<span className="text-xs font-semibold text-white">
					{sortedOrganizers[0]?.userProfile?.name || "Unknown"}
					{sortedOrganizers.length > 1 && (
						<span className="text-muted font-normal"> +{sortedOrganizers.length - 1}</span>
					)}
				</span>
			</div>
		</div>
	);
}
