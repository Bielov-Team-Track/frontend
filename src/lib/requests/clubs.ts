import client from "../client";
import { Club } from "../models/Club";
import { CLUBS_API_URL } from "../constants";

export async function getUserClubs(userId: string): Promise<Club[]> {
	const endpoint = `/users/${userId}/clubs`;
	return (await client.get<Club[]>(CLUBS_API_URL + endpoint)).data;
}
