"use client";

import {
	addChild,
	createHousehold,
	deleteHousehold,
	getMembers,
	getMyHousehold,
	inviteGuardian,
	removeMember,
	transferOwnership,
	updateMemberPermissions,
} from "@/lib/api/family";
import {
	AddChildDto,
	CreateHouseholdDto,
	InviteGuardianDto,
	TransferOwnershipDto,
	UpdateMemberPermissionsDto,
} from "@/lib/models/Family";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const HOUSEHOLD_QUERY_KEY = "household";

export function useHousehold() {
	return useQuery({
		queryKey: [HOUSEHOLD_QUERY_KEY, "me"],
		queryFn: getMyHousehold,
	});
}

export function useHouseholdMembers() {
	return useQuery({
		queryKey: [HOUSEHOLD_QUERY_KEY, "members"],
		queryFn: getMembers,
	});
}

export function useCreateHousehold() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (dto: CreateHouseholdDto) => createHousehold(dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY] });
		},
	});
}

export function useAddChild() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (dto: AddChildDto) => addChild(dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY, "members"] });
		},
	});
}

export function useInviteGuardian() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (dto: InviteGuardianDto) => inviteGuardian(dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY, "members"] });
		},
	});
}

export function useRemoveMember() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) => removeMember(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY, "members"] });
		},
	});
}

export function useUpdateMemberPermissions() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ userId, dto }: { userId: string; dto: UpdateMemberPermissionsDto }) =>
			updateMemberPermissions(userId, dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY, "members"] });
		},
	});
}

export function useTransferOwnership() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (dto: TransferOwnershipDto) => transferOwnership(dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY] });
		},
	});
}

export function useDeleteHousehold() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteHousehold,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [HOUSEHOLD_QUERY_KEY] });
		},
	});
}
