import { Team } from "./Team";
import { UserProfile } from "./User";

export interface Position {
  id: string;
  name: string;
  paid: boolean;
  userId?: string;
  userProfile?: UserProfile;
  teamId?: string;
  team?: Team;
}

export interface PositionPayment {
  date: string;
  paid: boolean;
  eventId: string;
  position: string;
}

export interface WaitlistEntry {
  userId: string;
  user: UserProfile;
  positionId: string;
  position: Position;
}
