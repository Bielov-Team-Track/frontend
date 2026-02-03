"use client";

import { Checkbox, Input, RadioCards } from "@/components/ui";
import { PricingModel } from "@/lib/models/EventBudget";
import { Calculator, Clock, Coins, User, Users } from "lucide-react";
import { useEventSettingsContext } from "../EventSettingsContext";
import { SettingsSection } from "./SettingsSection";

const pricingModelCards = [
	{
		value: PricingModel.Individual,
		label: "Per Person",
		description: "Each participant pays a fixed amount",
		icon: User,
	},
	{
		value: PricingModel.Team,
		label: "Per Team",
		description: "Each team pays a fixed amount",
		icon: Users,
	},
	{
		value: PricingModel.Event,
		label: "Split Cost",
		description: "Total cost divided between all participants",
		icon: Calculator,
	},
];

export function PaymentsSection() {
	const { formData, updateField, updateNestedField } = useEventSettingsContext();

	const handleBudgetToggle = (enabled: boolean) => {
		updateField("useBudget", enabled);
		if (enabled && !formData.budget) {
			updateField("budget", {
				pricingModel: PricingModel.Individual,
				cost: 0,
				payToJoin: false,
			});
		}
	};

	return (
		<SettingsSection title="Payments" description="Configure event pricing and budget">
			<div className="p-4 rounded-xl bg-white/5 border border-white/10">
				<Checkbox
					checked={formData.useBudget}
					onChange={handleBudgetToggle}
					label="Enable budget management"
					helperText="Track payments and manage event finances"
				/>
			</div>

			{formData.useBudget && (
				<>
					<RadioCards
						label="Pricing Model"
						options={pricingModelCards}
						value={formData.budget?.pricingModel as PricingModel}
						onChange={(value) => updateNestedField("budget", "pricingModel", value)}
						columns={3}
						size="sm"
					/>

					<Input
						type="number"
						label={
							formData.budget?.pricingModel === PricingModel.Event
								? "Total Budget"
								: "Cost per Unit"
						}
						value={formData.budget?.cost?.toString() || ""}
						onChange={(e) =>
							updateNestedField(
								"budget",
								"cost",
								e.target.value ? parseFloat(e.target.value) : undefined
							)
						}
						leftIcon={<Coins size={16} />}
						min={0}
						step={0.01}
						required
						helperText={
							formData.budget?.pricingModel === PricingModel.Event
								? "Total event cost to be split between all participants"
								: formData.budget?.pricingModel === PricingModel.Team
									? "Fixed price each team will pay"
									: "Fixed price each person will pay"
						}
					/>

					<Input
						type="number"
						label="Dropout Deadline (hours)"
						value={formData.budget?.dropoutDeadlineHours?.toString() || ""}
						onChange={(e) =>
							updateNestedField(
								"budget",
								"dropoutDeadlineHours",
								e.target.value ? parseInt(e.target.value) : undefined
							)
						}
						leftIcon={<Clock size={16} />}
						min={0}
						optional
						helperText="Hours before event start when participants can no longer drop out"
					/>

					{formData.budget?.pricingModel === PricingModel.Individual && (
						<div className="p-4 rounded-xl bg-white/5 border border-white/10">
							<Checkbox
								checked={formData.budget?.payToJoin || false}
								onChange={(checked) => updateNestedField("budget", "payToJoin", checked)}
								label="Require payment to join"
								helperText="Participants must complete payment to confirm their registration"
							/>
						</div>
					)}
				</>
			)}
		</SettingsSection>
	);
}
