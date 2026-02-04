"use client";

import { Button } from "@/components/ui";
import { useModerationQueue, useReportsSummary } from "@/hooks/usePosts";
import { ContextType } from "@/lib/models/Post";
import { AlertTriangle, ChevronLeft, ChevronRight, EyeOff, Flag, Loader2 } from "lucide-react";
import { useState } from "react";
import ModerationQueueItem from "./ModerationQueueItem";

interface ModerationQueueProps {
	contextType: ContextType;
	contextId: string;
}
// TODO: Implement a separate page for moderation.
export default function ModerationQueue({ contextType, contextId }: ModerationQueueProps) {
	const [page, setPage] = useState(0);
	const pageSize = 10;

	const { data: summary, isLoading: summaryLoading } = useReportsSummary(contextType, contextId);

	const { data: queue, isLoading: queueLoading, refetch } = useModerationQueue(contextType, contextId, pageSize, page * pageSize);

	const totalPages = Math.ceil((queue?.totalCount ?? 0) / pageSize);

	if (summaryLoading || queueLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="animate-spin text-muted-foreground" size={32} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary cards */}
			{summary && (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="bg-surface rounded-xl border border-border p-4">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-warning/20">
								<Flag size={20} className="text-warning" />
							</div>
							<div>
								<p className="text-2xl font-bold text-white">{summary.pendingReview}</p>
								<p className="text-xs text-muted-foreground">Pending Review</p>
							</div>
						</div>
					</div>

					<div className="bg-surface rounded-xl border border-border p-4">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-destructive/20">
								<AlertTriangle size={20} className="text-destructive" />
							</div>
							<div>
								<p className="text-2xl font-bold text-white">{summary.totalReportedPosts}</p>
								<p className="text-xs text-muted-foreground">Total Reported</p>
							</div>
						</div>
					</div>

					<div className="bg-surface rounded-xl border border-border p-4">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-active">
								<EyeOff size={20} className="text-muted-foreground" />
							</div>
							<div>
								<p className="text-2xl font-bold text-white">{summary.hiddenPosts}</p>
								<p className="text-xs text-muted-foreground">Hidden Posts</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Queue */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-medium text-white">Moderation Queue</h3>
					<p className="text-sm text-muted-foreground">
						{queue?.totalCount ?? 0} item{queue?.totalCount !== 1 ? "s" : ""}
					</p>
				</div>

				{queue?.items.length === 0 ? (
					<div className="text-center py-12 rounded-2xl border border-dashed border-border bg-hover">
						<Flag size={32} className="mx-auto text-muted-foreground mb-3" />
						<p className="text-muted-foreground">No reported posts to review</p>
					</div>
				) : (
					<div className="space-y-4">
						{queue?.items.map((item: ModerationQueueItem) => (
							<ModerationQueueItem key={item.post.id} item={item} onAction={() => refetch()} />
						))}
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-center gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={page === 0}
							leftIcon={<ChevronLeft size={14} />}>
							Previous
						</Button>
						<span className="text-sm text-muted-foreground px-3">
							Page {page + 1} of {totalPages}
						</span>
						<Button
							size="sm"
							variant="outline"
							onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
							disabled={page >= totalPages - 1}
							rightIcon={<ChevronRight size={14} />}>
							Next
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
