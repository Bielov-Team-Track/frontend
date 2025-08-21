import { UUID } from "crypto";
import client from "../client"
import { Location } from "../models/Event";

export async function loadLocations() {
  const endpoint = "/v1/locations/";

  return (await client.get<Location[]>(endpoint)).data;
}

export async function createLocation(location: Location) {
  const endpoint = "/v1/locations/";

  await client.post(endpoint, location)
}

export async function deleteLocation(locationId: string) {
  const endpoint = "/locations/" + locationId;

  return (await client.delete<Location>(endpoint)).status;
}