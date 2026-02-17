import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getClubPlans,
	createPlan,
	updatePlan,
	deletePlan,
	subscribeToPlan,
	getMySubscriptions,
	getSubscription,
	cancelSubscription,
	reactivateSubscription,
	changeTier,
	updatePaymentMethod,
	getClubSubscriptions,
	getPendingSubscriptions,
	approveSubscription,
	rejectSubscription,
	suspendSubscription,
	listFamilyMembers,
	inviteFamilyMember,
	removeFamilyMember,
	generateEvidenceUploadUrl,
	confirmEvidenceUpload,
} from "@/lib/api/club-subscriptions";
import {
	CreatePlanRequest,
	UpdatePlanRequest,
	SubscribeRequest,
	InviteMemberRequest,
} from "@/lib/models/Subscription";

// ========== Query Keys ==========

export const subscriptionKeys = {
	all: ["subscriptions"] as const,
	plans: () => [...subscriptionKeys.all, "plans"] as const,
	clubPlans: (clubId: string) => [...subscriptionKeys.plans(), clubId] as const,
	mySubscriptions: () => [...subscriptionKeys.all, "my"] as const,
	detail: (id: string) => [...subscriptionKeys.all, "detail", id] as const,
	clubSubscriptions: (clubId: string) => [...subscriptionKeys.all, "club", clubId] as const,
	pendingSubscriptions: (clubId: string) => [...subscriptionKeys.all, "pending", clubId] as const,
	members: (subscriptionId: string) => [...subscriptionKeys.all, "members", subscriptionId] as const,
};

// ========== Plan Queries ==========

export function useClubPlans(clubId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: subscriptionKeys.clubPlans(clubId),
		queryFn: () => getClubPlans(clubId),
		enabled: enabled && !!clubId,
		staleTime: 2 * 60 * 1000,
	});
}

// ========== Subscription Queries ==========

export function useMySubscriptions() {
	return useQuery({
		queryKey: subscriptionKeys.mySubscriptions(),
		queryFn: getMySubscriptions,
		staleTime: 2 * 60 * 1000,
	});
}

export function useSubscription(subscriptionId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: subscriptionKeys.detail(subscriptionId),
		queryFn: () => getSubscription(subscriptionId),
		enabled: enabled && !!subscriptionId,
		staleTime: 60 * 1000,
	});
}

export function useClubSubscriptions(clubId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: subscriptionKeys.clubSubscriptions(clubId),
		queryFn: () => getClubSubscriptions(clubId),
		enabled: enabled && !!clubId,
		staleTime: 2 * 60 * 1000,
	});
}

export function usePendingSubscriptions(clubId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: subscriptionKeys.pendingSubscriptions(clubId),
		queryFn: () => getPendingSubscriptions(clubId),
		enabled: enabled && !!clubId,
		staleTime: 30 * 1000,
	});
}

export function useFamilyMembers(subscriptionId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: subscriptionKeys.members(subscriptionId),
		queryFn: () => listFamilyMembers(subscriptionId),
		enabled: enabled && !!subscriptionId,
		staleTime: 60 * 1000,
	});
}

// ========== Plan Mutations ==========

export function useCreatePlan(clubId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (plan: CreatePlanRequest) => createPlan(clubId, plan),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.clubPlans(clubId) });
		},
	});
}

export function useUpdatePlan(clubId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ planId, plan }: { planId: string; plan: UpdatePlanRequest }) =>
			updatePlan(clubId, planId, plan),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.clubPlans(clubId) });
		},
	});
}

export function useDeletePlan(clubId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (planId: string) => deletePlan(clubId, planId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.clubPlans(clubId) });
		},
	});
}

// ========== Subscription Mutations ==========

export function useSubscribeToPlan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ planId, request }: { planId: string; request: SubscribeRequest }) =>
			subscribeToPlan(planId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.mySubscriptions() });
		},
	});
}

export function useCancelSubscription() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ subscriptionId, fullRefund }: { subscriptionId: string; fullRefund?: boolean }) =>
			cancelSubscription(subscriptionId, fullRefund),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
		},
	});
}

export function useReactivateSubscription() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (subscriptionId: string) => reactivateSubscription(subscriptionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
		},
	});
}

export function useChangeTier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ subscriptionId, newPlanId }: { subscriptionId: string; newPlanId: string }) =>
			changeTier(subscriptionId, newPlanId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
		},
	});
}

export function useUpdatePaymentMethod() {
	return useMutation({
		mutationFn: (subscriptionId: string) => updatePaymentMethod(subscriptionId),
	});
}

// ========== Admin Mutations ==========

export function useApproveSubscription(clubId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (subscriptionId: string) => approveSubscription(clubId, subscriptionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.pendingSubscriptions(clubId) });
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.clubSubscriptions(clubId) });
		},
	});
}

export function useRejectSubscription(clubId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) =>
			rejectSubscription(clubId, subscriptionId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.pendingSubscriptions(clubId) });
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.clubSubscriptions(clubId) });
		},
	});
}

export function useSuspendSubscription(clubId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (subscriptionId: string) => suspendSubscription(clubId, subscriptionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.clubSubscriptions(clubId) });
		},
	});
}

// ========== Family Member Mutations ==========

export function useInviteFamilyMember(subscriptionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (request: InviteMemberRequest) => inviteFamilyMember(subscriptionId, request),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.members(subscriptionId) });
		},
	});
}

export function useRemoveFamilyMember(subscriptionId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) => removeFamilyMember(subscriptionId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.members(subscriptionId) });
			queryClient.invalidateQueries({ queryKey: subscriptionKeys.mySubscriptions() });
		},
	});
}

// ========== Evidence Mutations ==========

export function useGenerateEvidenceUploadUrl() {
	return useMutation({
		mutationFn: (subscriptionId: string) => generateEvidenceUploadUrl(subscriptionId),
	});
}

export function useConfirmEvidenceUpload() {
	return useMutation({
		mutationFn: ({ subscriptionId, s3Key }: { subscriptionId: string; s3Key: string }) =>
			confirmEvidenceUpload(subscriptionId, s3Key),
	});
}
