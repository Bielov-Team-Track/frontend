import { EmptyState } from "@/components";
import { Users } from "lucide-react";

export default function PlayerTeamsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">My Teams</h1>
			</div>

			<EmptyState
				icon={Users}
				title="Coming Soon"
				description="View and manage the teams you're a player in. Track your role, schedule, and teammates."
			/>
		</div>
	);
}
