import { EmptyState } from "@/components";
import { Users } from "lucide-react";

export default function CoachingGroupsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">My Groups</h1>
			</div>

			<EmptyState
				icon={Users}
				title="Coming Soon"
				description="Manage the training groups you coach. Organize sessions and track player attendance."
			/>
		</div>
	);
}
