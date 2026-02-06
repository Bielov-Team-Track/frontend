import { EmptyState } from "@/components";
import { Users } from "lucide-react";

export default function CoachingTeamsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">My Teams</h1>
			</div>

			<EmptyState
				icon={Users}
				title="Coming Soon"
				description="Manage the teams you coach. View rosters, schedules, and track team progress."
			/>
		</div>
	);
}
