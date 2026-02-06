import { EmptyState } from "@/components";
import { ClipboardCheck } from "lucide-react";

export default function PlayerEvaluationsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">Evaluations</h1>
			</div>

			<EmptyState
				icon={ClipboardCheck}
				title="Coming Soon"
				description="View your formal skill evaluations and assessments from coaches and training sessions."
			/>
		</div>
	);
}
