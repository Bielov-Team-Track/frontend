"use client";

import { Avatar, Button, Input } from "@/components/ui";
import { useAuth } from "@/providers";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";

interface CommentEditorProps {
	onSubmit: (content: string) => Promise<void>;
	placeholder?: string;
	autoFocus?: boolean;
	isSubmitting?: boolean;
}

export default function CommentEditor({ onSubmit, placeholder = "Write a comment...", autoFocus = false, isSubmitting = false }: CommentEditorProps) {
	const { userProfile } = useAuth();
	const [content, setContent] = useState("");

	const handleSubmit = async () => {
		if (!content.trim() || isSubmitting) return;
		await onSubmit(content.trim());
		setContent("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<div className="flex items-start gap-3">
			{userProfile && (
				<Avatar name={`${userProfile.name} ${userProfile.surname}`} src={userProfile.imageUrl} variant="user" className="w-8 h-8 shrink-0" />
			)}
			<div className="flex-1 flex items-center gap-2">
				<Input
					type="text"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					autoFocus={autoFocus}
					disabled={isSubmitting}
					className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none"
				/>
				<Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting} variant={"ghost"}>
					{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
				</Button>
			</div>
		</div>
	);
}
