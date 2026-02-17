import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClubSkillMatrices,
  getSkillMatrix,
  getDefaultSkillMatrix,
  createSkillMatrixFromTemplate,
  updateSkillMatrixFull,
  deleteSkillMatrix,
} from "@/lib/api/skillMatrices";
import { UpdateSkillMatrixFullRequest } from "@/lib/models/SkillMatrix";

export const skillMatrixKeys = {
  all: ["skill-matrices"] as const,
  club: (clubId: string) => [...skillMatrixKeys.all, "club", clubId] as const,
  default: (clubId: string) => [...skillMatrixKeys.all, "default", clubId] as const,
  detail: (id: string) => [...skillMatrixKeys.all, "detail", id] as const,
};

export function useClubSkillMatrices(clubId: string, enabled = true) {
  return useQuery({
    queryKey: skillMatrixKeys.club(clubId),
    queryFn: () => getClubSkillMatrices(clubId),
    enabled: enabled && !!clubId,
  });
}

export function useDefaultSkillMatrix(clubId: string, enabled = true) {
  return useQuery({
    queryKey: skillMatrixKeys.default(clubId),
    queryFn: () => getDefaultSkillMatrix(clubId),
    enabled: enabled && !!clubId,
  });
}

export function useSkillMatrix(id: string, enabled = true) {
  return useQuery({
    queryKey: skillMatrixKeys.detail(id),
    queryFn: () => getSkillMatrix(id),
    enabled: enabled && !!id,
  });
}

export function useCreateSkillMatrixFromTemplate(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createSkillMatrixFromTemplate(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillMatrixKeys.club(clubId) });
      queryClient.invalidateQueries({ queryKey: skillMatrixKeys.default(clubId) });
    },
  });
}

export function useUpdateSkillMatrixFull(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateSkillMatrixFullRequest }) =>
      updateSkillMatrixFull(id, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: skillMatrixKeys.club(clubId) });
      queryClient.invalidateQueries({ queryKey: skillMatrixKeys.default(clubId) });
      queryClient.setQueryData(skillMatrixKeys.detail(data.id), data);
    },
  });
}

export function useDeleteSkillMatrix(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSkillMatrix(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillMatrixKeys.club(clubId) });
      queryClient.invalidateQueries({ queryKey: skillMatrixKeys.default(clubId) });
    },
  });
}
