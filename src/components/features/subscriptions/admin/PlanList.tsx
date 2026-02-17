"use client";

import { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Edit2, Trash2 } from "lucide-react";
import { SubscriptionPlan, PlanCategory, BillingInterval } from "@/lib/models/Subscription";
import { useDeletePlan } from "@/hooks/useSubscriptions";
import PlanFormModal from "./PlanFormModal";

interface Props {
	plans: SubscriptionPlan[];
	clubId: string;
}

const categoryLabels: Record<PlanCategory, string> = {
	[PlanCategory.Adult]: "Adult",
	[PlanCategory.Student]: "Student",
	[PlanCategory.Concession]: "Concession",
	[PlanCategory.Family]: "Family",
	[PlanCategory.Custom]: "Custom",
};

const intervalLabels: Record<BillingInterval, string> = {
	[BillingInterval.Monthly]: "/mo",
	[BillingInterval.Quarterly]: "/qtr",
	[BillingInterval.Annually]: "/yr",
};

export default function PlanList({ plans, clubId }: Props) {
	const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
	const deleteMutation = useDeletePlan(clubId);

	return (
		<>
			<div className="space-y-3">
				{plans.map((plan) => (
					<div
						key={plan.id}
						className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border"
					>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-foreground">{plan.name}</span>
								<Badge variant={plan.isActive ? "success" : "neutral"}>
									{plan.isActive ? "Active" : "Inactive"}
								</Badge>
								<Badge variant="outline">{categoryLabels[plan.category]}</Badge>
							</div>
							<div className="flex items-center gap-3 mt-1 text-xs text-muted">
								<span>
									{plan.currency.toUpperCase()} {plan.price.toFixed(2)}
									{intervalLabels[plan.billingInterval]}
								</span>
								<span>{plan.currentSubscriberCount} subscribers</span>
								{plan.maxSubscribers && <span>/ {plan.maxSubscribers} max</span>}
								{plan.requiresApproval && <span>Requires approval</span>}
							</div>
						</div>
						<div className="flex items-center gap-1">
							<Button variant="ghost" size="sm" onClick={() => setEditPlan(plan)}>
								<Edit2 size={14} />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => deleteMutation.mutate(plan.id)}
								disabled={deleteMutation.isPending}
							>
								<Trash2 size={14} />
							</Button>
						</div>
					</div>
				))}
			</div>
			{editPlan && (
				<PlanFormModal
					open={!!editPlan}
					onClose={() => setEditPlan(null)}
					clubId={clubId}
					plan={editPlan}
				/>
			)}
		</>
	);
}
