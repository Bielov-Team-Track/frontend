import client from './client';

const PREFIX = '/clubs';

export interface ShareTemplate {
  id: string;
  clubId: string;
  name: string;
  entityType: number;
  isDefault: boolean;
  config: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export async function getShareTemplates(
  clubId: string,
  entityType?: number
): Promise<ShareTemplate[]> {
  const params = entityType != null ? { entityType } : {};
  const res = await client.get<ShareTemplate[]>(
    `${PREFIX}/v1/clubs/${clubId}/share-templates`,
    { params }
  );
  return res.data;
}

export async function getShareTemplate(
  clubId: string,
  templateId: string
): Promise<ShareTemplate> {
  const res = await client.get<ShareTemplate>(
    `${PREFIX}/v1/clubs/${clubId}/share-templates/${templateId}`
  );
  return res.data;
}
