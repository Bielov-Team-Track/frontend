import { EmptyState } from "@/components";
import { User } from "lucide-react";

export default function PlayerPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">Player Dashboard</h1>
			</div>

			<EmptyState
				icon={User}
				title="Coming Soon"
				description="Your player dashboard with teams, groups, stats, and development tracking is currently in development."
			/>
		</div>
	);
}
