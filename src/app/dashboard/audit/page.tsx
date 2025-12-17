import { AuditEventsTable } from "@/components/features/audit";
import { getEventsByFilter } from "@/lib/server/audit";
import { getAccountBalance } from "@/lib/server/payments";
import { getUserProfile } from "@/lib/server/auth";
import { getOutstandingBalance } from "@/lib/server/audit";
import { getFormatedCurrency } from "@/lib/utils/currency";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";

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
		<div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
			<div>
				<h2 className="text-2xl font-bold text-white">Financial Audit</h2>
				<p className="text-sm text-muted">
					Overview of your account balance and outstanding payments
				</p>
			</div>
			
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
					<div className="flex items-center gap-3 text-white">
						<div className="p-2 rounded-lg bg-green-500/10 text-green-500">
							<Wallet size={24} />
						</div>
						<span className="font-medium">Current Balance</span>
					</div>
					<div>
						<div className="text-3xl font-bold text-green-500">
							{formattedBalance}
						</div>
						<div className="text-sm text-muted mt-1">Connected via Stripe</div>
					</div>
				</div>

				<div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
					<div className="flex items-center gap-3 text-white">
						<div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
							<AlertCircle size={24} />
						</div>
						<span className="font-medium">Outstanding Balance</span>
					</div>
					<div>
						<div className="text-3xl font-bold text-yellow-500">
							{formattedOutstandingBalance}
						</div>
						<div className="text-sm text-muted mt-1">For {events?.length} events</div>
					</div>
				</div>
			</div>

			{events && events.length > 0 ? (
				<div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
					<AuditEventsTable events={events} />
				</div>
			) : (
				<div className="bg-[#141414] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
					<div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
						<CheckCircle size={32} />
					</div>
					<div>
						<span className="text-lg font-medium text-white block">No outstanding payments</span>
						<span className="text-sm text-muted">
							All your events are settled
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default AuditPage;
