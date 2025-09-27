import { UserProfile } from "./User";

export interface Comment {
  id: string;
  user: UserProfile;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}
