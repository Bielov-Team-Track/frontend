import { Controller, Control } from "react-hook-form";
import { PaymentMethod } from "@/lib/models/EventBudget";
import { PaymentAccountStatus } from "@/lib/models/Payment";
import { Banknote, CreditCard, Settings, AlertCircle, Check } from "lucide-react";
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
		<div className="space-y-3">
			<label className="text-sm font-medium text-white">Payment Methods</label>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{/* Cash Option */}
				<Controller
					name="budget.paymentMethods"
					control={control}
					render={({ field: { value = [], onChange } }) => {
						const isSelected = value.includes(PaymentMethod.Cash);
						return (
							<button
								type="button"
								disabled={disabled}
								onClick={() => {
									const newMethods = isSelected
										? value.filter((m: PaymentMethod) => m !== PaymentMethod.Cash)
										: [...value, PaymentMethod.Cash];
									onChange(newMethods);
								}}
								className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${
									disabled
										? "opacity-50 cursor-not-allowed bg-white/5 border-white/5"
										: isSelected
											? "bg-accent/10 border-accent shadow-[0_0_15px_rgba(249,115,22,0.15)]"
											: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
								}`}
							>
								<div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
									isSelected ? "bg-accent/20" : "bg-white/10"
								}`}>
									<Banknote size={20} className={isSelected ? "text-accent" : "text-muted"} />
								</div>
								<div className="font-medium text-white text-sm mb-1">Cash</div>
								<div className="text-xs text-muted leading-relaxed">
									Accept cash payments from participants
								</div>
								{isSelected && (
									<div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
										<Check size={12} className="text-white" strokeWidth={3} />
									</div>
								)}
							</button>
						);
					}}
				/>

				{/* Card Option */}
				<Controller
					name="budget.paymentMethods"
					control={control}
					render={({ field: { value = [], onChange } }) => {
						const isSelected = value.includes(PaymentMethod.Card);

						if (!isCardAvailable) {
							return (
								<div className="relative p-4 rounded-xl border border-white/10 bg-white/5 text-left">
									<div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white/10">
										<CreditCard size={20} className="text-muted/50" />
									</div>
									<div className="flex items-center gap-2 mb-1">
										<span className="font-medium text-white/50 text-sm">Card (Stripe)</span>
										<span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-medium">
											Setup Required
										</span>
									</div>
									<div className="text-xs text-muted/50 leading-relaxed mb-3">
										Accept card payments via Stripe
									</div>
									<Link
										href="/profile/settings/payments"
										className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
										target="_blank"
									>
										<Settings size={12} />
										<span>Set up Payment Account</span>
									</Link>
								</div>
							);
						}

						return (
							<button
								type="button"
								disabled={disabled}
								onClick={() => {
									const newMethods = isSelected
										? value.filter((m: PaymentMethod) => m !== PaymentMethod.Card)
										: [...value, PaymentMethod.Card];
									onChange(newMethods);
								}}
								className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${
									disabled
										? "opacity-50 cursor-not-allowed bg-white/5 border-white/5"
										: isSelected
											? "bg-accent/10 border-accent shadow-[0_0_15px_rgba(249,115,22,0.15)]"
											: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
								}`}
							>
								<div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
									isSelected ? "bg-accent/20" : "bg-white/10"
								}`}>
									<CreditCard size={20} className={isSelected ? "text-accent" : "text-muted"} />
								</div>
								<div className="font-medium text-white text-sm mb-1">Card (Stripe)</div>
								<div className="text-xs text-muted leading-relaxed">
									Accept card payments via Stripe
								</div>
								{isSelected && (
									<div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
										<Check size={12} className="text-white" strokeWidth={3} />
									</div>
								)}
							</button>
						);
					}}
				/>
			</div>

			{error && (
				<div className="flex items-center gap-1.5 text-red-400 animate-in slide-in-from-top-1 fade-in duration-200">
					<AlertCircle size={14} />
					<span className="text-xs">{error}</span>
				</div>
			)}
		</div>
	);
};

export default PaymentMethodsSelector;
