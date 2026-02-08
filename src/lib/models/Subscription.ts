// Enums matching backend
export enum SubscriptionStatus {
	PendingApproval = "PendingApproval",
	PendingPayment = "PendingPayment",
	Trialing = "Trialing",
	Active = "Active",
	PastDue = "PastDue",
	Suspended = "Suspended",
	Cancelled = "Cancelled",
	Expired = "Expired",
	Rejected = "Rejected",
}

export enum PlanCategory {
	Adult = "Adult",
	Student = "Student",
	Concession = "Concession",
	Family = "Family",
	Custom = "Custom",
}

export enum BillingInterval {
	Monthly = "Monthly",
	Quarterly = "Quarterly",
	Annually = "Annually",
}

// Plan interfaces
export interface SubscriptionPlan {
	id: string;
	clubId: string;
	name: string;
	description?: string;
	category: PlanCategory;
	billingInterval: BillingInterval;
	price: number;
	currency: string;
	trialDays?: number;
	maxSubscribers?: number;
	currentSubscriberCount: number;
	maxMembers?: number;
	requiresApproval: boolean;
	isActive: boolean;
	platformFeePercent: number;
	features?: string[];
	createdAt: string;
}

export interface CreatePlanRequest {
	name: string;
	description?: string;
	category: PlanCategory;
	billingInterval: BillingInterval;
	price: number;
	currency: string;
	trialDays?: number;
	maxSubscribers?: number;
	maxMembers?: number;
	requiresApproval: boolean;
	features?: string[];
}

export interface UpdatePlanRequest {
	name?: string;
	description?: string;
	maxSubscribers?: number;
	maxMembers?: number;
	requiresApproval?: boolean;
	isActive?: boolean;
	features?: string[];
}

// Subscription interfaces
export interface Subscription {
	id: string;
	userId?: string;
	subscriptionPlanId: string;
	clubId: string;
	status: SubscriptionStatus;
	currency: string;
	pricePerPeriod: number;
	currentPeriodStart?: string;
	currentPeriodEnd?: string;
	trialEndsAt?: string;
	cancelAt?: string;
	coolingOffEndsAt?: string;
	pendingPlanChangeId?: string;
	tierChangeScheduledFor?: string;
	currentMemberCount: number;
	createdAt?: string;
	// Plan info (nested from response)
	planName: string;
	planCategory: PlanCategory;
	billingInterval: BillingInterval;
	maxMembers?: number;
}

export interface SubscribeRequest {
	termsVersion: string;
	userConfirmedAutoRenewal: boolean;
	userConfirmedCancellationRights: boolean;
}

export interface SubscribeResult {
	subscriptionId: string;
	status: SubscriptionStatus;
	clientSecret?: string;
	clientSecretType?: string; // "payment" or "setup"
}

export interface PaymentMethodUpdateResult {
	clientSecret: string;
}

export interface EvidenceUploadUrlResponse {
	uploadUrl: string;
	s3Key: string;
}

// Family member interfaces
export interface SubscriptionMember {
	id: string;
	userId: string;
	role: string;
	dateOfBirth?: string;
	addedAt?: string;
	removedAt?: string;
	invitationAcceptedAt?: string;
	parentalConsentRequired: boolean;
	parentalConsentVerified: boolean;
}

export interface InviteMemberRequest {
	userId: string;
	dateOfBirth?: string;
}

// Payment recovery
export interface PaymentRecoveryResult {
	clientSecret: string;
}
