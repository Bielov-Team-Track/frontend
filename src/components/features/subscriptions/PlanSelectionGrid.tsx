"use client";

import { useState } from "react";
import { SubscriptionPlan, BillingInterval } from "@/lib/models/Subscription";
import PlanCard from "./PlanCard";

interface Props {
	plans: SubscriptionPlan[];
	onSelectPlan: (plan: SubscriptionPlan) => void;
}

export default function PlanSelectionGrid({ plans, onSelectPlan }: Props) {
	const [selectedInterval, setSelectedInterval] = useState<BillingInterval>(BillingInterval.Monthly);

	// Get unique billing intervals available
	const availableIntervals = [...new Set(plans.map((p) => p.billingInterval))];

	// Filter plans by selected interval
	const filteredPlans = plans.filter((p) => p.billingInterval === selectedInterval && p.isActive);

	// Find the "most popular" plan (highest subscriber count)
	const popularPlanId = filteredPlans.length > 0
		? filteredPlans.reduce((a, b) => a.currentSubscriberCount > b.currentSubscriberCount ? a : b).id
		: null;

	return (
		<div className="space-y-6">
			{/* Billing interval toggle */}
			{availableIntervals.length > 1 && (
				<div className="flex justify-center">
					<div className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-elevated">
						{availableIntervals.map((interval) => (
							<button
								key={interval}
								onClick={() => setSelectedInterval(interval)}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									selectedInterval === interval
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{interval}
								{interval === BillingInterval.Annually && (
									<span className="ml-1 text-xs text-accent">Save 20%</span>
								)}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Plan cards grid */}
			<div className={`grid gap-6 ${
				filteredPlans.length === 1 ? "max-w-sm mx-auto" :
				filteredPlans.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" :
				"grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
			}`}>
				{filteredPlans.map((plan) => (
					<PlanCard
						key={plan.id}
						plan={plan}
						isPopular={plan.id === popularPlanId && filteredPlans.length > 1}
						onSelect={onSelectPlan}
					/>
				))}
			</div>
		</div>
	);
}
