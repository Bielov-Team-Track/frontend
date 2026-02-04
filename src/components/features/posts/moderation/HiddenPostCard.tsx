"use client";

import { Avatar, Button } from "@/components/ui";
import { useRestorePost } from "@/hooks/usePosts";
import { Post } from "@/lib/models/Post";
import { sanitizeHtmlWithSafeLinks } from "@/lib/utils/sanitize";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Eye, EyeOff, Flag, RefreshCw } from "lucide-react";
import { useState } from "react";

interface HiddenPostCardProps {
	post: Post;
	reportCount?: number;
	isAdmin?: boolean;
	onViewContent?: () => void;
}

export default function HiddenPostCard({ post, reportCount, isAdmin = false, onViewContent }: HiddenPostCardProps) {
	const [showContent, setShowContent] = useState(false);
	const restoreMutation = useRestorePost();

	const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

	const handleRestore = async () => {
		if (!confirm("Restore this post? It will be visible to all members again.")) return;
		await restoreMutation.mutateAsync(post.id);
	};

	const reasonText = post.hiddenReason === "auto_reported" ? "Hidden due to multiple reports" : "Hidden by a moderator";

	return (
		<article className="bg-surface/50 backdrop-blur-sm rounded-2xl border border-border overflow-hidden">
			{/* Header */}
			<div className="flex items-start justify-between p-4">
				<div className="flex items-center gap-3">
					<Avatar name={`${post.author.name} ${post.author.surname}`} src={post.author.imageUrl} variant="user" className="opacity-50" />
					<div>
						<p className="text-sm font-medium text-white/50">
							{post.author.name} {post.author.surname}
						</p>
						<p className="text-xs text-muted-foreground">{timeAgo}</p>
					</div>
				</div>
			</div>

			{/* Hidden notice */}
			<div className="mx-4 mb-4 p-4 rounded-xl bg-warning/10 border border-warning/20">
				<div className="flex items-start gap-3">
					<AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
					<div className="flex-1">
						<p className="text-sm font-medium text-warning">{reasonText}</p>
						{reportCount && reportCount > 0 && (
							<p className="text-xs text-warning/70 mt-1">
								<Flag size={12} className="inline mr-1" />
								{reportCount} report{reportCount !== 1 ? "s" : ""}
							</p>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2 mt-3">
					{isAdmin && (
						<>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setShowContent(!showContent)}
								leftIcon={showContent ? <EyeOff size={14} /> : <Eye size={14} />}>
								{showContent ? "Hide Content" : "View Content"}
							</Button>
							<Button size="sm" variant="outline" onClick={handleRestore} loading={restoreMutation.isPending} leftIcon={<RefreshCw size={14} />}>
								Restore Post
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Hidden content (admin only) */}
			{showContent && isAdmin && (
				<div className="px-4 pb-4">
					<div className="p-3 rounded-lg bg-hover border border-border">
						<p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Hidden Content Preview</p>
						<div className="prose prose-invert prose-sm max-w-none opacity-70" dangerouslySetInnerHTML={{ __html: sanitizeHtmlWithSafeLinks(post.content) }} />
					</div>
				</div>
			)}
		</article>
	);
}
