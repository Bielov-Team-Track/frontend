import client from "./client";
import {
	Payment,
	UserPayment,
	PaymentAccount,
	AccountBalance,
	AccountPayoutInfo,
} from "../models/Payment";

const PREFIX = "events/v1";

export async function updatePayment(positionId: string, paid: boolean) {
	const endpoint = `/payments/${positionId}`;

	await client.post(PREFIX + endpoint, { paid: paid });
}

export async function loadUserPaymentForEvent(
	eventId: string,
	userId: string,
): Promise<Payment> {
	const endpoint = `/events/${eventId}/payments?userId=${userId}`;

	return (await client.get<Payment>(PREFIX + endpoint)).data;
}

export async function loadTeamPayments(teamId: string): Promise<Payment[]> {
	const endpoint = `/teams/${teamId}/payments`;

	return (await client.get<Payment[]>(PREFIX + endpoint)).data;
}

export async function getUserPayments(userId: string): Promise<UserPayment[]> {
	const endpoint = `/payments?userId=${userId}`;

	return (await client.get<UserPayment[]>(PREFIX + endpoint)).data;
}

export async function getPaymentAccount(): Promise<PaymentAccount> {
	const endpoint = `/payments/account`;

	return (await client.get<PaymentAccount>(PREFIX + endpoint)).data;
}

export async function createPaymentAccount(): Promise<PaymentAccount> {
	const endpoint = `/payments/account`;

	return (await client.post<PaymentAccount>(PREFIX + endpoint)).data;
}

export async function getOnboardingLink(): Promise<string> {
	const endpoint = `/payments/account/onboarding-link`;
	const response = await client.get<{ url: string }>(PREFIX + endpoint);
	return response.data.url;
}

export async function getDashboardLink(): Promise<string> {
	const endpoint = `/payments/account/dashboard-link`;
	const response = await client.get<{ url: string }>(PREFIX + endpoint);
	return response.data.url;
}

export async function createCheckoutSession(
	participantId: string,
): Promise<string> {
	const endpoint = `/participants/${participantId}/checkout`;
	const response = await client.post<{ url: string }>(PREFIX + endpoint);
	return response.data.url;
}

export async function createEventCheckoutSession(
	eventId: string,
): Promise<string> {
	const endpoint = `/events/${eventId}/checkout`;
	const response = await client.post<{ url: string }>(PREFIX + endpoint);
	return response.data.url;
}

export async function getAccountBalance(): Promise<AccountBalance> {
	const endpoint = `/payments/account/balance`;
	return (await client.get<AccountBalance>(PREFIX + endpoint)).data;
}

export async function getAccountPayoutInfo(): Promise<AccountPayoutInfo> {
	const endpoint = `/payments/account/payout-info`;
	return (await client.get<AccountPayoutInfo>(PREFIX + endpoint)).data;
}
