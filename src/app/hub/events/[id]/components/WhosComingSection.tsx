"use client";

import AvatarStack, { AvatarStackItem } from "@/components/ui/avatar-stack";
import { EventParticipant, ParticipationStatus } from "@/lib/models/EventParticipant";
import { Users } from "lucide-react";
import Link from "next/link";

interface WhosComingSectionProps {
	participants: EventParticipant[];
	eventId: string;
}

export default function WhosComingSection({ participants, eventId }: WhosComingSectionProps) {
	// Filter accepted participants
	const acceptedParticipants = participants.filter((p) => p.status === ParticipationStatus.Accepted);

	// Map to AvatarStackItem format
	const avatarItems: AvatarStackItem[] = acceptedParticipants.map((p) => ({
		id: p.id || p.userId,
		name: `${p.userProfile?.name || ""} ${p.userProfile?.surname || ""}`.trim() || "Unknown",
		imageUrl: p.userProfile?.imageUrl,
	}));

	return (
		<div className="rounded-2xl bg-card border border-border p-6" data-testid="whos-coming-section">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-bold text-white">Who&apos;s Coming</h2>
				<Link href={`/hub/events/${eventId}/members`} className="text-sm text-accent hover:underline">
					View all
				</Link>
			</div>

			{/* Content */}
			{avatarItems.length === 0 ? (
				// Empty state
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<Users size={48} className="text-muted-foreground opacity-50 mb-3" />
					<p className="text-sm text-muted-foreground">No participants yet</p>
				</div>
			) : (
				// Avatar stack with count
				<div className="flex items-center gap-3">
					<AvatarStack items={avatarItems} max={8} size="sm" showCount={false} />
					<span className="text-sm text-muted-foreground" data-testid="whos-coming-count">
						{avatarItems.length} {avatarItems.length === 1 ? "participant" : "participants"}
					</span>
				</div>
			)}
		</div>
	);
}
