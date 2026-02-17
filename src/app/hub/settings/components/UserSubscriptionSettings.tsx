"use client";

import { useState } from "react";
import { Badge, Button, EmptyState, Loader, Modal } from "@/components/ui";
import { SettingsCard } from "@/components/layout/settings-layout";
import { Repeat, CreditCard, X, RotateCcw } from "lucide-react";
import {
	useMySubscriptions,
	useCancelSubscription,
	useReactivateSubscription,
	useUpdatePaymentMethod,
} from "@/hooks/useSubscriptions";
import {
	Subscription,
	SubscriptionStatus,
	BillingInterval,
} from "@/lib/models/Subscription";
import { showErrorToast } from "@/lib/errors";

const statusConfig: Record<
	SubscriptionStatus,
	{ label: string; variant: "success" | "warning" | "error" | "neutral" | "info" }
> = {
	[SubscriptionStatus.Active]: { label: "Active", variant: "success" },
	[SubscriptionStatus.Trialing]: { label: "Trial", variant: "info" },
	[SubscriptionStatus.PendingApproval]: { label: "Pending Approval", variant: "warning" },
	[SubscriptionStatus.PendingPayment]: { label: "Awaiting Payment", variant: "warning" },
	[SubscriptionStatus.PastDue]: { label: "Past Due", variant: "error" },
	[SubscriptionStatus.Suspended]: { label: "Suspended", variant: "error" },
	[SubscriptionStatus.Cancelled]: { label: "Cancelled", variant: "neutral" },
	[SubscriptionStatus.Expired]: { label: "Expired", variant: "neutral" },
	[SubscriptionStatus.Rejected]: { label: "Rejected", variant: "error" },
};

const intervalLabels: Record<BillingInterval, string> = {
	[BillingInterval.Monthly]: "month",
	[BillingInterval.Quarterly]: "quarter",
	[BillingInterval.Annually]: "year",
};

export default function UserSubscriptionSettings() {
	const { data: subscriptions = [], isLoading } = useMySubscriptions();
	const cancelMutation = useCancelSubscription();
	const reactivateMutation = useReactivateSubscription();
	const updatePaymentMutation = useUpdatePaymentMethod();
	const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

	const handleCancel = (subscriptionId: string, fullRefund: boolean) => {
		cancelMutation.mutate(
			{ subscriptionId, fullRefund },
			{
				onSuccess: () => setCancelConfirmId(null),
				onError: (error) =>
					showErrorToast(error, { fallback: "Failed to cancel subscription" }),
			}
		);
	};

	const handleReactivate = (subscriptionId: string) => {
		reactivateMutation.mutate(subscriptionId, {
			onError: (error) =>
				showErrorToast(error, { fallback: "Failed to reactivate subscription" }),
		});
	};

	if (isLoading) return <Loader size="lg" />;

	// Split into active and past
	const activeStatuses = [
		SubscriptionStatus.Active,
		SubscriptionStatus.Trialing,
		SubscriptionStatus.PendingApproval,
		SubscriptionStatus.PendingPayment,
		SubscriptionStatus.PastDue,
		SubscriptionStatus.Cancelled,
		SubscriptionStatus.Suspended,
	];
	const activeSubs = subscriptions.filter((s) => activeStatuses.includes(s.status));
	const pastSubs = subscriptions.filter((s) => !activeStatuses.includes(s.status));

	return (
		<div className="space-y-6">
			{/* Active Subscriptions */}
			<SettingsCard
				title="Active Subscriptions"
				description="Manage your current club subscriptions."
			>
				{activeSubs.length === 0 ? (
					<EmptyState
						icon={Repeat}
						title="No active subscriptions"
						description="Subscribe to a club's plan to get recurring access to events and benefits."
					/>
				) : (
					<div className="space-y-4">
						{activeSubs.map((sub) => (
							<SubscriptionCard
								key={sub.id}
								subscription={sub}
								onCancel={() => setCancelConfirmId(sub.id)}
								onReactivate={() => handleReactivate(sub.id)}
								onUpdatePayment={() => updatePaymentMutation.mutate(sub.id)}
							/>
						))}
					</div>
				)}
			</SettingsCard>

			{/* Past Subscriptions */}
			{pastSubs.length > 0 && (
				<SettingsCard title="Past Subscriptions">
					<div className="space-y-3">
						{pastSubs.map((sub) => (
							<SubscriptionCard key={sub.id} subscription={sub} />
						))}
					</div>
				</SettingsCard>
			)}

			{/* Cancel confirmation modal */}
			{cancelConfirmId && (
				<CancelConfirmModal
					subscription={subscriptions.find((s) => s.id === cancelConfirmId)!}
					onConfirm={handleCancel}
					onClose={() => setCancelConfirmId(null)}
					isPending={cancelMutation.isPending}
				/>
			)}
		</div>
	);
}

function SubscriptionCard({
	subscription: sub,
	onCancel,
	onReactivate,
	onUpdatePayment,
}: {
	subscription: Subscription;
	onCancel?: () => void;
	onReactivate?: () => void;
	onUpdatePayment?: () => void;
}) {
	const config = statusConfig[sub.status];
	const currencySymbol =
		sub.currency === "gbp" ? "\u00a3" : sub.currency.toUpperCase() + " ";

	return (
		<div className="p-4 rounded-xl bg-surface border border-border space-y-3">
			<div className="flex items-start justify-between">
				<div>
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-foreground">
							{sub.planName}
						</span>
						<Badge variant={config.variant}>{config.label}</Badge>
					</div>
					<div className="text-xs text-muted mt-1 space-x-2">
						<span>
							{currencySymbol}
							{sub.pricePerPeriod.toFixed(2)} /{" "}
							{intervalLabels[sub.billingInterval]}
						</span>
						{sub.currentPeriodEnd && (
							<span>
								&middot;{" "}
								{sub.status === SubscriptionStatus.Cancelled
									? "Ends"
									: "Renews"}{" "}
								{new Date(sub.currentPeriodEnd).toLocaleDateString()}
							</span>
						)}
						{sub.trialEndsAt &&
							sub.status === SubscriptionStatus.Trialing && (
								<span>
									&middot; Trial ends{" "}
									{new Date(sub.trialEndsAt).toLocaleDateString()}
								</span>
							)}
					</div>
				</div>
			</div>

			{/* Actions based on status */}
			<div className="flex items-center gap-2 flex-wrap">
				{(sub.status === SubscriptionStatus.Active ||
					sub.status === SubscriptionStatus.Trialing) && (
					<>
						{onCancel && (
							<Button
								variant="outline"
								size="sm"
								onClick={onCancel}
								leftIcon={<X size={14} />}
							>
								Cancel
							</Button>
						)}
					</>
				)}
				{sub.status === SubscriptionStatus.Cancelled &&
					sub.cancelAt &&
					new Date(sub.cancelAt) > new Date() &&
					onReactivate && (
						<Button
							variant="outline"
							size="sm"
							onClick={onReactivate}
							leftIcon={<RotateCcw size={14} />}
						>
							Reactivate
						</Button>
					)}
				{sub.status === SubscriptionStatus.Suspended && onReactivate && (
					<Button
						variant="outline"
						size="sm"
						onClick={onReactivate}
						leftIcon={<RotateCcw size={14} />}
					>
						Resume
					</Button>
				)}
				{sub.status === SubscriptionStatus.PastDue && onUpdatePayment && (
					<Button
						size="sm"
						onClick={onUpdatePayment}
						leftIcon={<CreditCard size={14} />}
					>
						Update Payment Method
					</Button>
				)}
				{sub.pendingPlanChangeId && (
					<Badge variant="info">Tier change pending</Badge>
				)}
			</div>

			{/* Grace period warning */}
			{sub.status === SubscriptionStatus.PastDue && (
				<div className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">
					Your payment failed. Please update your payment method to avoid
					losing access.
				</div>
			)}

			{/* Cooling-off info */}
			{sub.coolingOffEndsAt &&
				new Date(sub.coolingOffEndsAt) > new Date() &&
				sub.status === SubscriptionStatus.Active && (
					<div className="text-xs text-accent bg-accent/10 p-2 rounded-lg">
						Cooling-off period active until{" "}
						{new Date(sub.coolingOffEndsAt).toLocaleDateString()}. Cancel
						for a full refund.
					</div>
				)}
		</div>
	);
}

function CancelConfirmModal({
	subscription,
	onConfirm,
	onClose,
	isPending,
}: {
	subscription: Subscription;
	onConfirm: (subscriptionId: string, fullRefund: boolean) => void;
	onClose: () => void;
	isPending: boolean;
}) {
	const canRefund =
		subscription.coolingOffEndsAt &&
		new Date(subscription.coolingOffEndsAt) > new Date();

	return (
		<Modal isOpen onClose={onClose} title="Cancel Subscription">
			<div className="p-4 space-y-4 min-w-80">
				<p className="text-sm text-muted">
					Are you sure you want to cancel your{" "}
					<strong className="text-foreground">
						{subscription.planName}
					</strong>{" "}
					subscription?
				</p>
				{canRefund && (
					<div className="text-sm text-accent bg-accent/10 p-3 rounded-lg">
						You are within your cooling-off period. You can cancel for a
						full refund.
					</div>
				)}
				{!canRefund && subscription.currentPeriodEnd && (
					<p className="text-xs text-muted">
						Your access will continue until{" "}
						{new Date(
							subscription.currentPeriodEnd
						).toLocaleDateString()}
						.
					</p>
				)}
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={onClose}
						className="flex-1"
					>
						Keep Subscription
					</Button>
					{canRefund ? (
						<Button
							variant="destructive"
							onClick={() =>
								onConfirm(subscription.id, true)
							}
							disabled={isPending}
							className="flex-1"
						>
							{isPending ? "Cancelling..." : "Cancel & Refund"}
						</Button>
					) : (
						<Button
							variant="destructive"
							onClick={() =>
								onConfirm(subscription.id, false)
							}
							disabled={isPending}
							className="flex-1"
						>
							{isPending
								? "Cancelling..."
								: "Cancel Subscription"}
						</Button>
					)}
				</div>
			</div>
		</Modal>
	);
}
