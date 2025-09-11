import client from "../client";
import {
  BaseUser,
  GoogleUserCreate,
  Suspension,
  UserProfile,
} from "../models/User";
import { PositionPayment } from "../models/Position";
import { AuthData } from "../models/Auth";
import { AuthResponse } from "./auth";

const PREFIX = "/events"


export async function getUserProfile(userId: string) {
  const endpoint = `/users/${userId}`;

  try {
    return (await client.get<UserProfile>(PREFIX + endpoint)).data;
  } catch (error: any) {
    if (error.response.status == 404) {
      return undefined;
    }

    throw error;
  }
}
export async function getUserPositionPayments(userId: string) {
  const endpoint = `/users/${userId}/positionPayments`;

  return (await client.get<PositionPayment[]>(PREFIX + endpoint)).data;
}

export async function getSuspension(
  eventId: string,
  userId: string
): Promise<Suspension> {
  const endpoint = `/users/${userId}/events/${eventId}/suspension`;

  return (await client.get<Suspension>(PREFIX + endpoint)).data;
}

export async function updateUserProfile(user: UserProfile) {
  const endpoint = `/users/`;

  return (await client.put<UserProfile>(PREFIX + endpoint, user)).data;
}

export async function createUser(user: BaseUser) {
  const endpoint = "/auth/register";

  return (await client.post<AuthData>(PREFIX + endpoint, user)).data;
}

export async function createGoogleUser(user: GoogleUserCreate) {
  const endpoint = "/auth/register/google";

  return (await client.post<AuthResponse>(PREFIX + endpoint, user)).data;
}

export async function saveGoogleUser(user: GoogleUserCreate) {
  const endpoint = "/users/google";

  return (await client.put<AuthResponse>(PREFIX + endpoint, user)).data;
}

export async function updateProfileImage(image: Blob, userId: string) {
  const endpoint = `/profile/${userId}/image`;

  const formData = new FormData();
  formData.append("image", image);

  return await client.post(PREFIX + endpoint, formData);
}

export async function followUser(userId: string) {
  const endpoint = `/users/${userId}/follow`;

  return await client.post(PREFIX + endpoint);
}

export async function unfollowUser(userId: string) {
  const endpoint = `/users/${userId}/unfollow`;

  return await client.post(PREFIX + endpoint);
}

export async function search(query: string) {
  const endpoint = `/users/search?query=${query}`;

  return (await client.get<UserProfile[]>(PREFIX + endpoint)).data;
}
