import React from "react";
import { Button } from "@/components";
import Link from "next/link";
import { XCircle } from "lucide-react";

async function PaymentCancelPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-8">
			<div className="max-w-md w-full text-center">
				<div className="mb-6 flex justify-center">
					<div className="rounded-full bg-warning/20 p-6">
						<XCircle className="text-warning" size={64} />
					</div>
				</div>

				<h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>

				<p className="/70 mb-8">
					Your payment was cancelled. No charges have been made to your account.
					You can try again or return to the event page.
				</p>

				<div className="flex flex-col gap-3">
					<Link href="/hub/events">
						<Button fullWidth>Back to Events</Button>
					</Link>
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

export default PaymentCancelPage;
