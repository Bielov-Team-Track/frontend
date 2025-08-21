import { UserProfile } from "./User";

export interface Position {
  id: string;
  name: string;
  paid: boolean;
  userId?: string;
  userProfile?: UserProfile;
}

export interface PositionPayment {
  date: string;
  paid: boolean;
  eventId: string;
  position: string;
}