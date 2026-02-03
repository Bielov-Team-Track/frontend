"use client";

import { Avatar, Button } from "@/components/ui";
import { useDeletePostAsAdmin, useDismissReports, useHidePost, useRestorePost } from "@/hooks/usePosts";
import { ModerationQueueItem as ModerationQueueItemType, ReportReasonOptions } from "@/lib/models/Moderation";
import { cn } from "@/lib/utils";
import { sanitizeHtmlWithSafeLinks } from "@/lib/utils/sanitize";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Eye, EyeOff, Flag, RefreshCw, Trash2, X } from "lucide-react";
import { useState } from "react";

interface ModerationQueueItemProps {
	item: ModerationQueueItemType;
	onAction?: () => void;
}

export default function ModerationQueueItem({ item, onAction }: ModerationQueueItemProps) {
	const [expanded, setExpanded] = useState(false);
	const [showContent, setShowContent] = useState(false);

	const hideMutation = useHidePost();
	const restoreMutation = useRestorePost();
	const deleteMutation = useDeletePostAsAdmin();
	const dismissMutation = useDismissReports();

	const { post, reportCount, reportSummary, firstReportedAt, lastReportedAt } = item;

	const handleHide = async () => {
		await hideMutation.mutateAsync(post.id);
		onAction?.();
	};

	const handleRestore = async () => {
		await restoreMutation.mutateAsync(post.id);
		onAction?.();
	};

	const handleDelete = async () => {
		if (!confirm("Permanently delete this post? This cannot be undone.")) return;
		await deleteMutation.mutateAsync(post.id);
		onAction?.();
	};

	const handleDismiss = async () => {
		if (!confirm("Dismiss all reports? The post will remain visible.")) return;
		await dismissMutation.mutateAsync(post.id);
		onAction?.();
	};

	const isLoading = hideMutation.isPending || restoreMutation.isPending || deleteMutation.isPending || dismissMutation.isPending;

	const getReasonLabel = (reason: string) => {
		return ReportReasonOptions.find((r) => r.value === reason)?.label ?? reason;
	};

	return (
		<div className="bg-neutral-900 rounded-2xl border border-white/5 overflow-hidden">
			{/* Header */}
			<div className="flex items-start justify-between p-4">
				<div className="flex items-center gap-3">
					<Avatar name={`${post.author.name} ${post.author.surname}`} src={post.author.imageUrl} variant="user" />
					<div>
						<p className="text-sm font-medium text-white">
							{post.author.name} {post.author.surname}
						</p>
						<p className="text-xs text-muted-foreground">Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
					</div>
				</div>

				{/* Report badge */}
				<div className="flex items-center gap-2">
					<div
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
							reportCount >= 5
								? "bg-destructive/20 text-destructive"
								: reportCount >= 3
								? "bg-amber-500/20 text-amber-500"
								: "bg-white/10 text-white"
						)}>
						<Flag size={12} />
						{reportCount} report{reportCount !== 1 ? "s" : ""}
					</div>
					{post.isHidden && (
						<span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs text-muted-foreground">
							<EyeOff size={12} />
							Hidden
						</span>
					)}
				</div>
			</div>

			{/* Report summary */}
			<div className="px-4 pb-3">
				<div className="flex flex-wrap gap-2">
					{reportSummary.map((summary) => (
						<span key={summary.reason} className="px-2 py-1 rounded bg-white/5 text-xs text-muted-foreground">
							{getReasonLabel(summary.reason)} ({summary.count})
						</span>
					))}
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					First reported {formatDistanceToNow(new Date(firstReportedAt), { addSuffix: true })}
					{" - "}
					Last reported {formatDistanceToNow(new Date(lastReportedAt), { addSuffix: true })}
				</p>
			</div>

			{/* Content preview toggle */}
			<div className="px-4 pb-3">
				<button
					onClick={() => setShowContent(!showContent)}
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
					{showContent ? <EyeOff size={14} /> : <Eye size={14} />}
					{showContent ? "Hide content" : "View content"}
					{showContent ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
				</button>
			</div>

			{/* Post content */}
			{showContent && (
				<div className="px-4 pb-4">
					<div className="p-3 rounded-lg bg-white/5 border border-white/10">
						<div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtmlWithSafeLinks(post.content) }} />
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="flex items-center justify-between px-4 py-3 bg-white/5 border-t border-white/5">
				<Button size="sm" variant="ghost" onClick={handleDismiss} disabled={isLoading} leftIcon={<X size={14} />}>
					Dismiss Reports
				</Button>

				<div className="flex items-center gap-2">
					{post.isHidden ? (
						<Button
							size="sm"
							variant="outline"
							onClick={handleRestore}
							disabled={isLoading}
							loading={restoreMutation.isPending}
							leftIcon={<RefreshCw size={14} />}>
							Restore
						</Button>
					) : (
						<Button
							size="sm"
							variant="outline"
							onClick={handleHide}
							disabled={isLoading}
							loading={hideMutation.isPending}
							leftIcon={<EyeOff size={14} />}>
							Hide
						</Button>
					)}
					<Button
						size="sm"
						variant="destructive"
						onClick={handleDelete}
						disabled={isLoading}
						loading={deleteMutation.isPending}
						leftIcon={<Trash2 size={14} />}>
						Delete
					</Button>
				</div>
			</div>
		</div>
	);
}
