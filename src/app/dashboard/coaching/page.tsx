import { EmptyState } from "@/components";
import { Users } from "lucide-react";

export default function CoachingPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">Coaching Dashboard</h1>
			</div>

			<EmptyState
				icon={Users}
				title="Coming Soon"
				description="Your coaching dashboard with teams, groups, training plans, and player evaluations is currently in development."
			/>
		</div>
	);
}
