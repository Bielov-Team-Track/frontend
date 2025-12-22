import { Avatar, Button } from "@/components";
import { Event } from "@/lib/models/Event";
import { PaymentMethod, PricingModel } from "@/lib/models/EventBudget";
import { Payment } from "@/lib/models/Payment";
import { Team } from "@/lib/models/Team";
import { UserProfile } from "@/lib/models/User";
import {
	loadTeamPayments,
	loadUserPaymentForEvent,
} from "@/lib/api/payments";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import PaymentButton from "./PaymentButton";

type PaymentsSectionProps = {
	event: Event;
	teams: Team[];
	userProfile: UserProfile | null;
};

const PaymentsSection = async ({
	event,
	teams,
	userProfile,
}: PaymentsSectionProps) => {
	if (!event.budget) {
		return null;
	}

	const userPayment = userProfile?.userId
		? await loadUserPaymentForEvent(event.id!, userProfile.userId)
		: null;

	const captainsTeams = teams.filter(
		(t) => t.captainId === userProfile?.userId,
	);

	const teamPayments = captainsTeams.map(
		async (t) => await loadTeamPayments(t.id!),
	);

	const getBudgetUnit = () => {
		switch (event.budget?.pricingModel) {
			case PricingModel.Individual:
				return "person";
			case PricingModel.Team:
				return "team";
			case PricingModel.Event:
				return "event";
		}
	};

	const getPaymentStatus = (
		payment?: Payment | null,
		iconOnly: boolean = false,
	) => {
		if (payment?.status === "completed") {
			return (
				<div className="text-green-500 flex gap-1 items-center">
					<FaCheckCircle />
					{iconOnly ? "" : "Paid"}
				</div>
			);
		} else {
			return (
				<div className="text-orange-500 flex gap-1 items-center">
					<FaExclamationCircle /> {iconOnly ? "" : "Pending"}
				</div>
			);
		}
	};

	return (
		<div className="flex-1 flex flex-col gap-4">
			<span className="flex items-center gap-2">
				<span className="text-3xl font-bold">Payments</span>
			</span>
			<div className=" flex flex-col w-full gap-2">
				{event.budget && (
					<div className="flex items-center justify-between py-4 px-6 rounded-lg bg-background">
						<div className="flex gap-2 flex-col">
							<span className="font-medium">Event Fee</span>
							<span className="text-muted text-sm">Per {getBudgetUnit()}</span>
						</div>

						<span className="text-3xl font-bold">
							{event.budget.currency || "£"}
							{event.budget.cost}
						</span>
					</div>
				)}
				{userProfile && userPayment && (
					<div className="flex flex-col gap-2 p-4 rounded-lg bg-background">
						<div className="flex items-center justify-between">
							<span className="font-medium">Your Payment</span>
							<span>{getPaymentStatus(userPayment)}</span>
						</div>
						{event.budget?.paymentMethods?.includes(PaymentMethod.Card) ? (
							userPayment &&
							!userPayment.paidAt &&
							userPayment.eventParticipant?.id && (
								<PaymentButton
									participantId={userPayment.eventParticipant.id}
									amount={userPayment.amount}
									currency={event.budget?.currency}
								/>
							)
						) : (
							<span className="text-sm text-muted">
								You can pay with cash or bank transfer to the event organizer.
								Contact them for details.
							</span>
						)}
					</div>
				)}
				{captainsTeams &&
					captainsTeams.map(async (t, index) => {
						const payments = await teamPayments[index];
						const notPaidPayments = payments.filter((p) => !!p.paidAt);
						const remainingAmount = payments.reduce(
							(sum, p) => sum + (p.paidAt ? 0 : p.amount),
							0,
						);

						return (
							<div
								key={t.id}
								className="flex flex-col gap-2 p-4 rounded-lg bg-background"
							>
								<div className="flex items-center justify-between">
									<div className="flex flex-col gap-1">
										<span className="font-medium">Team Payment</span>
										<span className="text-sm text-muted">{t.name}</span>
									</div>
									<div className="flex flex-col items-end">
										<span className="text-muted text-sm">
											{notPaidPayments.length}/{payments.length} paid
										</span>
										<span className="font-medium">
											{event.budget?.currency || "£"}
											{remainingAmount} remaining
										</span>
									</div>
								</div>
								<div key={t.id} className="mt-2">
									<div className="text-sm text-muted font-medium">
										Team members
									</div>
									<div className="flex flex-col gap-2 mt-1">
										{payments.map((p) => {
											const profile = p.eventParticipant?.userProfile!;
											return (
												<div
													key={p.id}
													className="flex items-center justify-between rounded-md bg-background p-2 pr-4"
												>
													<div className="flex items-center gap-2">
														<Avatar profile={profile} />
														<span>
															{profile.name} {profile.surname}
														</span>
													</div>
													<div className="flex items-center gap-2">
														{event.budget?.currency || "£"}
														{p.amount} {getPaymentStatus(p, true)}
													</div>
												</div>
											);
										})}
									</div>
									{event.budget?.paymentMethods?.includes(PaymentMethod.Card) &&
										remainingAmount > 0 && (
											<Button fullWidth={true} className="mt-4">
												Pay {event.budget?.currency || "£"}
												{remainingAmount}
											</Button>
										)}
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default PaymentsSection;
