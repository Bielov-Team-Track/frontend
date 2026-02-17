import client from "./client";
import {
	Payment,
	UserPayment,
	PaymentAccount,
	AccountBalance,
	AccountPayoutInfo,
} from "../models/Payment";

// Event-specific payment endpoints stay in events-service
const EVENTS_PREFIX = "events/v1";

// Payment account management endpoints are in payments-service
const PAYMENTS_PREFIX = "payments/v1";

export async function updatePayment(positionId: string, paid: boolean) {
	const endpoint = `/payments/${positionId}`;

	await client.post(EVENTS_PREFIX + endpoint, { paid: paid });
}

export async function loadUserPaymentForEvent(
	eventId: string,
	userId: string,
): Promise<Payment> {
	const endpoint = `/events/${eventId}/payments?userId=${userId}`;

	return (await client.get<Payment>(EVENTS_PREFIX + endpoint)).data;
}

export async function loadTeamPayments(teamId: string): Promise<Payment[]> {
	const endpoint = `/teams/${teamId}/payments`;

	return (await client.get<Payment[]>(EVENTS_PREFIX + endpoint)).data;
}

export async function getUserPayments(userId: string): Promise<UserPayment[]> {
	const endpoint = `/payments?userId=${userId}`;

	return (await client.get<UserPayment[]>(EVENTS_PREFIX + endpoint)).data;
}

// --- Payment Account endpoints (payments-service) ---

export async function getPaymentAccount(): Promise<PaymentAccount> {
	const endpoint = `/payments/account`;

	return (await client.get<PaymentAccount>(PAYMENTS_PREFIX + endpoint)).data;
}

export async function createPaymentAccount(): Promise<PaymentAccount> {
	const endpoint = `/payments/account`;

	return (await client.post<PaymentAccount>(PAYMENTS_PREFIX + endpoint)).data;
}

export async function getOnboardingLink(): Promise<string> {
	const endpoint = `/payments/account/onboarding-link`;
	const response = await client.get<{ url: string }>(PAYMENTS_PREFIX + endpoint);
	return response.data.url;
}

export async function getDashboardLink(): Promise<string> {
	const endpoint = `/payments/account/dashboard-link`;
	const response = await client.get<{ url: string }>(PAYMENTS_PREFIX + endpoint);
	return response.data.url;
}

// --- Checkout endpoints (events-service) ---

export async function createCheckoutSession(
	participantId: string,
): Promise<string> {
	const endpoint = `/participants/${participantId}/checkout`;
	const response = await client.post<{ url: string }>(EVENTS_PREFIX + endpoint);
	return response.data.url;
}

export async function createEventCheckoutSession(
	eventId: string,
): Promise<string> {
	const endpoint = `/events/${eventId}/checkout`;
	const response = await client.post<{ url: string }>(EVENTS_PREFIX + endpoint);
	return response.data.url;
}

// --- Balance & Payout (payments-service) ---

export async function getAccountBalance(): Promise<AccountBalance> {
	const endpoint = `/payments/account/balance`;
	return (await client.get<AccountBalance>(PAYMENTS_PREFIX + endpoint)).data;
}

export async function getAccountPayoutInfo(): Promise<AccountPayoutInfo> {
	const endpoint = `/payments/account/payout-info`;
	return (await client.get<AccountPayoutInfo>(PAYMENTS_PREFIX + endpoint)).data;
}
