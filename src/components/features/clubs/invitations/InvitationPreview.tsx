"use client";

import { InvitationPreview as InvitationPreviewType } from "@/lib/models/Club";
import { Calendar, Users } from "lucide-react";

interface InvitationPreviewProps {
	invitation: InvitationPreviewType;
}

const InvitationPreview = ({ invitation }: InvitationPreviewProps) => {
	const { club } = invitation;

	return (
		<div className="w-full max-w-lg mx-auto">
			{club.bannerUrl && (
				<div className="h-32 rounded-t-2xl overflow-hidden">
					<img src={club.bannerUrl} alt={`${club.name} banner`} className="w-full h-full object-cover" />
				</div>
			)}
			<div className={`bg-base-200 p-6 ${club.bannerUrl ? "rounded-b-2xl" : "rounded-2xl"}`}>
				<div className="flex items-start gap-4">
					<div className="w-16 h-16 rounded-xl bg-base-300 flex items-center justify-center overflow-hidden">
						{club.logoUrl ? (
							<img src={club.logoUrl} alt={`${club.name} logo`} className="w-full h-full object-cover" />
						) : (
							<Users className="w-8 h-8 text-muted" />
						)}
					</div>
					<div className="flex-1">
						<h2 className="text-xl font-bold text-white">{club.name}</h2>
						{club.description && <p className="text-sm text-muted mt-1 line-clamp-2">{club.description}</p>}
					</div>
				</div>
				<div className="mt-4 pt-4 border-t border-white/10">
					<p className="text-sm text-muted">You've been invited to join this club</p>
					{invitation.expiresAt && (
						<p className="text-xs text-muted mt-1 flex items-center gap-1">
							<Calendar size={12} />
							Expires {new Date(invitation.expiresAt).toLocaleDateString()}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default InvitationPreview;
