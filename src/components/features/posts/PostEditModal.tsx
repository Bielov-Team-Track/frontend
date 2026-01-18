"use client";

import { Button, Modal, Select } from "@/components";
import { useUpdatePost } from "@/hooks/usePosts";
import { Post, Visibility, VisibilityOptions } from "@/lib/models/Post";
import { useEffect, useState } from "react";
import PostEditor from "./PostEditor";

interface PostEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	post: Post | null;
}

export default function PostEditModal({ isOpen, onClose, post }: PostEditModalProps) {
	const updatePost = useUpdatePost();

	const [content, setContent] = useState("");
	const [visibility, setVisibility] = useState<Visibility>("membersOnly");

	useEffect(() => {
		if (post) {
			setContent(post.content);
			setVisibility(post.visibility);
		}
	}, [post]);

	const hasContent = content.replace(/<[^>]*>/g, "").trim().length > 0;

	const handleSubmit = async () => {
		if (!post || !hasContent) return;

		try {
			await updatePost.mutateAsync({
				postId: post.id,
				data: { content, visibility },
			});
			onClose();
		} catch (error) {
			console.error("Failed to update post:", error);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Edit Post" size="lg">
			<div className="space-y-4">
				{/* Editor */}
				<PostEditor content={content} onChange={setContent} />

				{/* Visibility */}
				<div className="flex items-center gap-4">
					<label className="text-sm text-muted-foreground">Visibility:</label>
					<Select value={visibility} options={VisibilityOptions} onChange={(value) => setVisibility(value as Visibility)}></Select>
				</div>

				{/* Submit */}
				<div className="flex justify-end gap-3 pt-2">
					<Button variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!hasContent || updatePost.isPending} loading={updatePost.isPending}>
						Save Changes
					</Button>
				</div>
			</div>
		</Modal>
	);
}
