import { useState, useEffect } from "react";
import { PaymentAccount, PaymentAccountStatus } from "@/lib/models/Payment";
import {
	createPaymentAccount,
	getOnboardingLink,
	getPaymentAccount,
} from "@/lib/api/payments";

interface UsePaymentAccountReturn {
	account: PaymentAccount | null;
	status: PaymentAccountStatus;
	canAcceptPayments: boolean;
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
	completeOnboarding: () => Promise<void>;
	createAccount: () => Promise<void>;
}

export const usePaymentAccount = (): UsePaymentAccountReturn => {
	const [account, setAccount] = useState<PaymentAccount | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAccount = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const accountData = await getPaymentAccount();
			setAccount(accountData);
		} catch (err: any) {
			if (err.response?.status === 404) {
				// No account exists yet
				setAccount(null);
			} else {
				setError(err.message || "Failed to load payment account");
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAccount();
	}, []);

	const refetch = async () => {
		await fetchAccount();
	};

	const createAccount = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const accountData = await createPaymentAccount(); // Replace with createPaymentAccount() when available
			setAccount(accountData);
		} catch (err: any) {
			setError(err.message || "Failed to create payment account");
		} finally {
			setIsLoading(false);
		}
	};

	const completeOnboarding = async () => {
		try {
			const onboardingUrl = await getOnboardingLink();
			window.open(onboardingUrl, "_blank", "noopener,noreferrer");
		} catch (err: any) {
			console.error("Failed to get onboarding link:", err);
		}
	};

	// Derive status from account properties
	const getStatus = (): PaymentAccountStatus => {
		if (!account) return PaymentAccountStatus.None;
		if (account.isDeleted) return PaymentAccountStatus.Rejected;
		if (!account.detailsSubmitted) return PaymentAccountStatus.Created;
		if (account.detailsSubmitted && !account.chargesEnabled)
			return PaymentAccountStatus.Pending;
		if (account.chargesEnabled) return PaymentAccountStatus.Active;
		return PaymentAccountStatus.None;
	};

	const status = getStatus();
	const canAcceptPayments = account?.chargesEnabled || false;

	return {
		account,
		status,
		canAcceptPayments,
		isLoading,
		error,
		refetch,
		completeOnboarding,
		createAccount,
	};
};
