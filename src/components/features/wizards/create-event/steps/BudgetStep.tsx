"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PricingModel } from "@/lib/models/EventBudget";
import { Controller } from "react-hook-form";
import { WizardStepProps } from "../../core/types";
import { EventFormData } from "../types";

const pricingOptions = [
	{ value: PricingModel.PerPerson, label: "Per Person" },
	{ value: PricingModel.PerTeam, label: "Per Team" },
	{ value: PricingModel.Fixed, label: "Fixed Total" },
];

export function BudgetStep({ form }: WizardStepProps<EventFormData>) {
	const {
		register,
		control,
		watch,
		formState: { errors },
	} = form;
	const useBudget = watch("useBudget");

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Budget</h2>
				<p className="text-muted-foreground text-sm">Set up costs and payment options.</p>
			</div>

			<div className="space-y-4">
				<Controller
					name="useBudget"
					control={control}
					render={({ field }) => (
						<Checkbox checked={field.value} onChange={field.onChange} label="Enable Budget" helperText="Collect payments from participants" />
					)}
				/>

				{useBudget && (
					<div className="space-y-4 pl-4 border-l-2 border-primary/20">
						<Input
							type="number"
							label="Cost"
							min={0}
							step={0.01}
							error={errors.budget?.cost?.message}
							{...register("budget.cost", { valueAsNumber: true })}
						/>

						<Controller
							name="budget.pricingModel"
							control={control}
							render={({ field }) => <Select label="Pricing Model" options={pricingOptions} value={field.value} onChange={field.onChange} />}
						/>

						<Controller
							name="budget.payToJoin"
							control={control}
							render={({ field }) => (
								<Checkbox checked={field.value} onChange={field.onChange} label="Pay to Join" helperText="Require payment to confirm spot" />
							)}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
