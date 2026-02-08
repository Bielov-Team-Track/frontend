"use client";

import { useState, useRef, useCallback } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Plus, Link2, Upload, X, Loader2, CheckCircle2, AlertTriangle, XCircle, Film, ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUrlVerification } from "@/components/features/drills/attachments/useUrlVerification";

// =============================================================================
// TYPES
// =============================================================================

export interface AddMediaMenuProps {
	/** Called when user submits a URL (embed or direct link) */
	onAddUrl: (url: string) => void | Promise<void>;
	/** Called when user selects files for upload */
	onUploadFiles: (files: File[]) => void | Promise<void>;
	/** Whether an add/upload operation is in progress */
	isLoading?: boolean;
	/** Custom trigger element. If not provided, renders a default button */
	trigger?: React.ReactNode;
	/** Accepted file types for upload input */
	acceptedFileTypes?: string;
	/** Allow multiple file selection */
	multiple?: boolean;
	/** Custom label for the trigger button */
	label?: string;
	/** Size variant */
	size?: "sm" | "md";
	/** Button style: "button" renders a ghost button, "dashed" renders a dashed-border card */
	variant?: "button" | "dashed";
	/** Additional class name for the root */
	className?: string;
	/** Dropdown alignment */
	align?: "start" | "center" | "end";
}

// =============================================================================
// URL INPUT INLINE WITH VERIFICATION
// =============================================================================

interface UrlInputInlineProps {
	onSubmit: (url: string) => void | Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

function UrlInputInline({ onSubmit, onCancel, isLoading }: UrlInputInlineProps) {
	const [url, setUrl] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const verification = useUrlVerification(url);

	const canSubmit =
		url.trim() &&
		!isLoading &&
		(verification.status === "valid" || verification.status === "warning");

	const handleSubmit = async () => {
		if (!canSubmit) return;
		await onSubmit(url.trim());
		setUrl("");
	};

	const typeIcon = verification.detectedType === "Image"
		? <ImageIcon size={14} className="text-green-400" />
		: verification.detectedType === "Video"
			? <Film size={14} className="text-purple-400" />
			: verification.detectedType === "Document"
				? <FileText size={14} className="text-blue-400" />
				: null;

	return (
		<div className="space-y-2">
			<div className="flex gap-2 items-center">
				<div className="flex-1 relative">
					<input
						ref={inputRef}
						type="url"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
							if (e.key === "Escape") { onCancel(); }
						}}
						placeholder="Paste URL (YouTube, image, document...)"
						className={cn(
							"w-full px-4 py-2 rounded-xl bg-surface border text-white placeholder:text-muted/50 focus:outline-hidden text-sm",
							verification.status === "invalid"
								? "border-error/50 focus:border-error"
								: "border-border focus:border-accent",
						)}
						autoFocus
						disabled={isLoading}
					/>
					{/* Status indicator inside input */}
					{url.trim() && (
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
				<Button
					variant="default"
					color="accent"
					size="sm"
					onClick={handleSubmit}
					disabled={!canSubmit}
				>
					{isLoading ? "Adding..." : "Add"}
				</Button>
				<button
					type="button"
					onClick={onCancel}
					className="p-2 text-muted hover:text-white transition-colors"
				>
					<X size={16} />
				</button>
			</div>

			{/* Preview / status row */}
			{url.trim() && verification.status !== "idle" && verification.status !== "validating" && (
				<div className="flex items-start gap-2.5 px-1">
					{/* Thumbnail preview */}
					{verification.thumbnailUrl && (
						<div className="flex-shrink-0 w-16 h-11 rounded-md overflow-hidden bg-surface">
							<img
								src={verification.thumbnailUrl}
								alt=""
								className="w-full h-full object-cover"
							/>
						</div>
					)}

					<div className="flex-1 min-w-0">
						{/* Title + type */}
						{verification.status === "valid" && (
							<div className="flex items-center gap-1.5">
								{typeIcon}
								<span className="text-xs text-white truncate">
									{verification.title || (verification.provider
										? `${verification.provider === "youtube" ? "YouTube" : "Vimeo"} video`
										: verification.detectedType || "Media")}
								</span>
							</div>
						)}

						{/* Error / warning message */}
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
		</div>
	);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AddMediaMenu({
	onAddUrl,
	onUploadFiles,
	isLoading,
	trigger,
	acceptedFileTypes = "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx",
	multiple = true,
	label = "Add media",
	size = "sm",
	variant = "button",
	className,
	align = "start",
}: AddMediaMenuProps) {
	const [showUrlInput, setShowUrlInput] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files || []);
			if (files.length > 0) {
				onUploadFiles(files);
			}
			e.target.value = "";
		},
		[onUploadFiles],
	);

	const handleUrlSubmit = async (url: string) => {
		await onAddUrl(url);
		setShowUrlInput(false);
	};

	// If URL input is showing, render it inline instead of the menu
	if (showUrlInput) {
		return (
			<div className={cn("max-w-md", className)}>
				<UrlInputInline
					onSubmit={handleUrlSubmit}
					onCancel={() => setShowUrlInput(false)}
					isLoading={isLoading}
				/>
			</div>
		);
	}

	const iconSize = size === "sm" ? 14 : 16;

	return (
		<div className={className}>
			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept={acceptedFileTypes}
				multiple={multiple}
				onChange={handleFileChange}
				className="hidden"
			/>

			<DropdownMenu>
				{trigger ? (
					<DropdownMenuTrigger render={<span />}>
						{trigger}
					</DropdownMenuTrigger>
				) : variant === "button" ? (
					<DropdownMenuTrigger
						render={<Button variant="ghost" color="neutral" size={size} />}
					>
						<Plus size={iconSize} />
						{label}
					</DropdownMenuTrigger>
				) : (
					<DropdownMenuTrigger
						render={
							<button
								type="button"
								className={cn(
									"flex items-center gap-1.5 rounded-lg transition-colors text-muted hover:text-white",
									size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
									"bg-white/[0.02] hover:bg-white/5 border border-dashed border-white/10 hover:border-white/20",
								)}
							/>
						}
					>
						<Plus size={iconSize} />
						{label}
					</DropdownMenuTrigger>
				)}

				<DropdownMenuContent align={align} sideOffset={6}>
					<DropdownMenuItem
						onClick={() => fileInputRef.current?.click()}
						className="gap-2"
					>
						<Upload size={16} className="text-muted-foreground" />
						Upload file
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setShowUrlInput(true)}
						className="gap-2"
					>
						<Link2 size={16} className="text-muted-foreground" />
						Paste URL
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { AddMediaMenu, UrlInputInline };
