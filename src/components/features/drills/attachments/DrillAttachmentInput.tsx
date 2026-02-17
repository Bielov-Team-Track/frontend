"use client";

import { Button } from "@/components";
import type { DrillAttachment } from "@/lib/models/Drill";
import { Plus, X, Link2, FileText, ImageIcon, Film, ExternalLink, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { isEmbedUrl, parseEmbedUrl, getProviderDisplayName } from "@/components/ui/media-preview";
import { useUrlVerification, type VerifiedType } from "./useUrlVerification";
import { formatFileSize } from "@/components/ui/media-preview";
import { cn } from "@/lib/utils";

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
	const [typeOverride, setTypeOverride] = useState<AttachmentType | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);

	const verification = useUrlVerification(newUrl);

	// Derive the effective type: verification auto-detect, then manual override
	const autoType: AttachmentType = verification.detectedType || "Video";
	const effectiveType = typeOverride || autoType;

	// Reset override when URL changes and auto-detect picks a different type
	useEffect(() => {
		setTypeOverride(null);
	}, [verification.detectedType]);

	const canAdd =
		newUrl.trim() &&
		(verification.status === "valid" || verification.status === "warning");

	const getFileName = (url: string): string => {
		// Use verified title if available
		if (verification.title) return verification.title;

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

	const addAttachment = () => {
		if (!canAdd) return;

		const attachment: AttachmentInput = {
			id: `new-${Date.now()}`,
			fileName: getFileName(newUrl),
			fileUrl: newUrl.trim(),
			fileType: effectiveType,
			fileSize: 0,
			isNew: true,
		};

		onChange([...attachments, attachment]);
		setNewUrl("");
		setTypeOverride(null);
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
			setTypeOverride(null);
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
					{/* URL input */}
					<div className="relative">
						<input
							type="url"
							value={newUrl}
							onChange={(e) => setNewUrl(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Paste URL (YouTube, image, document...)"
							className={cn(
								"w-full px-4 py-2 pr-9 rounded-xl bg-surface border text-white placeholder:text-muted/50 focus:outline-hidden text-sm",
								verification.status === "invalid"
									? "border-error/50 focus:border-error"
									: "border-border focus:border-accent",
							)}
							autoFocus
						/>
						{newUrl.trim() && (
							<div className="absolute right-3 top-1/2 -translate-y-1/2">
								{verification.status === "validating" && (
									<Loader2 size={14} className="text-muted animate-spin" />
								)}
								{verification.status === "valid" && (
									<CheckCircle2 size={14} className="text-green-400" />
								)}
								{verification.status === "warning" && (
									<AlertTriangle size={14} className="text-yellow-400" />
								)}
								{verification.status === "invalid" && (
									<XCircle size={14} className="text-error" />
								)}
							</div>
						)}
					</div>

					{/* Verification preview */}
					{newUrl.trim() && verification.status !== "idle" && verification.status !== "validating" && (
						<div className="flex items-start gap-2.5">
							{verification.thumbnailUrl && (
								<div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-surface border border-border">
									<img
										src={verification.thumbnailUrl}
										alt=""
										className="w-full h-full object-cover"
									/>
								</div>
							)}
							<div className="flex-1 min-w-0">
								{verification.title && (
									<p className="text-xs text-white truncate mb-0.5">{verification.title}</p>
								)}
								{verification.provider && (
									<p className="text-xs text-accent">
										{verification.provider === "youtube" ? "YouTube" : "Vimeo"}
									</p>
								)}
								{verification.error && (
									<p className={cn(
										"text-xs",
										verification.status === "invalid" ? "text-error" : "text-yellow-400/80",
									)}>
										{verification.error}
									</p>
								)}
							</div>
						</div>
					)}

					{/* Type selector - only show when URL is valid and not an embed (embeds are always Video) */}
					{newUrl.trim() && !verification.provider && (verification.status === "valid" || verification.status === "warning") && (
						<div className="flex items-center gap-3">
							<span className="text-xs text-muted">Type:</span>
							<div className="flex gap-1">
								{(["Video", "Image", "Document"] as AttachmentType[]).map((type) => (
									<button
										key={type}
										type="button"
										onClick={() => setTypeOverride(type)}
										className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
											effectiveType === type
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

					{/* Actions */}
					<div className="flex gap-2">
						<Button
							type="button"
							variant="ghost"
							color="neutral"
							size="sm"
							onClick={() => {
								setShowAddForm(false);
								setNewUrl("");
								setTypeOverride(null);
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
							disabled={!canAdd}
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
