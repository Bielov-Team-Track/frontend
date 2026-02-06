import { EmptyState } from "@/components";
import { Users } from "lucide-react";

export default function PlayerGroupsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">My Groups</h1>
			</div>

			<EmptyState
				icon={Users}
				title="Coming Soon"
				description="View and manage the training groups you're part of. Track sessions and fellow players."
			/>
		</div>
	);
}
