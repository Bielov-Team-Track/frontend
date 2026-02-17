import client from "./client";
import {
	SubscriptionPlan,
	CreatePlanRequest,
	UpdatePlanRequest,
	Subscription,
	SubscribeRequest,
	SubscribeResult,
	PaymentMethodUpdateResult,
	EvidenceUploadUrlResponse,
	SubscriptionMember,
	InviteMemberRequest,
	PaymentRecoveryResult,
} from "../models/Subscription";

const PREFIX = "payments/v1";

// ========== Subscription Plans (Admin) ==========

export async function getClubPlans(
	clubId: string,
): Promise<SubscriptionPlan[]> {
	const endpoint = `/clubs/${clubId}/subscription-plans`;
	return (await client.get<SubscriptionPlan[]>(PREFIX + endpoint)).data;
}

export async function createPlan(
	clubId: string,
	plan: CreatePlanRequest,
): Promise<SubscriptionPlan> {
	const endpoint = `/clubs/${clubId}/subscription-plans`;
	return (await client.post<SubscriptionPlan>(PREFIX + endpoint, plan)).data;
}

export async function updatePlan(
	clubId: string,
	planId: string,
	plan: UpdatePlanRequest,
): Promise<SubscriptionPlan> {
	const endpoint = `/clubs/${clubId}/subscription-plans/${planId}`;
	return (await client.put<SubscriptionPlan>(PREFIX + endpoint, plan)).data;
}

export async function deletePlan(
	clubId: string,
	planId: string,
): Promise<void> {
	const endpoint = `/clubs/${clubId}/subscription-plans/${planId}`;
	await client.delete(PREFIX + endpoint);
}

// ========== Subscriptions (User) ==========

export async function subscribeToPlan(
	planId: string,
	request: SubscribeRequest,
): Promise<SubscribeResult> {
	const endpoint = `/subscriptions/plans/${planId}/subscribe`;
	return (await client.post<SubscribeResult>(PREFIX + endpoint, request)).data;
}

export async function getMySubscriptions(): Promise<Subscription[]> {
	const endpoint = `/subscriptions/my`;
	return (await client.get<Subscription[]>(PREFIX + endpoint)).data;
}

export async function getSubscription(
	subscriptionId: string,
): Promise<Subscription> {
	const endpoint = `/subscriptions/${subscriptionId}`;
	return (await client.get<Subscription>(PREFIX + endpoint)).data;
}

export async function initiatePayment(
	subscriptionId: string,
): Promise<SubscribeResult> {
	const endpoint = `/subscriptions/${subscriptionId}/initiate-payment`;
	return (await client.post<SubscribeResult>(PREFIX + endpoint)).data;
}

export async function cancelSubscription(
	subscriptionId: string,
	fullRefund: boolean = false,
): Promise<Subscription> {
	const endpoint = `/subscriptions/${subscriptionId}/cancel?fullRefund=${fullRefund}`;
	return (await client.post<Subscription>(PREFIX + endpoint)).data;
}

export async function reactivateSubscription(
	subscriptionId: string,
): Promise<Subscription> {
	const endpoint = `/subscriptions/${subscriptionId}/reactivate`;
	return (await client.post<Subscription>(PREFIX + endpoint)).data;
}

export async function changeTier(
	subscriptionId: string,
	newPlanId: string,
): Promise<Subscription> {
	const endpoint = `/subscriptions/${subscriptionId}/change-plan/${newPlanId}`;
	return (await client.post<Subscription>(PREFIX + endpoint)).data;
}

export async function updatePaymentMethod(
	subscriptionId: string,
): Promise<PaymentMethodUpdateResult> {
	const endpoint = `/subscriptions/${subscriptionId}/payment-method`;
	return (
		await client.post<PaymentMethodUpdateResult>(PREFIX + endpoint)
	).data;
}

export async function generateEvidenceUploadUrl(
	subscriptionId: string,
): Promise<EvidenceUploadUrlResponse> {
	const endpoint = `/subscriptions/${subscriptionId}/evidence/upload-url`;
	return (
		await client.post<EvidenceUploadUrlResponse>(PREFIX + endpoint)
	).data;
}

export async function confirmEvidenceUpload(
	subscriptionId: string,
	s3Key: string,
): Promise<void> {
	const endpoint = `/subscriptions/${subscriptionId}/evidence/confirm`;
	await client.post(PREFIX + endpoint, { s3Key });
}

// ========== Admin Subscriptions ==========

export async function getClubSubscriptions(
	clubId: string,
): Promise<Subscription[]> {
	const endpoint = `/clubs/${clubId}/subscriptions`;
	return (await client.get<Subscription[]>(PREFIX + endpoint)).data;
}

export async function getPendingSubscriptions(
	clubId: string,
): Promise<Subscription[]> {
	const endpoint = `/clubs/${clubId}/subscriptions/pending`;
	return (await client.get<Subscription[]>(PREFIX + endpoint)).data;
}

export async function approveSubscription(
	clubId: string,
	subscriptionId: string,
): Promise<Subscription> {
	const endpoint = `/clubs/${clubId}/subscriptions/${subscriptionId}/approve`;
	return (await client.post<Subscription>(PREFIX + endpoint)).data;
}

export async function rejectSubscription(
	clubId: string,
	subscriptionId: string,
	reason?: string,
): Promise<Subscription> {
	const endpoint = `/clubs/${clubId}/subscriptions/${subscriptionId}/reject`;
	return (await client.post<Subscription>(PREFIX + endpoint, { reason })).data;
}

export async function suspendSubscription(
	clubId: string,
	subscriptionId: string,
): Promise<Subscription> {
	const endpoint = `/clubs/${clubId}/subscriptions/${subscriptionId}/suspend`;
	return (await client.post<Subscription>(PREFIX + endpoint)).data;
}

// ========== Family Members ==========

export async function inviteFamilyMember(
	subscriptionId: string,
	request: InviteMemberRequest,
): Promise<SubscriptionMember> {
	const endpoint = `/subscriptions/${subscriptionId}/members/invite`;
	return (
		await client.post<SubscriptionMember>(PREFIX + endpoint, request)
	).data;
}

export async function listFamilyMembers(
	subscriptionId: string,
): Promise<SubscriptionMember[]> {
	const endpoint = `/subscriptions/${subscriptionId}/members`;
	return (await client.get<SubscriptionMember[]>(PREFIX + endpoint)).data;
}

export async function removeFamilyMember(
	subscriptionId: string,
	userId: string,
): Promise<void> {
	const endpoint = `/subscriptions/${subscriptionId}/members/${userId}`;
	await client.delete(PREFIX + endpoint);
}

export async function acceptFamilyInvitation(
	token: string,
): Promise<SubscriptionMember> {
	const endpoint = `/subscriptions/invitations/${token}/accept`;
	return (await client.post<SubscriptionMember>(PREFIX + endpoint)).data;
}

export async function verifyParentalConsent(token: string): Promise<void> {
	const endpoint = `/subscriptions/parental-consent/${token}/verify`;
	await client.post(PREFIX + endpoint);
}

// ========== Payment Recovery ==========

export async function redeemRecoveryToken(
	token: string,
): Promise<PaymentRecoveryResult> {
	const endpoint = `/payment-recovery/${token}/redeem`;
	return (await client.post<PaymentRecoveryResult>(PREFIX + endpoint)).data;
}
