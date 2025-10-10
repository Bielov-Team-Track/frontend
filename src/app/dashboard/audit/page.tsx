import { AuditEventsTable } from "@/components/features/audit";
import { getEventsByFilter } from "@/lib/server/audit";
import { getAccountBalance } from "@/lib/server/payments";
import { getUserProfile } from "@/lib/server/auth";
import { getOutstandingBalance } from "@/lib/server/audit";
import { getFormatedCurrency } from "@/lib/utils/currency";

const AuditPage = async () => {
	const userProfile = await getUserProfile();

	const events = await getEventsByFilter({
		organizerId: userProfile?.userId!,
		sortBy: "startDate",
		sortOrder: "asc",
	});

	const balance = await getAccountBalance();

	const availableBalance = balance?.available?.[0];
	const formattedBalance = availableBalance
		? getFormatedCurrency(availableBalance.amount, availableBalance.currency)
		: "£0.00";

	const outstandingBalance = await getOutstandingBalance();
	const formattedOutstandingBalance = outstandingBalance
		? getFormatedCurrency(
				outstandingBalance.amount,
				outstandingBalance.currency,
			)
		: "£0.00";

	return (
		<div className="flex flex-col gap-4 p-6 max-w-full overflow-hidden">
			<div>
				<h2>Financial Audit</h2>
				<p className="text-sm text-muted">
					Overview of your account balance and outstanding payments
				</p>
			</div>
			<div className="flex gap-4 flex-wrap">
				<div className="flex flex-col p-4 bg-background-light rounded-lg w-fit">
					<div>Current balance</div>
					<div className="text-3xl font-semibold text-success">
						{formattedBalance}
					</div>
					<div className="text-sm text-muted">Connected via Stripe</div>
				</div>

				<div className="flex flex-col p-4  bg-background-light rounded-lg w-fit">
					<div>Outstanding balance</div>
					<div className="text-3xl font-semibold text-warning">
						{formattedOutstandingBalance}
					</div>
					<div className="text-sm text-muted">For {events?.length} events</div>
				</div>
			</div>
			{events && events.length > 0 ? (
				<AuditEventsTable events={events} />
			) : (
				<div className="flex flex-col gap-2 items-center justify-center mt-20">
					<span className="text-lg font-medium">No outstanding payments</span>
					<span className="text-sm text-muted">
						All your events are settled
					</span>
				</div>
			)}
		</div>
	);
};

export default AuditPage;
