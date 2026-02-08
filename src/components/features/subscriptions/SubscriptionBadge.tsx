"use client";

import { Badge } from "@/components/ui/badge";
import { SubscriptionStatus } from "@/lib/models/Subscription";
import { CreditCard } from "lucide-react";

const statusColors: Record<SubscriptionStatus, string> = {
	[SubscriptionStatus.Active]: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
	[SubscriptionStatus.Trialing]: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
	[SubscriptionStatus.PendingApproval]: "bg-amber-500/10 text-amber-500 border-amber-500/20",
	[SubscriptionStatus.PendingPayment]: "bg-amber-500/10 text-amber-500 border-amber-500/20",
	[SubscriptionStatus.PastDue]: "bg-orange-500/10 text-orange-500 border-orange-500/20",
	[SubscriptionStatus.Suspended]: "bg-red-500/10 text-red-500 border-red-500/20",
	[SubscriptionStatus.Cancelled]: "bg-gray-500/10 text-gray-400 border-gray-500/20",
	[SubscriptionStatus.Expired]: "bg-gray-500/10 text-gray-500 border-gray-500/20",
	[SubscriptionStatus.Rejected]: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const statusLabels: Record<SubscriptionStatus, string> = {
	[SubscriptionStatus.Active]: "Active",
	[SubscriptionStatus.Trialing]: "Trial",
	[SubscriptionStatus.PendingApproval]: "Pending",
	[SubscriptionStatus.PendingPayment]: "Awaiting Payment",
	[SubscriptionStatus.PastDue]: "Past Due",
	[SubscriptionStatus.Suspended]: "Suspended",
	[SubscriptionStatus.Cancelled]: "Cancelled",
	[SubscriptionStatus.Expired]: "Expired",
	[SubscriptionStatus.Rejected]: "Rejected",
};

interface SubscriptionBadgeProps {
	status: SubscriptionStatus;
	planName?: string;
	className?: string;
}

export function SubscriptionBadge({ status, planName, className }: SubscriptionBadgeProps) {
	const colorClass = statusColors[status] || "bg-muted text-muted-foreground";
	const label = planName ? `${planName} · ${statusLabels[status]}` : statusLabels[status];

	return (
		<Badge variant="outline" className={`${colorClass} ${className || ""}`}>
			<CreditCard data-icon="inline-start" className="size-3" />
			{label}
		</Badge>
	);
}
