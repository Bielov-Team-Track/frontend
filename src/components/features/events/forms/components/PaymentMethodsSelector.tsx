import { Controller, Control } from "react-hook-form";
import { PaymentMethod, PaymentMethodOptions } from "@/lib/models/EventBudget";
import { PaymentAccountStatus } from "@/lib/models/Payment";
import { Checkbox } from "@/components/ui";
import { FaCreditCard, FaMoneyBill, FaCog } from "react-icons/fa";
import Link from "next/link";

interface PaymentMethodsSelectorProps {
  control: Control<any>;
  accountStatus?: PaymentAccountStatus;
  canAcceptPayments?: boolean;
  disabled?: boolean;
  error?: string;
}

const PaymentMethodsSelector = ({
  control,
  accountStatus,
  canAcceptPayments = false,
  disabled = false,
  error,
}: PaymentMethodsSelectorProps) => {
  const isCardAvailable =
    canAcceptPayments && accountStatus === PaymentAccountStatus.Active;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-base-content mb-3">
          Payment Methods
        </label>
        <p className="text-sm text-base-content/60 mb-4">
          Select how participants can pay for this event
        </p>
      </div>

      <div className="space-y-3">
        {/* Cash Option - Always Available */}
        <div
          className="flex justify-between items-center space-x-3 p-4 rounded-lg border border-base-300 bg-stone-900/30"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <FaMoneyBill />
              <span className="font-medium">Cash</span>
            </div>
            <p className="text-sm text-neutral/60 mt-1">
              Accept cash payments from participants
            </p>
          </div>
          <Controller
            name="budget.paymentMethods"
            control={control}
            render={({ field: { value = [], onChange } }) => (
              <Checkbox
                checked={value.includes(PaymentMethod.Cash)}
                onChange={(e) => {
                  const newMethods = e.target.checked
                    ? [
                        ...value.filter(
                          (m: PaymentMethod) => m !== PaymentMethod.Cash
                        ),
                        PaymentMethod.Cash,
                      ]
                    : value.filter(
                        (m: PaymentMethod) => m !== PaymentMethod.Cash
                      );
                  onChange(newMethods);
                }}
                disabled={disabled}
                fullWidth={false}
              />
            )}
          />
        </div>

        {/* Card Option - Conditional */}
        <div
          className={`flex items-center space-x-3 p-4 rounded-lg border ${
            isCardAvailable
              ? "border-base-300 bg-stone-900/30"
              : "border-base-300 bg-stone-900/30"
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <FaCreditCard
                className={
                  isCardAvailable ? "text-primary" : "text-base-content/40"
                }
              />
              <span className="font-medium">Card (Stripe)</span>
              {!isCardAvailable && (
                <span className="text-xs bg-warning text-warning-content px-2 py-1 rounded">
                  Setup Required
                </span>
              )}
            </div>
            <p className="text-sm text-base-content/60 mt-1">
              Accept card payments via Stripe
            </p>
          </div>
          {isCardAvailable ? (
            <Controller
              name="budget.paymentMethods"
              control={control}
              render={({ field: { value = [], onChange } }) => (
                <Checkbox
                  checked={value.includes(PaymentMethod.Card)}
                  onChange={(e) => {
                    const newMethods = e.target.checked
                      ? [
                          ...value.filter(
                            (m: PaymentMethod) => m !== PaymentMethod.Card
                          ),
                          PaymentMethod.Card,
                        ]
                      : value.filter(
                          (m: PaymentMethod) => m !== PaymentMethod.Card
                        );
                    onChange(newMethods);
                  }}
                  fullWidth={false}
                  disabled={disabled || !isCardAvailable}
                />
              )}
            />
          ) : (
            <Link
              href="/profile/settings/payments"
              className="inline-flex items-center space-x-2 link hover:text-primary-focus text-sm font-medium"
              target="_blank"
            >
              <FaCog />
              <span>Set up Payment Account</span>
            </Link>
          )}
        </div>
      </div>

      {error && <div className="text-error text-sm mt-2">{error}</div>}
    </div>
  );
};

export default PaymentMethodsSelector;
