import React from "react";
import { Button } from "@/components";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";
import client from "@/lib/api/client";

type SuccessPageParams = {
	searchParams: Promise<{
		session_id?: string;
	}>;
};

async function PaymentSuccessPage({ searchParams }: SuccessPageParams) {
	const params = await searchParams;
	const sessionId = params.session_id;

	if (!sessionId) {
		redirect("/dashboard");
	}

	let eventId: string | null = null;
	let error: string | null = null;

	try {
		// Complete the payment on backend
		const response = await client.post<{
			paymentId: string;
			status: string;
			eventId: string;
		}>(`/events/v1/checkout/complete?sessionId=${sessionId}`);

		eventId = response.data.eventId;
	} catch (err: any) {
		error = err.response?.data?.error || "Failed to verify payment";
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

				<p className="/70 mb-8">
					Thank you for your payment. Your transaction has been completed
					successfully. You will receive a confirmation email shortly.
				</p>

				{error && (
					<div className="alert alert-warning mb-8">
						<span>{error}</span>
					</div>
				)}

				<div className="flex flex-col gap-3">
					{eventId ? (
						<Link href={`/events/${eventId}`}>
							<Button fullWidth>Back to Event</Button>
						</Link>
					) : (
						<Link href="/dashboard/events">
							<Button fullWidth>View My Events</Button>
						</Link>
					)}
					<Link href="/dashboard">
						<Button variant="outline" fullWidth>
							Go to Dashboard
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default PaymentSuccessPage;
