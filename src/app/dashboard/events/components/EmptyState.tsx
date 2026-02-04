import { Button } from "@/components";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default function EventsListEmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-surface">
			<div className="w-16 h-16 rounded-full bg-hover flex items-center justify-center mb-4 text-muted">
				<Calendar size={32} />
			</div>
			<h3 className="text-xl font-bold text-white mb-2">No events found</h3>
			<p className="text-muted max-w-sm mb-6">We couldn&apos;t find any events matching your filters. Try adjusting them or create a new one.</p>
			<Button asChild variant="outline">
				<Link href="/dashboard/events/create">Create Event</Link>
			</Button>
		</div>
	);
}
