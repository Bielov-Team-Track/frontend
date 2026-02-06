"use client";

import React from "react";
import { UserProfile } from "@/lib/models/User";
import { usePaymentAccount } from "@/components/features/events/forms/hooks/usePaymentAccount";
import { PaymentAccountStatus } from "@/lib/models/Payment";
import {
	CreditCard,
	CheckCircle,
	Clock,
	AlertTriangle,
	ExternalLink,
	RefreshCw,
    FileText,
    DollarSign,
    Globe,
    Info
} from "lucide-react";
import { Button, Loader } from "@/components";
import { getDashboardLink } from "@/lib/api/payments";

interface PaymentSettingsProps {
	user: UserProfile;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ user }) => {
	const {
		account,
		status,
		canAcceptPayments,
		isLoading,
		error,
		createAccount,
		completeOnboarding,
		refetch,
	} = usePaymentAccount();

	const getStatusText = () => {
		switch (status) {
			case PaymentAccountStatus.Active:
				return "Account is active and ready to accept payments";
			case PaymentAccountStatus.Pending:
				return "Account setup is pending verification";
			case PaymentAccountStatus.Restricted:
				return "Account has restrictions - contact support";
			case PaymentAccountStatus.Rejected:
				return "Account was rejected - please contact support";
			case PaymentAccountStatus.Created:
				return "Account created but onboarding not completed";
			default:
				return "No payment account found";
		}
	};

	const getStatusBadge = () => {
		const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border";
		switch (status) {
			case PaymentAccountStatus.Active:
				return <span className={`${baseClasses} bg-green-500/10 text-green-400 border-green-500/20`}>Active</span>;
			case PaymentAccountStatus.Pending:
				return <span className={`${baseClasses} bg-yellow-500/10 text-yellow-400 border-yellow-500/20`}>Pending</span>;
			case PaymentAccountStatus.Restricted:
				return <span className={`${baseClasses} bg-red-500/10 text-red-400 border-red-500/20`}>Restricted</span>;
			case PaymentAccountStatus.Rejected:
				return <span className={`${baseClasses} bg-red-500/10 text-red-400 border-red-500/20`}>Rejected</span>;
			case PaymentAccountStatus.Created:
				return <span className={`${baseClasses} bg-blue-500/10 text-blue-400 border-blue-500/20`}>Created</span>;
			case PaymentAccountStatus.None:
				return <span className={`${baseClasses} bg-surface text-muted border-border`}>Not Created</span>;
			default:
				return null;
		}
	};

	const openDashboard = async () => {
		try {
			const dashboardUrl = await getDashboardLink();
			window.open(dashboardUrl, "_blank", "noopener,noreferrer");
		} catch (err: any) {
			console.error("Failed to get dashboard link:", err);
		}
	};

	return (
		<div className="flex flex-col gap-6 w-full">
            {/* Error Message */}
			{error && (
				<div className="flex items-center gap-3 text-red-400 border border-red-500/20 bg-red-500/10 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
					<AlertTriangle size={20} />
					<span className="text-sm font-medium">{error}</span>
				</div>
			)}

            {/* Main Content Card */}
			<div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
                <div className="flex flex-col gap-8">
                    {/* Status Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold text-foreground">Stripe Payment Account</h2>
                                {!isLoading && getStatusBadge()}
                            </div>
                            {!isLoading && (
                                <p className="text-sm text-muted">{getStatusText()}</p>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={refetch}
                                leftIcon={<RefreshCw size={16} />}
                                loading={isLoading}
                                className="text-muted hover:text-foreground"
                            >
                                Refresh
                            </Button>
                            {account?.createdAt && (
                                <Button
                                    leftIcon={<ExternalLink size={16} />}
                                    onClick={openDashboard}
                                    variant="outline"
                                    size="sm"
                                >
                                    Stripe Dashboard
                                </Button>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            {account ? (
                                <div className="flex flex-col gap-6">
                                    {/* Status Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Onboarding Status */}
                                        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <span className="text-sm text-muted block mb-1">Onboarding</span>
                                                {account.detailsSubmitted ? (
                                                    <div className="flex items-center gap-2 text-green-400">
                                                        <CheckCircle size={16} />
                                                        <span className="font-medium">Completed</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-yellow-400">
                                                        <Clock size={16} />
                                                        <span className="font-medium">Action Needed</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payments Status */}
                                        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <span className="text-sm text-muted block mb-1">Receive Payments</span>
                                                {account.chargesEnabled ? (
                                                    <div className="flex items-center gap-2 text-green-400">
                                                        <CheckCircle size={16} />
                                                        <span className="font-medium">Enabled</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-muted">
                                                        <AlertTriangle size={16} />
                                                        <span className="font-medium">Disabled</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payouts Status */}
                                        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <span className="text-sm text-muted block mb-1">Payouts</span>
                                                {account.payoutsEnabled ? (
                                                    <div className="flex items-center gap-2 text-green-400">
                                                        <CheckCircle size={16} />
                                                        <span className="font-medium">Enabled</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-muted">
                                                        <AlertTriangle size={16} />
                                                        <span className="font-medium">Disabled</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Details & Deleted Warning */}
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface rounded-xl p-4 border border-border">
                                         {account.country && (
                                            <div className="flex items-center gap-4 text-sm text-muted">
                                                <div className="flex items-center gap-2">
                                                    <Globe size={16} />
                                                    <span>Country: <span className="text-foreground font-medium">{account.country.toUpperCase()}</span></span>
                                                </div>
                                                <div className="w-px h-4 bg-border"></div>
                                                <div>
                                                    <span>Currency: <span className="text-foreground font-medium">{account.currency?.toUpperCase()}</span></span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {account.isDeleted && (
                                            <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                                                <AlertTriangle size={16} />
                                                <span>Account Deleted</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted">
                                    <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                                        <CreditCard size={32} className="opacity-50" />
                                    </div>
                                    <p>No payment account linked yet.</p>
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                                {!account ? (
                                    <Button
                                        leftIcon={<CreditCard size={18} />}
                                        onClick={createAccount}
                                        className="w-full sm:w-auto"
                                    >
                                        Create Payment Account
                                    </Button>
                                ) : status === PaymentAccountStatus.Created ||
                                    status === PaymentAccountStatus.Pending ? (
                                    <Button
                                        leftIcon={<Clock size={18} />}
                                        onClick={completeOnboarding}
                                        className="w-full sm:w-auto"
                                    >
                                        Complete Onboarding
                                    </Button>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
			</div>
            
            {/* Info Section */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <Info size={18} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold text-foreground">How Payment Accounts Work</h3>
                        <ul className="space-y-2 text-sm text-muted">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 mt-1.5 shrink-0"></span>
                                Create a Stripe Connect account to receive payments from your events.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 mt-1.5 shrink-0"></span>
                                Complete the onboarding process to verify your identity.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 mt-1.5 shrink-0"></span>
                                Once verified, you can accept card payments for your volleyball events.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 mt-1.5 shrink-0"></span>
                                Payments are processed securely through Stripe.
                            </li>
                             <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 mt-1.5 shrink-0"></span>
                                You can always accept cash payments without a payment account.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
		</div>
	);
};

export default PaymentSettings;
