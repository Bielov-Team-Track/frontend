"use client";

import React from "react";
import { UserProfile } from "@/lib/models/User";
import { usePaymentAccount } from "@/components/features/events/forms/hooks/usePaymentAccount";
import { PaymentAccountStatus } from "@/lib/models/Payment";
import {
	FaCreditCard,
	FaCheckCircle,
	FaClock,
	FaExclamationTriangle,
	FaExternalLinkAlt,
} from "react-icons/fa";
import { Button, Loader, Section } from "@/components";
import { getDashboardLink } from "@/lib/requests/payments";
import { FiRefreshCcw } from "react-icons/fi";

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

	const getStatusIcon = () => {
		switch (status) {
			case PaymentAccountStatus.Active:
				return <FaCheckCircle className="text-success" />;
			case PaymentAccountStatus.Pending:
				return <FaClock className="text-warning" />;
			case PaymentAccountStatus.Restricted:
			case PaymentAccountStatus.Rejected:
				return <FaExclamationTriangle className="text-error" />;
			default:
				return <FaCreditCard className="/60" />;
		}
	};

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
		switch (status) {
			case PaymentAccountStatus.Active:
				return <span className="badge p-2 badge-success badge-sm">Active</span>;
			case PaymentAccountStatus.Pending:
				return (
					<span className="badge p-2 badge-warning badge-sm">Pending</span>
				);
			case PaymentAccountStatus.Restricted:
				return (
					<span className="badge p-2 badge-error badge-sm">Restricted</span>
				);
			case PaymentAccountStatus.Rejected:
				return <span className="badge p-2 badge-error badge-sm">Rejected</span>;
			case PaymentAccountStatus.Created:
				return <span className="badge p-2 badge-info badge-sm">Created</span>;
			case PaymentAccountStatus.None:
				return (
					<span className="badge p-2 badge-ghost badge-sm">Not Created</span>
				);
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
		<div className="p-8 w-full">
			<div>
				<h1 className="text-2xl font-bold  mb-2">Payment Settings</h1>
				<p className="/60 mb-8">
					Manage your payment account to receive payments from event
					participants
				</p>
				{error && (
					<div className="mb-6 flex items-center space-x-2 text-error border border-error/50 bg-error/10 rounded-lg p-4">
						<FaExclamationTriangle />
						<span>{error}</span>
					</div>
				)}{" "}
				<div className="bg-background-light rounded-lg p-6">
					<div className="flex items-start space-x-4">
						<div className="flex-1 flex flex-col gap-4">
							<div className="flex flex-col xl:justify-between xl:flex-row xl:items-start gap-4">
								<div className="flex items-start gap-4">
									<div className="flex flex-col">
										<h2 className="text-4xl font-semibold flex flex-col lg:flex-row lg:items-center gap-2">
											Stripe Payment Account
											{!isLoading && getStatusBadge()}
										</h2>
										{!isLoading && (
											<p className="text-muted">{getStatusText()}</p>
										)}
									</div>
								</div>
								<div className="flex items-center gap-3">
									<Button
										size="sm"
										onClick={refetch}
										leftIcon={<FiRefreshCcw />}
										loading={isLoading}
									>
										Refresh Status
									</Button>
									{account?.createdAt && (
										<Button
											leftIcon={<FaExternalLinkAlt />}
											onClick={openDashboard}
											variant="outline"
											size="sm"
										>
											Open Stripe Dashboard
										</Button>
									)}
								</div>
							</div>

							{isLoading ? (
								<Loader />
							) : (
								<>
									{account && (
										<div className="flex flex-col space-y-3 gap-4">
											<div className="flex items-center gap-6 flex-wrap  lg:flex-row">
												<div className="flex items-center space-x-2 bg-neutral/15 p-4 rounded-lg">
													<span className="text-4xl">📃</span>
													<div className="flex flex-col">
														<span>Onboarding</span>
														{account.detailsSubmitted ? (
															<span className="text-sm text-success">
																Completed
															</span>
														) : (
															<span className="text-sm text-muted">Needed</span>
														)}
													</div>
												</div>

												<div className="flex items-center gap-2 bg-neutral/15 p-4 rounded-lg">
													<span className="text-4xl">💳</span>
													<div className="flex flex-col">
														<span>Receive Payments</span>
														{account.chargesEnabled ? (
															<span className="text-sm text-success">
																Enabled
															</span>
														) : (
															<span className="text-sm text-muted">
																Disabled
															</span>
														)}
													</div>
												</div>

												<div className="flex items-center space-x-2 bg-neutral/15 p-4 rounded-lg">
													<span className="text-4xl">💰</span>
													<div className="flex flex-col">
														<span>Payouts</span>
														{account.payoutsEnabled ? (
															<span className="text-sm text-success">
																Enabled
															</span>
														) : (
															<span className="text-sm text-muted">
																Disabled
															</span>
														)}
													</div>
												</div>

												{account.isDeleted && (
													<div className="flex items-center space-x-2">
														<FaExclamationTriangle className="text-error" />
														<span className="text-sm text-error">
															Account Deleted
														</span>
													</div>
												)}
											</div>

											{account.country && (
												<div className="text-sm /60">
													🌍 Country:{" "}
													<span className="font-bold">
														{account.country.toUpperCase()}
													</span>{" "}
													| 💷 Currency:{" "}
													<span className="font-bold">
														{account.currency?.toUpperCase()}
													</span>
												</div>
											)}
										</div>
									)}

									<div className="flex flex-wrap gap-3">
										{!account ? (
											<Button
												leftIcon={<FaCreditCard />}
												onClick={createAccount}
											>
												Create Payment Account
											</Button>
										) : status === PaymentAccountStatus.Created ||
											status === PaymentAccountStatus.Pending ? (
											<Button
												leftIcon={<FaClock />}
												onClick={completeOnboarding}
											>
												Complete Onboarding
											</Button>
										) : (
											<></>
										)}
									</div>
								</>
							)}
						</div>
					</div>
				</div>
				<Section
					variant="info"
					className="mt-8"
					title="How Payment Accounts Work"
				>
					<ul className="space-y-2 text-muted">
						<li>
							• Create a Stripe Connect account to receive payments from your
							events
						</li>
						<li>• Complete the onboarding process to verify your identity</li>
						<li>
							• Once verified, you can accept card payments for your volleyball
							events
						</li>
						<li>• Payments are processed securely through Stripe</li>
						<li>
							• You can always accept cash payments without a payment account
						</li>
					</ul>
				</Section>
			</div>
		</div>
	);
};

export default PaymentSettings;
