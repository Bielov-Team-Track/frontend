import { SubscriptionPlan, BillingInterval } from "@/lib/models/Subscription";
import { Info } from "lucide-react";

interface Props {
	plan: SubscriptionPlan;
}

const intervalText: Record<BillingInterval, string> = {
	[BillingInterval.Monthly]: "monthly",
	[BillingInterval.Quarterly]: "every 3 months",
	[BillingInterval.Annually]: "annually",
};

export default function PreContractInfo({ plan }: Props) {
	const currencySymbol = plan.currency === "gbp" ? "£" : plan.currency.toUpperCase() + " ";

	return (
		<div className="rounded-xl border border-border bg-surface p-4 space-y-3">
			<div className="flex items-center gap-2 text-sm font-medium text-foreground">
				<Info size={16} className="text-accent" />
				Subscription Information
			</div>
			<div className="space-y-2 text-xs text-muted">
				<p>
					<strong className="text-foreground">Renewal:</strong> Your subscription will automatically renew{" "}
					{intervalText[plan.billingInterval]} at {currencySymbol}
					{plan.price.toFixed(2)}. You will be charged on each renewal date.
				</p>
				<p>
					<strong className="text-foreground">Cancellation:</strong> You can cancel at any time from your
					subscription settings. Your access continues until the end of the current billing period.
				</p>
				<p>
					<strong className="text-foreground">Cooling-off period:</strong> You have 14 days from your first
					payment to cancel for a full refund under the Consumer Contracts Regulations.
				</p>
				{plan.trialDays && plan.trialDays > 0 && (
					<p>
						<strong className="text-foreground">Free trial:</strong> Your {plan.trialDays}-day trial starts
						immediately. You will not be charged until the trial ends. Cancel anytime during the trial at no
						cost.
					</p>
				)}
			</div>
		</div>
	);
}
