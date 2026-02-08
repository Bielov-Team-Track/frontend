import { EmptyState } from "@/components";
import { Trophy } from "lucide-react";

export default function PlayerTournamentsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">Tournaments</h1>
			</div>

			<EmptyState
				icon={Trophy}
				title="Coming Soon"
				description="View your tournament history, upcoming competitions, and achievements from past events."
			/>
		</div>
	);
}
