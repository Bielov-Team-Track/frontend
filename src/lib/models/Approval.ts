import { User } from "next-auth";

export interface Approval {
  user: User
  approved?: boolean;
}