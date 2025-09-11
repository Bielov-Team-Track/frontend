import { UserProfile } from "./User";

export interface Approval {
  user: UserProfile;
  approved?: boolean;
}
