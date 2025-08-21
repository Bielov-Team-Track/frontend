import client from "../client"
import { Payment, UserPayment } from "../models/Payment"


export async function getUserPayments(userId: string): Promise<UserPayment[]> {
  const endpoint = `/payments/${userId}`

  return (await client.get<UserPayment[]>(endpoint)).data
}

export async function updatePayment(positionId: string, paid: boolean) {
  const endpoint = `/payments/${positionId}`

  await client.post(endpoint, { paid: paid })
}