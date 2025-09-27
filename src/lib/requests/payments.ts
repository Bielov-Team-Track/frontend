import client from "../client";
import { Payment } from "../models/Payment";

const PREFIX = "/events/v1";

export async function updatePayment(positionId: string, paid: boolean) {
  const endpoint = `/payments/${positionId}`;

  await client.post(PREFIX + endpoint, { paid: paid });
}

export async function loadUserPaymentForEvent(
  eventId: string,
  userId: string
): Promise<Payment> {
  const endpoint = `/events/${eventId}/payments?userId=${userId}`;

  return (await client.get<Payment>(PREFIX + endpoint)).data;
}

export async function loadTeamPayments(teamId: string): Promise<Payment[]> {
  const endpoint = `/teams/${teamId}/payments`;
  
  return (await client.get<Payment[]>(PREFIX + endpoint)).data;
}
