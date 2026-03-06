"use client";

import { joinEvent, joinEventWaitlist, respondToInvitation } from "@/lib/api/events";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

interface UseEventActionsOptions {
	eventId: string;
	payToJoin?: boolean;
	onSuccess?: () => void;
	onPaymentRequired?: () => void;
}

export function useEventActions({ eventId, payToJoin, onSuccess, onPaymentRequired }: UseEventActionsOptions) {
	const [showDeclineModal, setShowDeclineModal] = useState(false);
	const [declineNote, setDeclineNote] = useState("");

	const respondMutation = useMutation({
		mutationFn: ({ accept, note }: { accept: boolean; note?: string }) =>
			respondToInvitation(eventId, accept, note),
		onSuccess: () => {
			onSuccess?.();
		},
	});

	const joinMutation = useMutation({
		mutationFn: () => joinEvent(eventId),
		onSuccess: () => {
			onSuccess?.();
		},
	});

	const joinWaitlistMutation = useMutation({
		mutationFn: () => joinEventWaitlist(eventId),
		onSuccess: () => {
			onSuccess?.();
		},
	});

	const handleAcceptInvitation = useCallback(() => {
		if (payToJoin) {
			onPaymentRequired?.();
			return;
		}
		respondMutation.mutate({ accept: true });
	}, [payToJoin, onPaymentRequired, respondMutation.mutate]);

	const handleDeclineInvitation = useCallback((note?: string) => {
		if (note !== undefined) {
			respondMutation.mutate({ accept: false, note });
		} else {
			setShowDeclineModal(true);
		}
	}, [respondMutation.mutate]);

	const handleConfirmDecline = useCallback(() => {
		respondMutation.mutate({ accept: false, note: declineNote || undefined });
		setShowDeclineModal(false);
		setDeclineNote("");
	}, [declineNote, respondMutation.mutate]);

	const handleCloseDeclineModal = useCallback(() => setShowDeclineModal(false), []);

	const handleJoin = useCallback(() => {
		if (payToJoin) {
			onPaymentRequired?.();
			return;
		}
		joinMutation.mutate();
	}, [payToJoin, onPaymentRequired, joinMutation.mutate]);

	const handleJoinWaitlist = useCallback(() => {
		joinWaitlistMutation.mutate();
	}, [joinWaitlistMutation.mutate]);

	return {
		handleAcceptInvitation,
		handleDeclineInvitation,
		handleConfirmDecline,
		handleCloseDeclineModal,
		handleJoin,
		handleJoinWaitlist,
		showDeclineModal,
		declineNote,
		setDeclineNote,
		isResponding: respondMutation.isPending,
		isJoining: joinMutation.isPending,
		isJoiningWaitlist: joinWaitlistMutation.isPending,
	};
}
