"use client";

import { Badge, Button } from "@/components/ui";
import { SubscriptionPlan, PlanCategory, BillingInterval } from "@/lib/models/Subscription";
import { Check, Shield, Star } from "lucide-react";

interface Props {
	plan: SubscriptionPlan;
	isPopular?: boolean;
	onSelect: (plan: SubscriptionPlan) => void;
}

const intervalLabels: Record<BillingInterval, string> = {
	[BillingInterval.Monthly]: "month",
	[BillingInterval.Quarterly]: "quarter",
	[BillingInterval.Annually]: "year",
};

export default function PlanCard({ plan, isPopular, onSelect }: Props) {
	const isFull = plan.maxSubscribers != null && plan.currentSubscriberCount >= plan.maxSubscribers;

	return (
		<div
			className={`relative flex flex-col p-6 rounded-2xl border transition-all ${
				isPopular
					? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
					: "border-border bg-surface hover:border-accent/50"
			}`}
		>
			{isPopular && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2">
					<Badge variant="accent" className="flex items-center gap-1">
						<Star size={12} /> Most Popular
					</Badge>
				</div>
			)}

			<div className="mb-4">
				<h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
				{plan.description && (
					<p className="text-sm text-muted mt-1">{plan.description}</p>
				)}
			</div>

			<div className="mb-6">
				<div className="flex items-baseline gap-1">
					<span className="text-3xl font-bold text-foreground">
						{plan.currency === "gbp" ? "£" : plan.currency.toUpperCase()}{plan.price.toFixed(2)}
					</span>
					<span className="text-sm text-muted">/ {intervalLabels[plan.billingInterval]}</span>
				</div>
				{plan.trialDays && plan.trialDays > 0 && (
					<p className="text-xs text-accent mt-1">{plan.trialDays}-day free trial</p>
				)}
			</div>

			{plan.features && plan.features.length > 0 && (
				<ul className="space-y-2 mb-6 flex-1">
					{plan.features.map((feature, i) => (
						<li key={i} className="flex items-start gap-2 text-sm text-muted">
							<Check size={16} className="text-accent shrink-0 mt-0.5" />
							{feature}
						</li>
					))}
				</ul>
			)}

			<div className="mt-auto space-y-2">
				{plan.requiresApproval && (
					<div className="flex items-center gap-1.5 text-xs text-muted">
						<Shield size={12} />
						Requires admin approval
					</div>
				)}
				<Button
					onClick={() => onSelect(plan)}
					disabled={isFull}
					className="w-full"
					variant={isPopular ? "default" : "outline"}
				>
					{isFull ? "Plan Full" : plan.requiresApproval ? "Apply to Subscribe" : "Subscribe"}
				</Button>
			</div>
		</div>
	);
}
