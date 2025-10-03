import { Controller } from "react-hook-form";
import { useEventFormContext } from "../context/EventFormContext";
import { FaCoins, FaDoorOpen } from "react-icons/fa6";
import { PricingModel, PricingModelOptions, PaymentMethod } from "@/lib/models/EventBudget";
import { Checkbox, Select, Input } from "@/components/ui";
import { useState } from "react";
import PaymentMethodsSelector from "../components/PaymentMethodsSelector";
import { usePaymentAccount } from "../hooks/usePaymentAccount";

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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <span className="w-12 h-12 text-[48px] mx-auto mb-3">🪙</span>
        <h2 className="text-xl font-semibold text-base-content mb-2">
          Event Budget
        </h2>
        <p className="text-base-content/60">
          Configure the budget and payment settings for your event. Without
          budget you can't get payments and audit event afterwards.
        </p>
      </div>

      <Controller
        name="useBudget"
        control={control}
        render={({ field }) => (
          <Checkbox
            {...field}
            label="Use budget"
            onChange={(e) => {
              e.target.checked ? setIgnoreBudget(true) : setIgnoreBudget(false);
            }}
          />
        )}
      />

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
          <Select
            {...field}
            required
            disabled={!useBudget}
            options={PricingModelOptions}
            label="Payment type"
            leftIcon={<FaCoins />}
            error={errors.budget?.pricingModel?.message}
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
            label="Cost"
            leftIcon={<FaCoins />}
            helperText="For 'Fixed' pricing: price per person/team. For 'Budget' pricing: total event budget."
            error={errors.budget?.pricingModel?.message}
          />
        )}
      />

      {values.budget?.pricingModel === PricingModel.Fixed && (
        <Controller
          name="budget.payToJoin"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              variant="secondary"
              disabled={!useBudget}
              label="Require payment to join event"
              helperText="If enabled, participants must complete payment to confirm their registration."
            />
          )}
        />
      )}

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
            leftIcon={<FaDoorOpen />}
            helperText="Number of hours before event start when participants can no longer drop out (for budget events)."
            error={errors.budget?.pricingModel?.message}
          />
        )}
      />
    </div>
  );
};

export default EventBudgetStep;
