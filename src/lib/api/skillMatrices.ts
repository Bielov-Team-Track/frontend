import client from "./client";
import {
  ClubSkillMatrixDto,
  ClubSkillMatrix,
  CreateSkillMatrixRequest,
  UpdateSkillMatrixRequest,
  UpdateSkillMatrixFullRequest,
  transformSkillMatrixDto,
} from "../models/SkillMatrix";

const PREFIX = "/clubs";

export async function getClubSkillMatrices(clubId: string): Promise<ClubSkillMatrix[]> {
  const response = await client.get<ClubSkillMatrixDto[]>(
    `${PREFIX}/v1/clubs/${clubId}/skill-matrices`
  );
  return response.data.map(transformSkillMatrixDto);
}

export async function getSkillMatrix(id: string): Promise<ClubSkillMatrix> {
  const response = await client.get<ClubSkillMatrixDto>(
    `${PREFIX}/v1/skill-matrices/${id}`
  );
  return transformSkillMatrixDto(response.data);
}

export async function getDefaultSkillMatrix(clubId: string): Promise<ClubSkillMatrix | null> {
  try {
    const response = await client.get<ClubSkillMatrixDto>(
      `${PREFIX}/v1/clubs/${clubId}/skill-matrices/default`
    );
    return transformSkillMatrixDto(response.data);
  } catch {
    return null;
  }
}

export async function createSkillMatrix(
  clubId: string,
  request: CreateSkillMatrixRequest
): Promise<ClubSkillMatrix> {
  const response = await client.post<ClubSkillMatrixDto>(
    `${PREFIX}/v1/clubs/${clubId}/skill-matrices`,
    request
  );
  return transformSkillMatrixDto(response.data);
}

export async function createSkillMatrixFromTemplate(
  clubId: string
): Promise<ClubSkillMatrix> {
  const response = await client.post<ClubSkillMatrixDto>(
    `${PREFIX}/v1/clubs/${clubId}/skill-matrices/from-template`
  );
  return transformSkillMatrixDto(response.data);
}

export async function updateSkillMatrix(
  id: string,
  request: UpdateSkillMatrixRequest
): Promise<ClubSkillMatrix> {
  const response = await client.put<ClubSkillMatrixDto>(
    `${PREFIX}/v1/skill-matrices/${id}`,
    request
  );
  return transformSkillMatrixDto(response.data);
}

export async function updateSkillMatrixFull(
  id: string,
  request: UpdateSkillMatrixFullRequest
): Promise<ClubSkillMatrix> {
  const response = await client.put<ClubSkillMatrixDto>(
    `${PREFIX}/v1/skill-matrices/${id}/full`,
    request
  );
  return transformSkillMatrixDto(response.data);
}

export async function deleteSkillMatrix(id: string): Promise<void> {
  await client.delete(`${PREFIX}/v1/skill-matrices/${id}`);
}

export async function setDefaultSkillMatrix(id: string): Promise<ClubSkillMatrix> {
  const response = await client.post<ClubSkillMatrixDto>(
    `${PREFIX}/v1/skill-matrices/${id}/set-default`
  );
  return transformSkillMatrixDto(response.data);
}
