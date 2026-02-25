import { UserProfile } from "./User";
import { Payment } from "./Payment";

export enum ParticipationStatus {
	Invited = "Invited",
	Waitlisted = "Waitlisted",
	Accepted = "Accepted",
	Declined = "Declined",
	Attended = "Attended",
	NoShow = "NoShow",
}

export enum InvitedVia {
	Direct = 0,
	ClubMembership = 1,
	SeriesParticipation = 2,
	PublicJoin = 3,
}

export interface EventParticipant {
	id: string;
	eventId: string;
	userId: string;
	paymentId?: string | null;
	payment?: Payment | null;
	userProfile: UserProfile;

	// Status tracking
	status: ParticipationStatus;
	paymentStatus?: string | null;
	declineNote?: string | null;

	// Invitation tracking
	invitedVia: InvitedVia;
	invitedByUserId?: string | null;
	invitedByUser?: UserProfile | null;
	invitedAt?: Date | null;
	seenAt?: Date | null;
	respondedAt?: Date | null;
	role: string;

	createdAt: Date;
	updatedAt: Date;
}

// Deprecated: Use payment?.status === "completed" instead
export const hasParticipantPaid = (participant: EventParticipant): boolean => {
	return participant.payment?.status === "completed";
};
