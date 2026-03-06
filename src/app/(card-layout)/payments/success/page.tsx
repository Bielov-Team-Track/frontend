"use client";

import { Button, Loader } from "@/components";
import client from "@/lib/api/client";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PaymentSuccessContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const sessionId = searchParams.get("session_id");

	const [eventId, setEventId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!sessionId) {
			router.replace("/hub");
			return;
		}

		async function completePayment() {
			try {
				const response = await client.post<{
					paymentId: string;
					status: string;
					eventId: string;
				}>(`/payments/v1/checkout/complete?sessionId=${sessionId}`);
				setEventId(response.data.eventId);
			} catch (err: any) {
				setError(err.response?.data?.error || "Failed to verify payment");
			} finally {
				setIsLoading(false);
			}
		}

		completePayment();
	}, [sessionId, router]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center text-muted">Verifying payment...</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center p-8">
			<div className="max-w-md w-full text-center">
				<div className="mb-6 flex justify-center">
					<div className="rounded-full bg-success/20 p-6">
						<CheckCircle className="text-success" size={64} />
					</div>
				</div>

				<h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>

				<p className="text-muted mb-8">
					Thank you for your payment. Your transaction has been completed successfully. You will receive a confirmation email shortly.
				</p>

				{error && (
					<div className="alert alert-warning mb-8">
						<span>{error}</span>
					</div>
				)}

				<div className="flex flex-col gap-3">
					{eventId ? (
						<Link href={`/hub/events/${eventId}`}>
							<Button fullWidth>Back to Event</Button>
						</Link>
					) : (
						<Link href="/hub/events">
							<Button fullWidth>View My Events</Button>
						</Link>
					)}
					<Link href="/hub">
						<Button variant="outline" fullWidth>
							Go to Dashboard
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default function PaymentSuccessPage() {
	return (
		<Suspense fallback={<div className="flex justify-center p-8"><Loader /></div>}>
			<PaymentSuccessContent />
		</Suspense>
	);
}
