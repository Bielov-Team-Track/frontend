import { EmptyState } from "@/components";
import { TrendingUp } from "lucide-react";

export default function PlayerDevelopmentPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">My Development</h1>
			</div>

			<EmptyState
				icon={TrendingUp}
				title="Coming Soon"
				description="Track your volleyball development journey with progress reports, feedback, and evaluations from your coaches."
			/>
		</div>
	);
}
