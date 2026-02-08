import { EmptyState } from "@/components";
import { BarChart } from "lucide-react";

export default function PlayerStatsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">Stats</h1>
			</div>

			<EmptyState
				icon={BarChart}
				title="Coming Soon"
				description="View your game statistics including points, serves, blocks, and more from matches and tournaments."
			/>
		</div>
	);
}
