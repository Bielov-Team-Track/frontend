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

export enum PaymentAccountStatus {
  None = "none",
  Created = "created",
  Pending = "pending",
  Active = "active",
  Restricted = "restricted",
  Rejected = "rejected",
}

export interface PaymentAccount {
  accountId: string;
  detailsSubmitted: boolean;  // Onboarding form completed
  chargesEnabled: boolean;    // Can receive payments
  payoutsEnabled: boolean;    // Can payout to bank
  isDeleted: boolean;
  country?: string;
  currency?: string;
  createdAt: Date;
}

export interface BalanceAmount {
  amount: number;
  currency: string;
}

export interface AccountBalance {
  available: BalanceAmount[];
  pending: BalanceAmount[];
}

export interface PayoutSchedule {
  interval: string; // "daily" | "weekly" | "monthly" | "manual"
  delayDays?: number;
  weeklyAnchor?: string;
  monthlyAnchor?: number;
}

export interface PayoutInfo {
  id: string;
  amount: number;
  currency: string;
  arrivalDate: Date;
  status: string; // "paid" | "pending" | "in_transit" | "canceled" | "failed"
  createdAt: Date;
}

export interface AccountPayoutInfo {
  payoutsEnabled: boolean;
  schedule?: PayoutSchedule;
  upcomingPayouts: PayoutInfo[];
  balance: AccountBalance;
}

