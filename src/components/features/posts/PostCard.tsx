"use client";

import { Avatar, DropdownMenu, DropdownMenuItem } from "@/components/ui";
import { Post } from "@/lib/models/Post";
import { useAuth } from "@/providers";
import { formatDistanceToNow } from "date-fns";
import { Flag, MessageCircle, Pencil, Pin, Trash2 } from "lucide-react";
import { useState } from "react";
import PostMedia from "./PostMedia";
import PostReactions from "./PostReactions";
import { CommentsList } from "./comments";
import { HiddenPostCard, ReportModal } from "./moderation";
import { PollDisplay } from "./polls";
interface PostCardProps {
	post: Post;
	onEdit?: (post: Post) => void;
	onDelete?: (postId: string) => void;
	onPin?: (postId: string) => void;
	onUnpin?: (postId: string) => void;
	onHide?: (postId: string) => void;
	onRestore?: (postId: string) => void;
	showUnpin?: boolean;
	isAdmin?: boolean;
}

export default function PostCard({ post, onEdit, onDelete, showUnpin, isAdmin, onPin, onUnpin, onHide }: PostCardProps) {
	const { userProfile } = useAuth();
	const [showReportModal, setShowReportModal] = useState(false);
	const [showComments, setShowComments] = useState(false);

	const isAuthor = userProfile?.userId === post.authorId;
	const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
	// Show hidden post variant
	if (post.isHidden) {
		return <HiddenPostCard post={post} isAdmin={isAdmin} />;
	}

	const menuItems: DropdownMenuItem[] = [];

	if (isAuthor) {
		menuItems.push(
			{ icon: <Pencil size={16} />, label: "Edit", onClick: () => onEdit?.(post) },
			{ icon: <Trash2 size={16} />, label: "Delete", variant: "destructive", onClick: () => onDelete?.(post.id) }
		);
	}
	if (isAdmin && !post.isPinned) {
		menuItems.push({ icon: <Pin size={16} />, label: "Pin Post", onClick: () => onPin?.(post.id) });
	}

	if ((isAdmin || showUnpin) && post.isPinned) {
		menuItems.push({ icon: <Pin size={16} />, label: "Unpin Post", onClick: () => onUnpin?.(post.id) });
	}

	if (!isAuthor) {
		menuItems.push({ icon: <Flag size={16} />, label: "Report", onClick: () => setShowReportModal(true) });
	}
	if (isAdmin && !post.isHidden) {
		menuItems.push({ icon: <Trash2 size={16} />, label: "Hide Post", variant: "destructive", onClick: () => onHide?.(post.id) });
	}

	return (
		<article className="bg-neutral-900 backdrop-blur-sm shadow-sm rounded-2xl border border-white/5">
			{/* Header */}
			<div className="flex items-start justify-between p-4">
				<div className="flex items-center gap-3">
					<Avatar name={post.author.name + " " + post.author.surname} src={post.author.imageUrl} variant="user" />
					<div>
						<p className="text-sm font-medium text-white">{post.author.name + " " + post.author.surname}</p>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span>{timeAgo}</span>
							{post.isPinned && (
								<>
									<span>·</span>
									<button onClick={() => onUnpin?.(post.id)} className="flex items-center gap-1">
										<Pin size={12} />
										Pinned
									</button>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Menu */}
				<DropdownMenu items={menuItems} />
			</div>

			{/* Content */}
			<div className="px-4 pb-3">
				<div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
			</div>

			{/* Media */}
			{post.media.length > 0 && (
				<div className="px-4 pb-4">
					<PostMedia media={post.media} />
				</div>
			)}

			{/* Poll */}
			{post.poll && (
				<div className="px-4 pb-4">
					<PollDisplay poll={post.poll} isAuthor={isAuthor} />
				</div>
			)}

			{/* Footer - reactions & comments */}
			<div className="px-4 py-3 border-t border-white/5">
				<div className="flex items-center justify-between">
					<PostReactions postId={post.id} reactions={post.reactions} />
					<button
						onClick={() => setShowComments(!showComments)}
						className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
						<MessageCircle size={16} />
						{post.commentCount} comments
					</button>
				</div>
			</div>

			{/* Comments section */}
			{showComments && (
				<div className="px-4 pb-4">
					<CommentsList postId={post.id} commentCount={post.commentCount} />
				</div>
			)}

			<ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} postId={post.id} />
		</article>
	);
}
