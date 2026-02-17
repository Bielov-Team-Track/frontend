"use client";

import { Button, EmptyState } from "@/components/";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeletePost, useHidePost, usePinPost, usePostsFeed, useRestorePost, useUnpinPost } from "@/hooks/usePosts";
import { Post, PostFilters } from "@/lib/models/Post";
import { ContextType } from "@/lib/models/shared/models";
import { Calendar, Clock, Loader2, Newspaper, Paperclip, Plus, User } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PinnedPostsList from "./PinnedPostsCarousel";
import PostCard from "./PostCard";
import PostCreateModal from "./PostCreateModal";
import PostEditModal from "./PostEditModal";

interface PostFeedProps {
	contextType: ContextType;
	contextId: string;
	contextName: string;
}

type SortOption = "newest" | "oldest";

const SORT_OPTIONS = [
	{ value: "newest", label: "Newest First", icon: <Clock size={14} /> },
	{ value: "oldest", label: "Oldest First", icon: <Calendar size={14} /> },
];

export default function PostFeed({ contextType, contextId, contextName }: PostFeedProps) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingPost, setEditingPost] = useState<Post | null>(null);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("newest");
	const [authorFilter, setAuthorFilter] = useState<string>("all");
	const [withAttachments, setWithAttachments] = useState(false);
	const pinPost = usePinPost();
	const unpinPost = useUnpinPost();

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(timer);
	}, [search]);

	// Build filters for the backend query
	const filters = useMemo<PostFilters>(() => {
		const f: PostFilters = {};
		if (debouncedSearch) f.search = debouncedSearch;
		if (authorFilter !== "all") f.authorId = authorFilter;
		if (withAttachments) f.hasMedia = true;
		if (sortBy !== "newest") f.sort = sortBy;
		return f;
	}, [debouncedSearch, authorFilter, withAttachments, sortBy]);

	const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = usePostsFeed(contextType, contextId, filters);

	const hidePost = useHidePost();
	const restorePost = useRestorePost();
	const deletePost = useDeletePost();

	const { allPosts, pinnedPosts, regularPosts, uniqueAuthors } = useMemo(() => {
		const all = data?.pages.flatMap((page) => page.items) ?? [];
		const pinned = all.filter((post) => post.isPinned).sort((a, b) => (a.pinOrder ?? 0) - (b.pinOrder ?? 0));

		// Get unique authors for filter dropdown
		const authorsMap = new Map<string, string>();
		all.forEach((post) => {
			if (post.author?.id && !authorsMap.has(post.author.id)) {
				authorsMap.set(post.author.id, `${post.author.name || ""} ${post.author.surname || ""}`.trim() || "Unknown");
			}
		});
		const authors = Array.from(authorsMap.entries()).map(([id, name]) => ({ value: id, label: name }));

		const regular = all.filter((post) => !post.isPinned);

		return { allPosts: all, pinnedPosts: pinned, regularPosts: regular, uniqueAuthors: authors };
	}, [data]);

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
		[isFetchingNextPage, hasNextPage, fetchNextPage],
	);

	const handlePin = useCallback(
		async (postId: string) => {
			try {
				await pinPost.mutateAsync(postId);
			} catch (error) {
				console.error("Failed to pin post:", error);
			}
		},
		[pinPost],
	);

	const handleUnpin = useCallback(
		async (postId: string) => {
			try {
				await unpinPost.mutateAsync(postId);
			} catch (error) {
				console.error("Failed to unpin post:", error);
			}
		},
		[unpinPost],
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
		[hidePost],
	);

	const handleRestore = useCallback(
		async (postId: string) => {
			try {
				await restorePost.mutateAsync(postId);
			} catch (error) {
				console.error("Failed to restore post:", error);
			}
		},
		[restorePost],
	);

	// Cleanup observer on unmount
	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
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
		[deletePost],
	);

	const activeFilterCount = (authorFilter !== "all" ? 1 : 0) + (withAttachments ? 1 : 0);

	const clearFilters = () => {
		setAuthorFilter("all");
		setWithAttachments(false);
	};

	// Filter content for the ListToolbar - author dropdown
	const authorOptions = uniqueAuthors;
	const selectedAuthorLabel = authorFilter === "all"
		? "All Authors"
		: uniqueAuthors.find(a => a.value === authorFilter)?.label ?? "All Authors";

	const filterContent = (
		<div className="flex flex-wrap items-center gap-2">
			{uniqueAuthors.length > 0 && (
				<Select value={authorFilter} onValueChange={(val) => setAuthorFilter(val ?? "all")}>
					<SelectTrigger className="w-auto min-w-[160px]">
						<User size={14} className="text-muted-foreground" />
						<SelectValue placeholder="All Authors">{selectedAuthorLabel}</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<User size={14} className="text-muted-foreground" />
							All Authors
						</SelectItem>
						{authorOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								<User size={14} className="text-muted-foreground" />
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
			<Button
				variant="outline"
				size="sm"
				onClick={() => setWithAttachments(!withAttachments)}
				leftIcon={<Paperclip size={14} className={withAttachments ? "text-primary" : ""} />}
				className={withAttachments ? "border-primary/50 bg-primary/15 text-primary hover:bg-primary/20" : ""}
			>
				With Attachments
			</Button>
		</div>
	);

	return (
		<div className="flex flex-col gap-4 h-full">
			{/* Header Row: Title + Create Button */}
			<div className="flex items-center justify-between shrink-0">
				<h2 className="text-lg font-semibold text-foreground">Posts</h2>
				<Button onClick={() => setShowCreateModal(true)} variant="outline" leftIcon={<Plus size={16} />}>
					Create Post
				</Button>
			</div>

			{/* Toolbar with collapsible search/filters */}
			<ListToolbar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search posts..."
				sortOptions={SORT_OPTIONS}
				sortBy={sortBy}
				onSortChange={(val) => setSortBy(val as SortOption)}
				filterContent={filterContent}
				activeFilterCount={activeFilterCount}
				onClearFilters={clearFilters}
				count={isLoading ? 0 : regularPosts.length + pinnedPosts.length}
				itemLabel="post"
				showViewToggle={false}
			/>

			{/* Content Area */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-4">
				{/* Pinned Posts Carousel */}
				{pinnedPosts.length > 0 && <PinnedPostsList posts={pinnedPosts} onEdit={setEditingPost} onDelete={handleDelete} onUnpin={handleUnpin} />}
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
			) : allPosts.length === 0 ? (
				<EmptyState
					icon={Newspaper}
					title="No posts yet"
					description="Be the first to create one!"
					action={{ icon: Plus, onClick: () => setShowCreateModal(true), label: "Create post" }}
				/>
			) : regularPosts.length === 0 && pinnedPosts.length === 0 ? (
				<EmptyState
					icon={Newspaper}
					title="No posts found"
					description="Try adjusting your search or filters"
					action={{
						label: "Clear Filters",
						onClick: () => {
							setSearch("");
							clearFilters();
						},
					}}
				/>
			) : (
				<div className="space-y-4 pb-4">
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
			</div>

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
