"use client";

import { Button } from "@/components";
import type { DrillAttachment } from "@/lib/models/Drill";
import { Plus, X, Link2, FileText, ImageIcon, Film, GripVertical, ExternalLink } from "lucide-react";
import { useState } from "react";
import { isEmbedUrl, parseEmbedUrl, getProviderDisplayName } from "./embedUtils";
import { formatFileSize } from "@/components/ui/media-preview";

export type AttachmentType = "Image" | "Video" | "Document";

export interface AttachmentInput {
	id: string;
	fileName: string;
	fileUrl: string;
	fileType: AttachmentType;
	fileSize: number;
	isNew?: boolean; // true if added in this session
}

interface DrillAttachmentInputProps {
	attachments: AttachmentInput[];
	onChange: (attachments: AttachmentInput[]) => void;
	className?: string;
}

export default function DrillAttachmentInput({ attachments, onChange, className }: DrillAttachmentInputProps) {
	const [newUrl, setNewUrl] = useState("");
	const [newType, setNewType] = useState<AttachmentType>("Video");
	const [showAddForm, setShowAddForm] = useState(false);

	const detectType = (url: string): AttachmentType => {
		const lowerUrl = url.toLowerCase();

		// Check for embed URLs first
		if (isEmbedUrl(url)) {
			return "Video";
		}

		// Check file extensions
		if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(lowerUrl)) {
			return "Image";
		}
		if (/\.(mp4|webm|mov|avi|mkv|m4v)(\?|$)/i.test(lowerUrl)) {
			return "Video";
		}
		if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)(\?|$)/i.test(lowerUrl)) {
			return "Document";
		}

		return "Video"; // Default for embeds
	};

	const getFileName = (url: string): string => {
		// For embeds, use provider name
		const embed = parseEmbedUrl(url);
		if (embed) {
			return `${getProviderDisplayName(embed.provider)} Video`;
		}

		// Try to extract filename from URL
		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			const segments = pathname.split("/").filter(Boolean);
			if (segments.length > 0) {
				const lastSegment = segments[segments.length - 1];
				// Decode and clean up
				const decoded = decodeURIComponent(lastSegment);
				if (decoded.includes(".")) {
					return decoded;
				}
			}
		} catch {
			// Invalid URL
		}

		return "Attachment";
	};

	const handleUrlChange = (url: string) => {
		setNewUrl(url);
		// Auto-detect type
		if (url.trim()) {
			setNewType(detectType(url));
		}
	};

	const addAttachment = () => {
		if (!newUrl.trim()) return;

		const attachment: AttachmentInput = {
			id: `new-${Date.now()}`,
			fileName: getFileName(newUrl),
			fileUrl: newUrl.trim(),
			fileType: newType,
			fileSize: 0,
			isNew: true,
		};

		onChange([...attachments, attachment]);
		setNewUrl("");
		setShowAddForm(false);
	};

	const removeAttachment = (id: string) => {
		onChange(attachments.filter((a) => a.id !== id));
	};

	const getIcon = (type: AttachmentType) => {
		switch (type) {
			case "Image":
				return <ImageIcon size={16} className="text-green-400" />;
			case "Video":
				return <Film size={16} className="text-purple-400" />;
			case "Document":
				return <FileText size={16} className="text-blue-400" />;
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addAttachment();
		}
		if (e.key === "Escape") {
			setShowAddForm(false);
			setNewUrl("");
		}
	};

	return (
		<div className={className}>
			{/* Existing attachments */}
			{attachments.length > 0 && (
				<div className="space-y-2 mb-3">
					{attachments.map((attachment) => {
						const embed = parseEmbedUrl(attachment.fileUrl);

						return (
							<div
								key={attachment.id}
								className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border group"
							>
								<div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
									{getIcon(attachment.fileType)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-white truncate">{attachment.fileName}</p>
									<div className="flex items-center gap-2 text-xs text-muted">
										<span>{attachment.fileType}</span>
										{embed && (
											<span className="text-accent">{getProviderDisplayName(embed.provider)}</span>
										)}
										{attachment.fileSize > 0 && (
											<span>{formatFileSize(attachment.fileSize)}</span>
										)}
										{attachment.isNew && (
											<span className="text-accent">New</span>
										)}
									</div>
								</div>
								<a
									href={attachment.fileUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="p-1.5 rounded hover:bg-hover text-muted hover:text-white transition-colors"
									title="Open in new tab"
								>
									<ExternalLink size={14} />
								</a>
								<button
									type="button"
									onClick={() => removeAttachment(attachment.id)}
									className="p-1.5 rounded hover:bg-hover text-muted hover:text-error transition-colors"
									title="Remove attachment"
								>
									<X size={14} />
								</button>
							</div>
						);
					})}
				</div>
			)}

			{/* Add form */}
			{showAddForm ? (
				<div className="space-y-3 p-3 rounded-xl bg-surface border border-border">
					<div className="flex gap-2">
						<div className="flex-1">
							<input
								type="url"
								value={newUrl}
								onChange={(e) => handleUrlChange(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Paste URL (YouTube, image, document...)"
								className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent text-sm"
								autoFocus
							/>
						</div>
					</div>

					{newUrl.trim() && (
						<div className="flex items-center gap-3">
							<span className="text-xs text-muted">Type:</span>
							<div className="flex gap-1">
								{(["Video", "Image", "Document"] as AttachmentType[]).map((type) => (
									<button
										key={type}
										type="button"
										onClick={() => setNewType(type)}
										className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
											newType === type
												? "bg-accent text-white"
												: "bg-surface text-muted hover:bg-hover"
										}`}
									>
										{type}
									</button>
								))}
							</div>
						</div>
					)}

					<div className="flex gap-2">
						<Button
							type="button"
							variant="ghost"
							color="neutral"
							size="sm"
							onClick={() => {
								setShowAddForm(false);
								setNewUrl("");
							}}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="default"
							color="accent"
							size="sm"
							onClick={addAttachment}
							disabled={!newUrl.trim()}
						>
							Add Attachment
						</Button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setShowAddForm(true)}
					className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-muted hover:border-border hover:text-white hover:bg-surface transition-all"
				>
					<Link2 size={16} />
					<span className="text-sm">Add attachment (URL)</span>
				</button>
			)}

			<p className="text-xs text-muted mt-2">
				Supports YouTube, Vimeo, images, videos, and documents
			</p>
		</div>
	);
}
