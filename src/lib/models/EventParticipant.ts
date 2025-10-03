import { UserProfile } from "./User";
import { Payment } from "./Payment";

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  paymentId?: string | null;
  payment?: Payment | null;
  userProfile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

// Deprecated: Use payment?.status === "completed" instead
export const hasParticipantPaid = (participant: EventParticipant): boolean => {
  return participant.payment?.status === "completed";
};