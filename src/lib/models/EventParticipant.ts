import { UserProfile } from "./User";

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  hasPaid: boolean;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}