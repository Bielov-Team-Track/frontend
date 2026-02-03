"use client";

import { Post } from "@/lib/models/Post";
import PostCard from "./PostCard";

interface PinnedPostsCarouselProps {
	posts: Post[];
	onEdit?: (post: Post) => void;
	onDelete?: (postId: string) => void;
	onUnpin?: (postId: string) => void;
}

export default function PinnedPostsList({ posts, onEdit, onDelete, onUnpin }: PinnedPostsCarouselProps) {
	if (posts.length === 0) return null;

	return (
		<div className="relative group">
			{/* Posts container */}
			<div className="flex flex-col gap-4 overflow-x-auto pb-2">
				{posts.map((post) => (
					<PostCard post={post} onEdit={onEdit} onDelete={onDelete} onUnpin={onUnpin} showUnpin />
				))}
			</div>
		</div>
	);
}
