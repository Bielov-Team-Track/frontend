import { Controller } from "react-hook-form";
import { useEventFormContext } from "../context/EventFormContext";
import { Coins, Clock, User, Users, Calculator } from "lucide-react";
import { PricingModel } from "@/lib/models/EventBudget";
import { Checkbox, Input, RadioCards } from "@/components/ui";
import { useState } from "react";
import PaymentMethodsSelector from "../components/PaymentMethodsSelector";
import { usePaymentAccount } from "../hooks/usePaymentAccount";

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
	const [useBudget, setIgnoreBudget] = useState(false);
	const { form } = useEventFormContext();
	const { account, status, canAcceptPayments, isLoading } = usePaymentAccount();
	const {
		control,
		formState: { errors },
		watch,
	} = form;
	const values = watch();

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-white mb-1">Event Budget</h2>
				<p className="text-muted text-sm">
					Configure payment settings. Without budget you cannot collect payments or audit the event.
				</p>
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
							onChange={(e) => {
								onChange(e);
								e.target.checked ? setIgnoreBudget(true) : setIgnoreBudget(false);
							}}
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
				<div className="p-4 rounded-xl bg-white/5 border border-white/10">
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
				</div>
			)}
		</div>
	);
};

export default EventBudgetStep;
