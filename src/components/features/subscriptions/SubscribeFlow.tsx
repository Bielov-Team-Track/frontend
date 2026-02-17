"use client";

import { useState } from "react";
import { SubscriptionPlan } from "@/lib/models/Subscription";
import { useClubPlans } from "@/hooks/useSubscriptions";
import { Loader } from "@/components/ui";
import PlanSelectionGrid from "./PlanSelectionGrid";
import SubscriptionPaymentForm from "./SubscriptionPaymentForm";
import { CheckCircle } from "lucide-react";

interface Props {
	clubId: string;
}

type Step = "select" | "payment" | "success";

export default function SubscribeFlow({ clubId }: Props) {
	const { data: plans = [], isLoading } = useClubPlans(clubId);
	const [step, setStep] = useState<Step>("select");
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

	if (isLoading) return <Loader size="lg" />;

	if (step === "success") {
		return (
			<div className="text-center py-12 space-y-4">
				<CheckCircle size={48} className="text-accent mx-auto" />
				<h2 className="text-xl font-semibold text-foreground">Subscription Started!</h2>
				<p className="text-muted">
					{selectedPlan?.requiresApproval
						? "Your application has been submitted. You'll be notified when it's reviewed."
						: "Your subscription is now active. Enjoy your membership!"}
				</p>
			</div>
		);
	}

	if (step === "payment" && selectedPlan) {
		return (
			<SubscriptionPaymentForm
				plan={selectedPlan}
				onSuccess={() => setStep("success")}
				onBack={() => {
					setStep("select");
					setSelectedPlan(null);
				}}
			/>
		);
	}

	return (
		<PlanSelectionGrid
			plans={plans}
			onSelectPlan={(plan) => {
				setSelectedPlan(plan);
				setStep("payment");
			}}
		/>
	);
}
