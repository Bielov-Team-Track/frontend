"use client";

import { Button } from "@/components";
import { PostFeed } from "@/components/features/posts";
import { TeamPost } from "@/components/features/teams/types";
import EmptyState from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

export default function PostsTab() {
	const [posts, setPosts] = useState<TeamPost[]>([]);
	const [newPostContent, setNewPostContent] = useState("");

	const handlePostSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPostContent.trim()) return;

		const newPost: TeamPost = {
			id: crypto.randomUUID(),
			authorName: "You",
			content: newPostContent,
			createdAt: new Date(),
			likes: 0,
			comments: 0,
		};
		setPosts([newPost, ...posts]);
		setNewPostContent("");
	};

	return (
		<div className="space-y-6">
			{/* Create Post */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-4">
				<form onSubmit={handlePostSubmit} className="space-y-3">
					<textarea
						value={newPostContent}
						onChange={(e) => setNewPostContent(e.target.value)}
						placeholder="Share something with the team..."
						rows={3}
						className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent resize-none"
					/>
					<div className="flex justify-end">
						<Button type="submit" variant="solid" color="accent" size="sm" disabled={!newPostContent.trim()}>
							Post
						</Button>
					</div>
				</form>
			</div>

			{/* Posts Feed */}
			{posts.length === 0 ? (
				<EmptyState icon={MessageSquare} title="No posts yet" description="Be the first to post in this team" />
			) : (
				<PostFeed posts={posts} />
			)}
		</div>
	);
}
