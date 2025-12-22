"use client";

import { Button } from "@/components";
import { createCheckoutSession } from "@/lib/api/payments";
import { useState } from "react";
import { FaCreditCard } from "react-icons/fa";

interface PaymentButtonProps {
	participantId: string;
	amount: number;
	currency?: string;
}

export default function PaymentButton({
	participantId,
	amount,
	currency = "£",
}: PaymentButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handlePayment = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const checkoutUrl = await createCheckoutSession(participantId);
			window.location.href = checkoutUrl;
		} catch (err: any) {
			setError(
				err.response?.data?.error || "Failed to create checkout session",
			);
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{error && <div className="text-sm text-error">{error}</div>}
			<Button
				leftIcon={<FaCreditCard />}
				onClick={handlePayment}
				loading={isLoading}
				disabled={isLoading}
			>
				Pay {currency}
				{amount.toFixed(2)}
			</Button>
		</div>
	);
}
