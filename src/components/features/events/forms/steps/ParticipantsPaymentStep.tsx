"use client";

import { Checkbox, CollapsibleSection, Input, RadioCards, Select } from "@/components/ui";
import { EventFormat } from "@/lib/models/Event";
import { PricingModel, Unit } from "@/lib/models/EventPaymentConfig";
import { Bell, Calculator, Clock, Coins, LayoutGrid, List, User, Users } from "lucide-react";
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

const eventFormatCards = [
	{
		value: EventFormat.Open,
		label: "Open",
		description: "Simple participant list - no teams",
		icon: List,
	},
	{
		value: EventFormat.OpenTeams,
		label: "Open Teams",
		description: "Teams with generic player slots",
		icon: Users,
	},
	{
		value: EventFormat.TeamsWithPositions,
		label: "Positions",
		description: "Teams with volleyball positions",
		icon: LayoutGrid,
	},
];

const registrationUnitCards = [
	{
		value: Unit.Individual,
		label: "Individual",
		description: "Join any team with open slot",
		icon: User,
	},
	{
		value: Unit.Team,
		label: "Team",
		description: "Register as a full team",
		icon: Users,
	},
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

export default function ParticipantsPaymentStep() {
	const { form } = useEventFormContext();
	const { account, status, canAcceptPayments, isLoading } = usePaymentAccount();
	const {
		control,
		formState: { errors },
		watch,
	} = form;
	const values = watch();

	const eventFormat = values.eventFormat;
	const usePaymentConfig = values.usePaymentConfig;
	const pricingModel = values.paymentConfig?.pricingModel;
	const payToJoin = values.paymentConfig?.payToJoin;

	return (
		<div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="participants-payment-step">
			{/* Registration Section Header */}
			<div className="border-b-2 pb-3 sm:pb-4">
				<h2 className="text-lg sm:text-xl font-bold text-white mb-1">Participants & Payment</h2>
				<p className="text-muted text-xs sm:text-sm">Configure registration format and payment settings</p>
			</div>

			{/* Event Format */}
			<Controller
				name="eventFormat"
				control={control}
				render={({ field }) => (
					<RadioCards
						label="Event Format"
						options={eventFormatCards}
						value={field.value}
						onChange={field.onChange}
						error={errors.eventFormat?.message as string | undefined}
						columns={3}
					/>
				)}
			/>

			{/* Registration Unit - Only show when format is NOT Open */}
			{eventFormat !== EventFormat.Open && (
				<Controller
					name="registrationUnit"
					control={control}
					render={({ field }) => (
						<RadioCards
							label="Registration Unit"
							options={registrationUnitCards}
							value={field.value}
							onChange={field.onChange}
							error={errors.registrationUnit?.message as string | undefined}
							columns={2}
						/>
					)}
				/>
			)}

			{/* Maximum Participants - Only show when format is Open */}
			{eventFormat === EventFormat.Open && (
				<Controller
					name="capacity"
					control={control}
					render={({ field: { value, ...field } }) => (
						<Input
							{...field}
							value={value ?? ""}
							type="number"
							label="Maximum Participants"
							leftIcon={<Users size={16} />}
							error={errors.capacity?.message as string | undefined}
							min="1"
							helperText="Leave empty for unlimited participants"
							optional
							data-testid="capacity-input"
						/>
					)}
				/>
			)}

			{/* Payment Section Header */}
			<div className="border-b-2 pb-3 sm:pb-4 mt-6 sm:mt-8">
				<h3 className="text-base sm:text-lg font-semibold text-white mb-1">Payment Configuration</h3>
				<p className="text-muted text-xs sm:text-sm">Configure payment settings for this event</p>
			</div>

			{/* Enable Payment Toggle */}
			<div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
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
							<Input
								{...field}
								required
								type="number"
								min={1}
								label={pricingModel === PricingModel.Event ? "Total Cost" : "Cost per Unit"}
								leftIcon={<Coins size={16} />}
								helperText={
									pricingModel === PricingModel.Event
										? "Total event cost to be split between all participants"
										: pricingModel === PricingModel.Team
										? "Fixed price each team will pay"
										: "Fixed price each person will pay"
								}
								error={errors.paymentConfig?.cost?.message as string | undefined}
							/>
						)}
					/>

					{/* Pay to Join - Only show for Individual or Team pricing */}
					{(pricingModel === PricingModel.Individual || pricingModel === PricingModel.Team) && (
						<div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 sm:space-y-4">
							<Controller
								name="paymentConfig.payToJoin"
								control={control}
								render={({ field: { value, onChange, ...field } }) => (
									<Checkbox
										{...field}
										checked={value}
										onChange={onChange}
										label="Require payment to join"
										helperText="Participants must complete payment to confirm their registration"
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
				</>
			)}

			{/* Advanced Section - Collapsible */}
			<CollapsibleSection label="Registration & Payment Settings" defaultOpen={false}>
				{/* Registration Type */}
				<div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
					<Controller
						name="isPublic"
						control={control}
						render={({ field: { value, onChange, ...field } }) => (
							<Checkbox
								{...field}
								checked={value}
								onChange={onChange}
								label="Open Registration"
								helperText="When disabled, only invited participants can join"
								data-testid="is-public-checkbox"
							/>
						)}
					/>
				</div>

				{/* Casual Play Format - Only show when eventType is CasualPlay */}
				{values.type === "CasualPlay" && (
					<Controller
						name="casualPlayFormat"
						control={control}
						render={({ field }) => (
							<Select
								value={field.value || ""}
								onChange={field.onChange}
								options={[
									{ value: "list", label: "List Format" },
									{ value: "openTeams", label: "Open Teams" },
									{ value: "teamsWithPositions", label: "Teams with Positions" },
								]}
								label="Casual Play Format"
								helperText="Select the format for casual play events"
							/>
						)}
					/>
				)}

				{/* Dropout Deadline - Only show when payment is enabled */}
				{usePaymentConfig && (
					<Controller
						name="paymentConfig.dropoutDeadlineHours"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								value={field.value ?? ""}
								type="number"
								label="Dropout Deadline (hours)"
								leftIcon={<Clock size={16} />}
								helperText="Hours before event start when participants can no longer drop out"
								error={errors.paymentConfig?.dropoutDeadlineHours?.message as string | undefined}
							/>
						)}
					/>
				)}
			</CollapsibleSection>
		</div>
	);
}
