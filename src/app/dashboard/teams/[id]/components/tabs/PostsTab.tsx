"use client";

import { Button } from "@/components";
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
				<div className="space-y-4">
					{posts.map((post) => (
						<div key={post.id} className="rounded-2xl bg-white/5 border border-white/10 p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 rounded-full bg-background-light flex items-center justify-center text-sm font-bold text-muted">
									{post.authorName[0]}
								</div>
								<div>
									<div className="font-bold text-white">{post.authorName}</div>
									<div className="text-xs text-muted">
										{new Date(post.createdAt).toLocaleDateString()} at{" "}
										{new Date(post.createdAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
								</div>
							</div>
							<p className="text-white whitespace-pre-wrap">{post.content}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
