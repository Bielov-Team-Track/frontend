"use client";

import { getConsentsForMinor, grantConsent, renewConsent, revokeConsent } from "@/lib/api/family";
import { GrantConsentDto, RenewConsentDto, RevokeConsentDto } from "@/lib/models/Family";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const CONSENT_QUERY_KEY = "consent";

export function useConsentsForMinor(minorId: string) {
	return useQuery({
		queryKey: [CONSENT_QUERY_KEY, minorId],
		queryFn: () => getConsentsForMinor(minorId),
		enabled: !!minorId,
	});
}

export function useGrantConsent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ minorId, dto }: { minorId: string; dto: GrantConsentDto }) => grantConsent(minorId, dto),
		onSuccess: (_, { minorId }) => {
			queryClient.invalidateQueries({ queryKey: [CONSENT_QUERY_KEY, minorId] });
		},
	});
}

export function useRevokeConsent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ minorId, dto }: { minorId: string; dto: RevokeConsentDto }) => revokeConsent(minorId, dto),
		onSuccess: (_, { minorId }) => {
			queryClient.invalidateQueries({ queryKey: [CONSENT_QUERY_KEY, minorId] });
		},
	});
}

export function useRenewConsent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ minorId, dto }: { minorId: string; dto: RenewConsentDto }) => renewConsent(minorId, dto),
		onSuccess: (_, { minorId }) => {
			queryClient.invalidateQueries({ queryKey: [CONSENT_QUERY_KEY, minorId] });
		},
	});
}
