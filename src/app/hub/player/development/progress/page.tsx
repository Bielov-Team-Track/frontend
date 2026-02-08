import { EmptyState } from "@/components";
import { TrendingUp } from "lucide-react";

export default function PlayerProgressPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">Progress</h1>
			</div>

			<EmptyState
				icon={TrendingUp}
				title="Coming Soon"
				description="Track your skill development over time with detailed progress charts and milestone achievements."
			/>
		</div>
	);
}
