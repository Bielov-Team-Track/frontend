import * as yup from "yup";
import { PaymentMethod } from "@/lib/models/EventBudget";
import { PaymentAccountStatus } from "@/lib/models/Payment";

export const paymentMethodsValidationSchema = yup.object().shape({
	paymentMethods: yup
		.array()
		.of(yup.string().oneOf(Object.values(PaymentMethod)))
		.min(1, "Select at least one payment method")
		.test(
			"card-requires-account",
			"Card payments require a verified payment account",
			function (value) {
				const { accountStatus, canAcceptPayments } = this.parent;

				if (value && value.includes(PaymentMethod.Card)) {
					return (
						canAcceptPayments && accountStatus === PaymentAccountStatus.Active
					);
				}

				return true;
			},
		),
});

export const validatePaymentMethods = (
	methods: PaymentMethod[],
	accountStatus: PaymentAccountStatus,
	canAcceptPayments: boolean,
): { isValid: boolean; error?: string } => {
	if (!methods || methods.length === 0) {
		return { isValid: false, error: "Select at least one payment method" };
	}

	if (methods.includes(PaymentMethod.Card) && !canAcceptPayments) {
		return {
			isValid: false,
			error: "Card payments require a verified payment account",
		};
	}

	return { isValid: true };
};
