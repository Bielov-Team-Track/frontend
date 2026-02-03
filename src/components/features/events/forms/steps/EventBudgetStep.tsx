import { Checkbox, Input, RadioCards, Select } from "@/components/ui";
import { PricingModel } from "@/lib/models/EventBudget";
import { Bell, Calculator, Clock, Coins, User, Users } from "lucide-react";
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

const EventBudgetStep = () => {
	const { form } = useEventFormContext();
	const { account, status, canAcceptPayments, isLoading } = usePaymentAccount();
	const {
		control,
		formState: { errors },
		watch,
	} = form;
	const values = watch();
	const useBudget = values.useBudget;

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="budget-step">
			<div className="border-b-2 pb-4">
				<h2 className="text-xl font-bold text-white mb-1">Event Budget</h2>
				<p className="text-muted text-sm">Configure payment settings. Without budget you cannot collect payments or audit the event.</p>
			</div>

			<div className="p-4 rounded-xl bg-white/5 border border-white/10">
				<Controller
					name="useBudget"
					control={control}
					render={({ field: { value, onChange, ...field } }) => (
						<Checkbox
							{...field}
							checked={value}
							label="Enable budget management"
							helperText="Track payments and manage event finances"
							onChange={onChange}
							data-testid="use-budget-checkbox"
						/>
					)}
				/>
			</div>

			{useBudget && (
				<PaymentMethodsSelector
					control={control}
					accountStatus={status}
					canAcceptPayments={canAcceptPayments}
					disabled={!useBudget}
					error={errors.budget?.paymentMethods?.message}
				/>
			)}

			<Controller
				name="budget.pricingModel"
				control={control}
				render={({ field }) => (
					<RadioCards
						label="Pricing Model"
						options={pricingModelCards}
						value={field.value}
						onChange={field.onChange}
						error={errors.budget?.pricingModel?.message}
						disabled={!useBudget}
						columns={3}
					/>
				)}
			/>

			<Controller
				name="budget.cost"
				control={control}
				render={({ field }) => (
					<Input
						{...field}
						required
						type="number"
						min={1}
						disabled={!useBudget}
						label={values.budget?.pricingModel === PricingModel.Event ? "Total Budget" : "Cost per Unit"}
						leftIcon={<Coins size={16} />}
						helperText={
							values.budget?.pricingModel === PricingModel.Event
								? "Total event cost to be split between all participants"
								: values.budget?.pricingModel === PricingModel.Team
								? "Fixed price each team will pay"
								: "Fixed price each person will pay"
						}
						error={errors.budget?.cost?.message}
					/>
				)}
			/>

			<Controller
				name="budget.dropoutDeadlineHours"
				control={control}
				render={({ field }) => (
					<Input
						{...field}
						type="number"
						optional
						disabled={!useBudget}
						label="Dropout Deadline (hours)"
						leftIcon={<Clock size={16} />}
						helperText="Hours before event start when participants can no longer drop out"
						error={errors.budget?.dropoutDeadlineHours?.message}
					/>
				)}
			/>

			{values.budget?.pricingModel === PricingModel.Individual && (
				<div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
					<Controller
						name="budget.payToJoin"
						control={control}
						render={({ field: { value, onChange, ...field } }) => (
							<Checkbox
								{...field}
								checked={value}
								onChange={onChange}
								disabled={!useBudget}
								label="Require payment to join"
								helperText="Participants must complete payment to confirm their registration"
							/>
						)}
					/>

					{values.budget?.payToJoin && (
						<Controller
							name="budget.paymentReminderDaysBefore"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									value={field.value?.toString() || ""}
									onChange={(val) => field.onChange(val ? parseInt(val, 10) : null)}
									options={reminderOptions}
									disabled={!useBudget}
									label="Payment Reminder"
									leftIcon={<Bell size={16} />}
									helperText="Send a reminder email to unpaid participants before the event"
								/>
							)}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default EventBudgetStep;
