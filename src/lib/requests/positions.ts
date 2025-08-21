import client from "../client"
import { Position } from "../models/Position"
import { PositionType } from "../models/PositionType"


export async function loadPositionTypes() {
  const endpoint = `/position-types`

  return (await client.get<PositionType[]>(endpoint)).data
}

export async function getPosition(positionId: string) {
  const endpoint = `/v1/teams/positions/${positionId}`

  return (await client.get<Position>(endpoint)).data
}

export async function getUserPositions(userId: string) {
  const endpoint = `/positions?userId=${userId}`

  return (await client.get<Position>(endpoint)).data
}

export async function createPosition(name: string) {
  const endpoint = `/positions`

  await client.post(endpoint, { name })
}

export async function createPositionType(name: string) {
  const endpoint = `/position-types`

  await client.post(endpoint, { name })
}

export async function deletePosition(positionId: string) {
  const endpoint = `/positions/${positionId}`

  await client.delete(endpoint)
}

export async function addPosition(teamId: string, positionTypeId: string) {
  const endpoint = `/teams/${teamId}/positions`

  await client.post(endpoint, { positionTypeId })
}

export async function takePositionWithUser(positionId: string, userId: string) {
  const endpoint = `/v1/teams/positions/${positionId}/assign/${userId}`
  return (await client.post(endpoint)).data
}

export async function claimPosition(positionId: string) {
  const endpoint = `/v1/teams/positions/${positionId}/claim`
  return (await client.post(endpoint)).data
}

export async function releasePosition(positionId: string) {
  const endpoint = `/v1/teams/positions/${positionId}/release`
  return (await client.post(endpoint)).data
}

export async function takePositionWithName(eventId: string, teamId: string, positionId: string, userName: string) {
  const endpoint = `events/${eventId}/teams/${teamId}`

  client.put(endpoint, {
    positionId: positionId,
    userName: userName
  })
}

export async function markPositionPaid(positionId: string) {
  const endpoint = `/positions/${positionId}/paid`

  return await client.put(endpoint)
}