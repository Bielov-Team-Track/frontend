import { useState, useEffect, useCallback } from "react";
import { Payment } from "@/lib/models/Payment";
import { loadUserPaymentForEvent } from "@/lib/requests/payments";

export function useUserPayment(eventId: string, userId: string | null) {
	const [payment, setPayment] = useState<Payment | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refreshPayment = useCallback(async () => {
		if (!userId) {
			setPayment(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			const userPayment = await loadUserPaymentForEvent(eventId, userId);
			setPayment(userPayment);
		} catch (err: any) {
			// Payment might not exist yet - this is normal for new participants
			if (err.response?.status === 404) {
				setPayment(null);
			} else {
				setError(err.message || "Failed to load payment");
				console.error("Failed to load user payment:", err);
			}
		} finally {
			setIsLoading(false);
		}
	}, [eventId, userId]);

	useEffect(() => {
		refreshPayment();
	}, [refreshPayment]);

	return {
		payment,
		isLoading,
		error,
		refreshPayment,
	};
}
