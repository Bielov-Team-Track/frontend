import client from "../client"

export async function createNotificationSubscription(userId: string, subscription: PushSubscription) {
  const endpoint = `/subscriptions/${userId}`

  await client.post(endpoint, subscription)
}