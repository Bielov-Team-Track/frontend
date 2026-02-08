import { EmptyState } from "@/components";
import { Wallet } from "lucide-react";

export default function FinancePage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">Finance</h1>
			</div>

			<EmptyState
				icon={Wallet}
				title="Coming Soon"
				description="Financial management features are currently in development. Track payments, manage budgets, and view reports for your clubs."
			/>
		</div>
	);
}
