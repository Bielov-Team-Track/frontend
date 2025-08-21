import { User } from "next-auth";
import client from "../client";
import { BaseUser, GoogleUserCreate, Suspension } from "../models/User";
import { PositionPayment } from "../models/Position";
import { RegistrationCompleteModel } from "../models/Auth";

export async function getUser(userId: string) {
  const endpoint = `/users/${userId}`;

  try {
    return (await client.get<User>(endpoint)).data;
  } catch (error: any) {
    if (error.response.status == 404) {
      return undefined;
    }

    throw error;
  }
}
export async function getUserPositionPayments(userId: string) {
  const endpoint = `/users/${userId}/positionPayments`;

  return (await client.get<PositionPayment[]>(endpoint)).data;
}

export async function getSuspension(
  eventId: string,
  userId: string
): Promise<Suspension> {
  const endpoint = `/users/${userId}/events/${eventId}/suspension`;

  return (await client.get<Suspension>(endpoint)).data;
}

export async function updateUser(user: User) {
  const endpoint = `/users/`;

  return (await client.put<User>(endpoint, user)).data;
}

export async function createUser(user: BaseUser) {
  const endpoint = "/auth/register";

  return (await client.post<RegistrationCompleteModel>(endpoint, user)).data;
}

export async function createGoogleUser(user: GoogleUserCreate) {
  const endpoint = "/users/google";

  return (await client.post<User>(endpoint, user)).data;
}

export async function saveGoogleUser(user: GoogleUserCreate) {
  const endpoint = "/users/google";

  return (await client.put<User>(endpoint, user)).data;
}

export async function updateProfileImage(image: Blob, userId: string) {
  const endpoint = `/profile/${userId}/image`;

  const formData = new FormData();
  formData.append("image", image);

  return await client.post(endpoint, formData);
}

export async function followUser(userId: string) {
  const endpoint = `/users/${userId}/follow`;

  return await client.post(endpoint);
}

export async function unfollowUser(userId: string) {
  const endpoint = `/users/${userId}/unfollow`;

  return await client.post(endpoint);
}

export async function search(query: string) {
  const endpoint = `/users/search?query=${query}`;

  return (await client.get<User[]>(endpoint)).data;
}
