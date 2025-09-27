import { EventParticipant } from "./EventParticipant";
import { UserProfile } from "./User";

export interface Payment {
  id: string;
  userId: string;
  eventParticipant?: EventParticipant;
  amount: number;
  paidAt?: Date;
  status: string;
}
