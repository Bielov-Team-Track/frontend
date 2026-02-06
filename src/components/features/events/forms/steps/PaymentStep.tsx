"use client";

import { Checkbox, RadioCards, Select, Slider } from "@/components/ui";
import { PricingModel } from "@/lib/models/EventPaymentConfig";
import { Bell, Calculator, User, Users } from "lucide-react";
import { Controller } from "react-hook-form";
import PaymentMethodsSelector from "../components/PaymentMethodsSelector";
import { useEventFormContext } from "../context/EventFormContext";
import { usePaymentAccount } from "../hooks/usePaymentAccount";

const reminderOptions = [
	{ value: "", label: "No reminder" },
	{ value: "1", label: "1 day before" },
	{ value: "3", label: "3 days before" },
	{ value: "7", label: "7 days before" },
	{ value: "14", label: "14 days before" },
];

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

export default function PaymentStep() {
	const { form } = useEventFormContext();
	const { account, status, canAcceptPayments, isLoading } = usePaymentAccount();
	const {
		control,
		formState: { errors },
		watch,
	} = form;
	const values = watch();

	const usePaymentConfig = values.usePaymentConfig;
	const pricingModel = values.paymentConfig?.pricingModel;
	const payToJoin = values.paymentConfig?.payToJoin;

	return (
		<div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="payment-step">
			{/* Payment Section Header */}
			<div className="border-b-2 pb-3 sm:pb-4">
				<h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Payment</h2>
				<p className="text-muted-foreground text-xs sm:text-sm">Configure payment settings for this event</p>
			</div>

			{/* Enable Payment Toggle */}
			<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border">
				<Controller
					name="usePaymentConfig"
					control={control}
					render={({ field: { value, onChange, ...field } }) => (
						<Checkbox
							{...field}
							checked={value}
							label="Enable payment configuration management"
							helperText="Track payments and manage event finances"
							onChange={onChange}
							data-testid="use-payment-config-checkbox"
						/>
					)}
				/>
			</div>

			{/* Payment Configuration Fields - Only show when payment is enabled */}
			{usePaymentConfig && (
				<>
					{/* Payment Methods */}
					<PaymentMethodsSelector
						control={control}
						accountStatus={status}
						canAcceptPayments={canAcceptPayments}
						disabled={false}
						error={errors.paymentConfig?.paymentMethods?.message as string | undefined}
					/>

					{/* Pricing Model */}
					<Controller
						name="paymentConfig.pricingModel"
						control={control}
						render={({ field }) => (
							<RadioCards
								label="Pricing Model"
								options={pricingModelCards}
								value={field.value}
								onChange={field.onChange}
								error={errors.paymentConfig?.pricingModel?.message as string | undefined}
								columns={3}
							/>
						)}
					/>

					{/* Cost */}
					<Controller
						name="paymentConfig.cost"
						control={control}
						render={({ field }) => (
							<Slider
								value={field.value ?? 0}
								onChange={(e) => field.onChange(e.target.value)}
								required
								min={0}
								max={pricingModel === PricingModel.Event ? 1000 : 200}
								step={pricingModel === PricingModel.Event ? 10 : 1}
								editable
								label={pricingModel === PricingModel.Event ? "Total Cost" : pricingModel === PricingModel.Team ? "Cost per Team" : "Cost per Person"}
								formatValue={(v) => `${v} £`}
								helperText={
									pricingModel === PricingModel.Event
										? "Total event cost to be split between all participants"
										: pricingModel === PricingModel.Team
										? "Fixed price each team will pay"
										: "Fixed price each person will pay"
								}
								error={errors.paymentConfig?.cost?.message as string | undefined}
								color="accent"
							/>
						)}
					/>

					{/* Pay to Join - Only show for Individual or Team pricing */}
					{(pricingModel === PricingModel.Individual || pricingModel === PricingModel.Team) && (
						<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border space-y-3 sm:space-y-4">
							<Controller
								name="paymentConfig.payToJoin"
								control={control}
								render={({ field: { value, onChange, ...field } }) => (
									<Checkbox
										{...field}
										checked={value}
										onChange={onChange}
										label="Require payment to join"
										helperText="Participants must pay before they can confirm their spot. Without this, participants join first and can pay later."
									/>
								)}
							/>

							{/* Payment Reminder - Only show when Pay to Join is ON */}
							{payToJoin && (
								<Controller
									name="paymentConfig.paymentReminderDaysBefore"
									control={control}
									render={({ field }) => (
										<Select
											{...field}
											value={field.value?.toString() || ""}
											onChange={(val) => field.onChange(val ? parseInt(val, 10) : null)}
											options={reminderOptions}
											label="Payment Reminder"
											leftIcon={<Bell size={16} />}
											helperText="Send a reminder email to unpaid participants before the event"
										/>
									)}
								/>
							)}
						</div>
					)}

					{/* Dropout Deadline */}
					<Controller
						name="paymentConfig.dropoutDeadlineHours"
						control={control}
						render={({ field }) => (
							<Slider
								value={field.value ?? null}
								onChange={(e) => field.onChange(e.target.value)}
								min={0}
								max={72}
								step={1}
								editable
								clearable
								placeholder="Not set"
								label="Dropout Deadline"
								formatValue={(v) => `${v}h`}
								helperText="Hours before event start when participants can no longer drop out without penalty"
								error={errors.paymentConfig?.dropoutDeadlineHours?.message as string | undefined}
								color="accent"
							/>
						)}
					/>
				</>
			)}
		</div>
	);
}
