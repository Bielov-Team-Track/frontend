import { EmptyState } from "@/components";
import { MessageSquare } from "lucide-react";

export default function PlayerFeedbackPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">Feedback</h1>
			</div>

			<EmptyState
				icon={MessageSquare}
				title="Coming Soon"
				description="View feedback from your coaches on your performance, technique, and areas for improvement."
			/>
		</div>
	);
}
