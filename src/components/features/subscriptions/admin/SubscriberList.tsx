"use client";

import { Badge, Button } from "@/components/ui";
import { Subscription, SubscriptionStatus } from "@/lib/models/Subscription";
import { useSuspendSubscription } from "@/hooks/useSubscriptions";
import { Pause } from "lucide-react";

interface Props {
	subscriptions: Subscription[];
	clubId: string;
}

const statusConfig: Record<SubscriptionStatus, { label: string; variant: "success" | "warning" | "error" | "neutral" | "info" }> = {
	[SubscriptionStatus.Active]: { label: "Active", variant: "success" },
	[SubscriptionStatus.Trialing]: { label: "Trial", variant: "info" },
	[SubscriptionStatus.PendingApproval]: { label: "Pending", variant: "warning" },
	[SubscriptionStatus.PendingPayment]: { label: "Awaiting Payment", variant: "warning" },
	[SubscriptionStatus.PastDue]: { label: "Past Due", variant: "error" },
	[SubscriptionStatus.Suspended]: { label: "Suspended", variant: "error" },
	[SubscriptionStatus.Cancelled]: { label: "Cancelled", variant: "neutral" },
	[SubscriptionStatus.Expired]: { label: "Expired", variant: "neutral" },
	[SubscriptionStatus.Rejected]: { label: "Rejected", variant: "error" },
};

export default function SubscriberList({ subscriptions, clubId }: Props) {
	const suspendMutation = useSuspendSubscription(clubId);

	return (
		<div className="space-y-2">
			{subscriptions.map((sub) => {
				const config = statusConfig[sub.status];
				return (
					<div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-foreground">{sub.planName}</span>
								<Badge variant={config.variant}>{config.label}</Badge>
							</div>
							<div className="text-xs text-muted mt-0.5">
								{sub.currency.toUpperCase()} {sub.pricePerPeriod.toFixed(2)} / {sub.billingInterval.toLowerCase()}
								{sub.currentPeriodEnd && (
									<span> &middot; Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
								)}
								{sub.currentMemberCount > 0 && (
									<span> &middot; {sub.currentMemberCount} members</span>
								)}
							</div>
						</div>
						{(sub.status === SubscriptionStatus.Active || sub.status === SubscriptionStatus.PastDue) && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => suspendMutation.mutate(sub.id)}
								disabled={suspendMutation.isPending}
							>
								<Pause size={14} />
							</Button>
						)}
					</div>
				);
			})}
		</div>
	);
}
