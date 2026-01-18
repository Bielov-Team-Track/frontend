"use client";

import { Avatar, Button, Modal, Select } from "@/components/";
import { useCreatePost } from "@/hooks/usePosts";
import { ContextType, CreatePollRequest, Visibility, VisibilityOptions } from "@/lib/models/Post";
import { useAuth } from "@/providers";
import { BarChart3, Image } from "lucide-react";
import { useState } from "react";
import PostEditor from "./PostEditor";
import PostMediaUploader from "./PostMediaUploader";
import { PollCreator } from "./polls";

interface PostCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	contextType: ContextType;
	contextId: string;
	contextName: string;
}

export default function PostCreateModal({ isOpen, onClose, contextType, contextId, contextName }: PostCreateModalProps) {
	const { userProfile } = useAuth();
	const [showPollCreator, setShowPollCreator] = useState(false);
	const [poll, setPoll] = useState<CreatePollRequest | null>(null);
	const createPost = useCreatePost();

	const [content, setContent] = useState("");
	const [visibility, setVisibility] = useState<Visibility>("membersOnly");
	const [mediaIds, setMediaIds] = useState<string[]>([]);
	const [showMediaUploader, setShowMediaUploader] = useState(false);

	const hasContent = content.replace(/<[^>]*>/g, "").trim().length > 0;
	const canSubmit = hasContent || mediaIds.length > 0 || poll !== null;

	const handleSubmit = async () => {
		if (!canSubmit) return;

		try {
			await createPost.mutateAsync({
				contextType,
				contextId,
				content,
				visibility,
				mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
				poll: poll ?? undefined,
			});

			// Reset and close
			setContent("");
			setVisibility("membersOnly");
			setMediaIds([]);
			setPoll(null);
			setShowMediaUploader(false);
			setShowPollCreator(false);
			onClose();
		} catch (error) {
			console.error("Failed to create post:", error);
		}
	};

	const handleClose = () => {
		if (hasContent || mediaIds.length > 0 || poll !== null) {
			if (!confirm("Discard this post?")) return;
		}
		setContent("");
		setMediaIds([]);
		setPoll(null);
		setShowMediaUploader(false);
		setShowPollCreator(false);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Create Post" size="lg">
			<div className="space-y-4">
				{/* Author info */}
				<div className="flex items-center gap-3">
					{userProfile && <Avatar name={userProfile.name + " " + userProfile.surname} src={userProfile.imageUrl} variant="user" />}
					<div>
						<p className="text-sm font-medium text-white">
							{userProfile?.name} {userProfile?.surname}
						</p>
						<p className="text-xs text-muted-foreground">Posting to {contextName}</p>
					</div>
				</div>

				{/* Editor */}
				<PostEditor
					content={content}
					onChange={setContent}
					placeholder="What's on your mind?"
					autoFocus
					contextType={contextType}
					contextId={contextId}
					enableMentions
				/>

				{/* Media Uploader */}
				{showMediaUploader && <PostMediaUploader mediaIds={mediaIds} onMediaChange={setMediaIds} />}
				{/* Poll Creator */}
				{showPollCreator && !poll && (
					<PollCreator
						onSave={(newPoll) => {
							setPoll(newPoll);
							setShowPollCreator(false);
						}}
						onCancel={() => setShowPollCreator(false)}
					/>
				)}

				{/* Poll Preview */}
				{poll && (
					<div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-primary">Poll attached</span>
							<button onClick={() => setPoll(null)} className="text-xs text-muted-foreground hover:text-destructive">
								Remove
							</button>
						</div>
						<p className="text-sm text-white">{poll.question}</p>
						<p className="text-xs text-muted-foreground mt-1">{poll.options.length} options</p>
					</div>
				)}
				{/* Actions bar */}
				<div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
					<button
						type="button"
						onClick={() => setShowMediaUploader(!showMediaUploader)}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
							showMediaUploader ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/10"
						}`}>
						<Image size={16} />
						Add Media
					</button>
					<button
						type="button"
						onClick={() => setShowPollCreator(!showPollCreator)}
						disabled={poll !== null}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
							showPollCreator || poll ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/10"
						} disabled:opacity-50`}>
						<BarChart3 size={16} />
						Add Poll
					</button>
				</div>

				{/* Visibility */}
				<div className="flex items-center gap-4">
					<label className="text-sm text-muted-foreground">Visibility:</label>
					<Select value={visibility} onChange={(value) => setVisibility(value as Visibility)} options={VisibilityOptions} />
				</div>

				{/* Submit */}
				<div className="flex justify-end gap-3 pt-2">
					<Button variant="ghost" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!canSubmit || createPost.isPending} loading={createPost.isPending}>
						Post
					</Button>
				</div>
			</div>
		</Modal>
	);
}
