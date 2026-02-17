"use client";

import { Modal, Input, Button, Checkbox } from "@/components/ui";
import { useForm, Controller } from "react-hook-form";
import { SubscriptionPlan, PlanCategory, BillingInterval, CreatePlanRequest, UpdatePlanRequest } from "@/lib/models/Subscription";
import { useCreatePlan, useUpdatePlan } from "@/hooks/useSubscriptions";

interface Props {
	open: boolean;
	onClose: () => void;
	clubId: string;
	plan?: SubscriptionPlan;
}

interface FormValues {
	name: string;
	description: string;
	category: PlanCategory;
	billingInterval: BillingInterval;
	price: number;
	currency: string;
	trialDays: number;
	maxSubscribers: number | null;
	maxMembers: number | null;
	requiresApproval: boolean;
}

export default function PlanFormModal({ open, onClose, clubId, plan }: Props) {
	const isEdit = !!plan;
	const createMutation = useCreatePlan(clubId);
	const updateMutation = useUpdatePlan(clubId);

	const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
		defaultValues: plan
			? {
				name: plan.name,
				description: plan.description || "",
				category: plan.category,
				billingInterval: plan.billingInterval,
				price: plan.price,
				currency: plan.currency,
				trialDays: plan.trialDays || 0,
				maxSubscribers: plan.maxSubscribers || null,
				maxMembers: plan.maxMembers || null,
				requiresApproval: plan.requiresApproval,
			}
			: {
				name: "",
				description: "",
				category: PlanCategory.Adult,
				billingInterval: BillingInterval.Monthly,
				price: 0,
				currency: "gbp",
				trialDays: 0,
				maxSubscribers: null,
				maxMembers: null,
				requiresApproval: false,
			},
	});

	const onSubmit = (data: FormValues) => {
		if (isEdit && plan) {
			updateMutation.mutate(
				{
					planId: plan.id,
					plan: {
						name: data.name,
						description: data.description || undefined,
						maxSubscribers: data.maxSubscribers || undefined,
						maxMembers: data.maxMembers || undefined,
						requiresApproval: data.requiresApproval,
					} as UpdatePlanRequest,
				},
				{ onSuccess: onClose }
			);
		} else {
			const request: CreatePlanRequest = {
				name: data.name,
				description: data.description || undefined,
				category: data.category,
				billingInterval: data.billingInterval,
				price: data.price,
				currency: data.currency,
				trialDays: data.trialDays || undefined,
				maxSubscribers: data.maxSubscribers || undefined,
				maxMembers: data.maxMembers || undefined,
				requiresApproval: data.requiresApproval,
			};
			createMutation.mutate(request, { onSuccess: onClose });
		}
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	return (
		<Modal isOpen={open} onClose={onClose} title={isEdit ? "Edit Plan" : "Create Subscription Plan"} preventOutsideClose>
			<form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 min-w-100">
				<Input
					{...register("name", { required: "Plan name is required" })}
					label="Plan Name"
					placeholder="e.g. Adult Membership"
					required
					error={errors.name?.message}
				/>

				<Input
					{...register("description")}
					label="Description"
					placeholder="What's included in this plan"
				/>

				{!isEdit && (
					<>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">Category</label>
								<select {...register("category")} className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm">
									{Object.values(PlanCategory).map((cat) => (
										<option key={cat} value={cat}>{cat}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-1">Billing Interval</label>
								<select {...register("billingInterval")} className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm">
									{Object.values(BillingInterval).map((interval) => (
										<option key={interval} value={interval}>{interval}</option>
									))}
								</select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<Input
								{...register("price", { required: "Price is required", valueAsNumber: true, min: 0 })}
								label="Price"
								type="number"
								step="0.01"
								required
								error={errors.price?.message}
							/>
							<Input
								{...register("currency")}
								label="Currency"
								placeholder="gbp"
							/>
						</div>

						<Input
							{...register("trialDays", { valueAsNumber: true })}
							label="Trial Days"
							type="number"
							placeholder="0"
						/>
					</>
				)}

				<div className="grid grid-cols-2 gap-4">
					<Input
						{...register("maxSubscribers", { valueAsNumber: true })}
						label="Max Subscribers"
						type="number"
						placeholder="Unlimited"
					/>
					<Input
						{...register("maxMembers", { valueAsNumber: true })}
						label="Max Family Members"
						type="number"
						placeholder="None"
					/>
				</div>

				<Controller
					name="requiresApproval"
					control={control}
					render={({ field: { value, onChange } }) => (
						<Checkbox
							checked={value}
							onChange={onChange}
							label="Require admin approval"
							helperText="New subscribers must be approved by a club admin before payment."
						/>
					)}
				/>

				<div className="flex justify-end gap-2 pt-2">
					<Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Saving..." : isEdit ? "Update Plan" : "Create Plan"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
