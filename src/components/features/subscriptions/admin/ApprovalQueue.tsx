"use client";

import { Button } from "@/components/ui";
import { Subscription } from "@/lib/models/Subscription";
import { useApproveSubscription, useRejectSubscription } from "@/hooks/useSubscriptions";
import { Check, X } from "lucide-react";
import { useState } from "react";

interface Props {
	subscriptions: Subscription[];
	clubId: string;
}

export default function ApprovalQueue({ subscriptions, clubId }: Props) {
	const approveMutation = useApproveSubscription(clubId);
	const rejectMutation = useRejectSubscription(clubId);
	const [rejectingId, setRejectingId] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState("");

	const handleReject = (subscriptionId: string) => {
		rejectMutation.mutate(
			{ subscriptionId, reason: rejectReason || undefined },
			{
				onSuccess: () => {
					setRejectingId(null);
					setRejectReason("");
				},
			}
		);
	};

	return (
		<div className="space-y-3">
			{subscriptions.map((sub) => (
				<div key={sub.id} className="p-4 rounded-xl bg-surface border border-border">
					<div className="flex items-center justify-between">
						<div>
							<span className="text-sm font-medium text-foreground">{sub.planName}</span>
							<div className="text-xs text-muted mt-0.5">
								{sub.currency.toUpperCase()} {sub.pricePerPeriod.toFixed(2)} / {sub.billingInterval.toLowerCase()}
								{sub.createdAt && (
									<span> &middot; Applied {new Date(sub.createdAt).toLocaleDateString()}</span>
								)}
							</div>
						</div>
						{rejectingId !== sub.id && (
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setRejectingId(sub.id)}
									disabled={rejectMutation.isPending}
									leftIcon={<X size={14} />}
								>
									Reject
								</Button>
								<Button
									size="sm"
									onClick={() => approveMutation.mutate(sub.id)}
									disabled={approveMutation.isPending}
									leftIcon={<Check size={14} />}
								>
									Approve
								</Button>
							</div>
						)}
					</div>
					{rejectingId === sub.id && (
						<div className="mt-3 space-y-2">
							<input
								type="text"
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								placeholder="Reason for rejection (optional)"
								className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
							/>
							<div className="flex justify-end gap-2">
								<Button variant="ghost" size="sm" onClick={() => setRejectingId(null)}>
									Cancel
								</Button>
								<Button variant="destructive" size="sm" onClick={() => handleReject(sub.id)} disabled={rejectMutation.isPending}>
									Confirm Reject
								</Button>
							</div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
