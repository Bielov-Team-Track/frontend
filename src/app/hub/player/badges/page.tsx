import { EmptyState } from "@/components";
import { Award } from "lucide-react";

export default function PlayerBadgesPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">Badges</h1>
			</div>

			<EmptyState
				icon={Award}
				title="Coming Soon"
				description="Earn and display badges for achievements, milestones, and special accomplishments in your volleyball journey."
			/>
		</div>
	);
}
