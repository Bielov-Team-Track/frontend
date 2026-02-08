"use client";

import { useState } from "react";
import { SettingsCard } from "@/components/layout/settings-layout";
import { Button, EmptyState, Loader } from "@/components/ui";
import { Plus, Users, CreditCard } from "lucide-react";
import { useClubPlans, useClubSubscriptions, usePendingSubscriptions } from "@/hooks/useSubscriptions";
import PlanList from "./PlanList";
import PlanFormModal from "./PlanFormModal";
import SubscriberList from "./SubscriberList";
import ApprovalQueue from "./ApprovalQueue";

interface Props {
	clubId: string;
}

export default function ClubSubscriptionsSettings({ clubId }: Props) {
	const [createPlanOpen, setCreatePlanOpen] = useState(false);

	const { data: plans = [], isLoading: plansLoading } = useClubPlans(clubId);
	const { data: subscriptions = [], isLoading: subsLoading } = useClubSubscriptions(clubId);
	const { data: pending = [], isLoading: pendingLoading } = usePendingSubscriptions(clubId);

	if (plansLoading) return <Loader size="lg" />;

	return (
		<div className="space-y-6">
			{/* Subscription Plans */}
			<SettingsCard title="Subscription Plans" description="Create and manage subscription plans for your club members.">
				{plans.length === 0 ? (
					<EmptyState
						icon={CreditCard}
						title="No subscription plans"
						description="Create your first subscription plan to start accepting recurring payments from members."
						action={{ label: "Create Plan", onClick: () => setCreatePlanOpen(true) }}
					/>
				) : (
					<div className="space-y-4">
						<PlanList plans={plans} clubId={clubId} />
						<Button
							type="button"
							variant="outline"
							onClick={() => setCreatePlanOpen(true)}
							leftIcon={<Plus size={16} />}
							className="w-full"
						>
							Add Plan
						</Button>
					</div>
				)}
			</SettingsCard>

			{/* Pending Approvals */}
			{pending.length > 0 && (
				<SettingsCard
					title={`Pending Approvals (${pending.length})`}
					description="Review and approve or reject subscription applications."
				>
					<ApprovalQueue subscriptions={pending} clubId={clubId} />
				</SettingsCard>
			)}

			{/* All Subscribers */}
			<SettingsCard title="Subscribers" description="View all active and past subscribers.">
				{subsLoading ? (
					<Loader />
				) : subscriptions.length === 0 ? (
					<EmptyState icon={Users} title="No subscribers yet" description="Subscribers will appear here once members subscribe to a plan." />
				) : (
					<SubscriberList subscriptions={subscriptions} clubId={clubId} />
				)}
			</SettingsCard>

			{/* Create Plan Modal */}
			<PlanFormModal open={createPlanOpen} onClose={() => setCreatePlanOpen(false)} clubId={clubId} />
		</div>
	);
}
