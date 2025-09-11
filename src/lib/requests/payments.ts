import client from "../client"
import { Payment, UserPayment } from "../models/Payment"



const PREFIX = "/events"

export async function getUserPayments(userId: string): Promise<UserPayment[]> {
  const endpoint = `/payments/${userId}`

  return (await client.get<UserPayment[]>(PREFIX + endpoint)).data
}

export async function updatePayment(positionId: string, paid: boolean) {
  const endpoint = `/payments/${positionId}`

  await client.post(PREFIX + endpoint, { paid: paid })
}