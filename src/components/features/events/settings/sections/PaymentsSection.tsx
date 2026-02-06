"use client";

import { Checkbox, Input, RadioCards } from "@/components/ui";
import { PricingModel } from "@/lib/models/EventPaymentConfig";
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

	const handlePaymentConfigToggle = (enabled: boolean) => {
		updateField("usePaymentConfig", enabled);
		if (enabled && !formData.paymentConfig) {
			updateField("paymentConfig", {
				pricingModel: PricingModel.Individual,
				cost: 0,
				payToJoin: false,
			});
		}
	};

	return (
		<SettingsSection title="Payments" description="Configure event pricing and payment configuration">
			<div className="p-4 rounded-xl bg-surface border border-border">
				<Checkbox
					checked={formData.usePaymentConfig}
					onChange={handlePaymentConfigToggle}
					label="Enable payment configuration management"
					helperText="Track payments and manage event finances"
				/>
			</div>

			{formData.usePaymentConfig && (
				<>
					<RadioCards
						label="Pricing Model"
						options={pricingModelCards}
						value={formData.paymentConfig?.pricingModel as PricingModel}
						onChange={(value) => updateNestedField("paymentConfig", "pricingModel", value)}
						columns={3}
						size="sm"
					/>

					<Input
						type="number"
						label={
							formData.paymentConfig?.pricingModel === PricingModel.Event
								? "Total Cost"
								: "Cost per Unit"
						}
						value={formData.paymentConfig?.cost?.toString() || ""}
						onChange={(e) =>
							updateNestedField(
								"paymentConfig",
								"cost",
								e.target.value ? parseFloat(e.target.value) : undefined
							)
						}
						leftIcon={<Coins size={16} />}
						min={0}
						step={0.01}
						required
						helperText={
							formData.paymentConfig?.pricingModel === PricingModel.Event
								? "Total event cost to be split between all participants"
								: formData.paymentConfig?.pricingModel === PricingModel.Team
									? "Fixed price each team will pay"
									: "Fixed price each person will pay"
						}
					/>

					<Input
						type="number"
						label="Dropout Deadline (hours)"
						value={formData.paymentConfig?.dropoutDeadlineHours?.toString() || ""}
						onChange={(e) =>
							updateNestedField(
								"paymentConfig",
								"dropoutDeadlineHours",
								e.target.value ? parseInt(e.target.value) : undefined
							)
						}
						leftIcon={<Clock size={16} />}
						min={0}
						optional
						helperText="Hours before event start when participants can no longer drop out"
					/>

					{formData.paymentConfig?.pricingModel === PricingModel.Individual && (
						<div className="p-4 rounded-xl bg-surface border border-border">
							<Checkbox
								checked={formData.paymentConfig?.payToJoin || false}
								onChange={(checked) => updateNestedField("paymentConfig", "payToJoin", checked)}
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
