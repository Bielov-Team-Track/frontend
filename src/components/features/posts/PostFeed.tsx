"use client";

import { Button, EmptyState } from "@/components/";
import { useDeletePost, useHidePost, usePinPost, usePostsFeed, useRestorePost, useUnpinPost } from "@/hooks/usePosts";
import { ContextType, Post } from "@/lib/models/Post";
import { Loader2, Newspaper, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import PinnedPostsCarousel from "./PinnedPostsCarousel";
import PostCard from "./PostCard";
import PostCreateModal from "./PostCreateModal";
import PostEditModal from "./PostEditModal";

interface PostFeedProps {
	contextType: ContextType;
	contextId: string;
	contextName: string;
}

export default function PostFeed({ contextType, contextId, contextName }: PostFeedProps) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingPost, setEditingPost] = useState<Post | null>(null);
	const pinPost = usePinPost();
	const unpinPost = useUnpinPost();
	const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = usePostsFeed(contextType, contextId);

	const hidePost = useHidePost();
	const restorePost = useRestorePost();
	const deletePost = useDeletePost();
	const allPosts = data?.pages.flatMap((page) => page.items) ?? [];
	const pinnedPosts = allPosts.filter((post) => post.isPinned).sort((a, b) => (a.pinOrder ?? 0) - (b.pinOrder ?? 0));
	const regularPosts = allPosts.filter((post) => !post.isPinned);
	// Native IntersectionObserver for infinite scroll
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadMoreRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isFetchingNextPage) return;

			if (observerRef.current) {
				observerRef.current.disconnect();
			}

			observerRef.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasNextPage) {
					fetchNextPage();
				}
			});

			if (node) {
				observerRef.current.observe(node);
			}
		},
		[isFetchingNextPage, hasNextPage, fetchNextPage]
	);

	const handlePin = useCallback(
		async (postId: string) => {
			try {
				await pinPost.mutateAsync(postId);
			} catch (error) {
				console.error("Failed to pin post:", error);
			}
		},
		[pinPost]
	);

	const handleUnpin = useCallback(
		async (postId: string) => {
			try {
				await unpinPost.mutateAsync(postId);
			} catch (error) {
				console.error("Failed to unpin post:", error);
			}
		},
		[unpinPost]
	);

	const handleHide = useCallback(
		async (postId: string) => {
			if (!confirm("Hide this post? It will no longer be visible to members.")) return;
			try {
				await hidePost.mutateAsync(postId);
			} catch (error) {
				console.error("Failed to hide post:", error);
			}
		},
		[hidePost]
	);

	const handleRestore = useCallback(
		async (postId: string) => {
			try {
				await restorePost.mutateAsync(postId);
			} catch (error) {
				console.error("Failed to restore post:", error);
			}
		},
		[restorePost]
	);

	// Cleanup observer on unmount
	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []);

	const handleDelete = useCallback(
		async (postId: string) => {
			if (!confirm("Delete this post?")) return;
			try {
				await deletePost.mutateAsync(postId);
			} catch (error) {
				console.error("Failed to delete post:", error);
			}
		},
		[deletePost]
	);

	const posts = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold text-white">Posts</h2>
				<Button onClick={() => setShowCreateModal(true)} variant={"outline"} leftIcon={<Plus size={16} />}>
					Create Post
				</Button>
			</div>
			{/* Pinned Posts Carousel */}
			{pinnedPosts.length > 0 && <PinnedPostsCarousel posts={pinnedPosts} onEdit={setEditingPost} onDelete={handleDelete} onUnpin={handleUnpin} />}
			{/* Posts List */}
			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="animate-spin text-muted-foreground" size={32} />
				</div>
			) : isError ? (
				// TODO : Better error handling
				<div className="text-center py-12">
					<p className="text-destructive">Failed to load posts</p>
				</div>
			) : posts.length === 0 ? (
				<EmptyState
					icon={Newspaper}
					title="No posts yet"
					description="Be the first to create one!"
					action={{ icon: Plus, onClick: () => setShowCreateModal(true), label: "Create post" }}
				/>
			) : (
				<div className="space-y-4">
					{regularPosts.map((post) => (
						<PostCard
							key={post.id}
							post={post}
							onEdit={setEditingPost}
							onDelete={handleDelete}
							onPin={handlePin}
							onUnpin={handleUnpin}
							onHide={handleHide}
							onRestore={handleRestore}
							isAdmin={true} // TODO: Check actual admin status from context
						/>
					))}

					{/* Load more trigger */}
					<div ref={loadMoreRef} className="py-4 flex justify-center">
						{isFetchingNextPage && <Loader2 className="animate-spin text-muted-foreground" size={24} />}
					</div>
				</div>
			)}

			{/* Modals */}
			<PostCreateModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				contextType={contextType}
				contextId={contextId}
				contextName={contextName}
			/>

			<PostEditModal isOpen={!!editingPost} onClose={() => setEditingPost(null)} post={editingPost} />
		</div>
	);
}
