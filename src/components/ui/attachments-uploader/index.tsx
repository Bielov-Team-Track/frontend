"use client";

import { cn } from "@/lib/utils";
import { closestCenter, DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, FileText, GripVertical, Loader2, Paperclip, Plus, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MediaLightbox, type MediaItem } from "../media-preview";

// =============================================================================
// TYPES
// =============================================================================

export interface UploadedAttachment {
	id: string;
	file?: File; // Optional for existing media (already uploaded)
	preview: string; // Blob URL for new uploads, or actual URL for existing media
	type: "image" | "document";
	status: "uploading" | "done" | "error";
	name: string;
	// For existing media (when file is not available)
	mimeType?: string;
	fileSize?: number;
}

export interface AttachmentsUploaderProps {
	attachments: UploadedAttachment[];
	onAttachmentsChange: (attachments: UploadedAttachment[]) => void;
	onUpload: (file: File) => Promise<string>;
	maxFiles?: number;
	acceptedTypes?: string[];
	maxImageSize?: number;
	maxDocumentSize?: number;
	className?: string;
	/** Layout variant for the preview grid */
	variant?: "grid" | "horizontal" | "compact";
	/** Show empty dropzone when no attachments */
	showEmptyDropzone?: boolean;
	/** Custom dropzone height (only for empty state) */
	dropzoneHeight?: "sm" | "md" | "lg";
	/** Disable drop handling (when parent handles it) */
	disableDrop?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_ACCEPTED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const DEFAULT_MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

// =============================================================================
// SORTABLE ATTACHMENT ITEM
// =============================================================================

interface SortableAttachmentProps {
	attachment: UploadedAttachment;
	onRemove: (id: string) => void;
	onPreview: (id: string) => void;
	onRetry: (id: string) => void;
	variant: "grid" | "horizontal" | "compact";
	isDragging?: boolean;
}

function SortableAttachment({ attachment, onRemove, onPreview, onRetry, variant, isDragging }: SortableAttachmentProps) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: attachment.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const variantStyles = {
		grid: "aspect-square",
		horizontal: "w-16 h-16 shrink-0",
		compact: "w-12 h-12 shrink-0",
	};

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			// Don't trigger preview when clicking remove button
			if ((e.target as HTMLElement).closest("button")) return;
			// Don't preview while uploading or on error
			if (attachment.status !== "done") return;
			onPreview(attachment.id);
		},
		[attachment.id, attachment.status, onPreview],
	);

	return (
		<div
			ref={setNodeRef}
			style={style}
			onClick={handleClick}
			className={cn(
				"relative group rounded-lg overflow-hidden bg-white/5 border border-white/10",
				variantStyles[variant],
				isDragging && "opacity-50",
				attachment.status === "done" && "cursor-pointer",
			)}>
			{/* Content */}
			{attachment.type === "image" ? (
				<img src={attachment.preview} alt={attachment.name} className="w-full h-full object-cover" draggable={false} />
			) : (
				<div className="w-full h-full flex flex-col items-center justify-center p-1.5 bg-white/3">
					<FileText size={variant === "compact" ? 16 : 20} className="text-muted-foreground mb-0.5" />
					<span className="text-[8px] text-muted-foreground text-center truncate w-full px-0.5 leading-tight">
						{attachment.name.length > 8 ? `${attachment.name.slice(0, 6)}...` : attachment.name}
					</span>
				</div>
			)}

			{/* Hover overlay with preview icon */}
			{attachment.status === "done" && (
				<>
					{/* Dark overlay with centered preview icon */}
					<div
						className={cn(
							"absolute inset-0 flex items-center justify-center",
							"bg-black/0 group-hover:bg-black/40 transition-colors",
							"opacity-0 group-hover:opacity-100",
						)}>
						<Eye size={18} className="text-white drop-shadow-lg" />
					</div>

					{/* Drag handle - top left */}
					<div
						{...attributes}
						{...listeners}
						className={cn(
							"absolute top-0.5 left-0.5 p-0.5 rounded-full",
							"bg-black/60 hover:bg-black/80 transition-colors",
							"cursor-grab active:cursor-grabbing",
							"opacity-0 group-hover:opacity-100 z-10",
						)}>
						<GripVertical size={10} className="text-white" />
					</div>
				</>
			)}

			{/* Upload status overlay */}
			{attachment.status === "uploading" && (
				<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
					<Loader2 className="animate-spin text-white" size={variant === "compact" ? 14 : 18} />
				</div>
			)}

			{attachment.status === "error" && (
				<div className="absolute inset-0 bg-destructive/60 flex flex-col items-center justify-center gap-1">
					<span className="text-[9px] text-white font-medium">Failed</span>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onRetry(attachment.id);
						}}
						className={cn(
							"flex items-center gap-0.5 px-1.5 py-0.5 rounded",
							"bg-white/20 hover:bg-white/30 transition-colors",
							"text-[9px] text-white font-medium",
						)}>
						<RefreshCw size={10} />
						Retry
					</button>
				</div>
			)}

			{/* Remove button */}
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onRemove(attachment.id);
				}}
				className={cn(
					"absolute top-0.5 right-0.5 rounded-full bg-black/60 text-white",
					"opacity-0 group-hover:opacity-100 transition-opacity",
					"hover:bg-black/80 p-0.5 z-10",
				)}>
				<X size={10} />
			</button>
		</div>
	);
}

// =============================================================================
// ADD MORE PLACEHOLDER
// =============================================================================

interface AddMorePlaceholderProps {
	variant: "grid" | "horizontal" | "compact";
	onClick: () => void;
	isDragActive: boolean;
}

function AddMorePlaceholder({ variant, onClick, isDragActive }: AddMorePlaceholderProps) {
	const variantStyles = {
		grid: "aspect-square",
		horizontal: "w-16 h-16 shrink-0",
		compact: "w-12 h-12 shrink-0",
	};

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"rounded-lg border-2 border-dashed flex items-center justify-center transition-all",
				variantStyles[variant],
				isDragActive ? "border-primary bg-primary/10 scale-105" : "border-white/15 hover:border-white/30 hover:bg-white/5 bg-white/2",
			)}>
			<Plus size={variant === "compact" ? 16 : 20} className={cn("transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")} />
		</button>
	);
}

// =============================================================================
// DRAG OVERLAY ITEM
// =============================================================================

function DragOverlayItem({ attachment, variant }: { attachment: UploadedAttachment; variant: "grid" | "horizontal" | "compact" }) {
	const variantStyles = {
		grid: "w-20 h-20",
		horizontal: "w-16 h-16",
		compact: "w-12 h-12",
	};

	return (
		<div className={cn("rounded-lg overflow-hidden bg-white/10 border-2 border-primary shadow-xl", variantStyles[variant])}>
			{attachment.type === "image" ? (
				<img src={attachment.preview} alt={attachment.name} className="w-full h-full object-cover" />
			) : (
				<div className="w-full h-full flex flex-col items-center justify-center p-2 bg-white/5">
					<FileText size={variant === "compact" ? 16 : 20} className="text-muted-foreground" />
				</div>
			)}
		</div>
	);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AttachmentsUploader({
	attachments,
	onAttachmentsChange,
	onUpload,
	maxFiles = 10,
	acceptedTypes = DEFAULT_ACCEPTED_TYPES,
	maxImageSize = DEFAULT_MAX_IMAGE_SIZE,
	maxDocumentSize = DEFAULT_MAX_DOCUMENT_SIZE,
	className,
	variant = "grid",
	showEmptyDropzone = true,
	dropzoneHeight = "md",
	disableDrop = false,
}: AttachmentsUploaderProps) {
	const [isDragActive, setIsDragActive] = useState(false);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// Convert attachments to MediaItems for lightbox (images and documents)
	const previewableAttachments = useMemo(
		() => attachments.filter((a) => a.status === "done"),
		[attachments]
	);

	// Store blob URLs for documents to use in lightbox
	const documentBlobUrls = useRef<Map<string, string>>(new Map());

	const mediaItems: MediaItem[] = useMemo(() => {
		// Clean up old blob URLs that are no longer needed
		const currentIds = new Set(previewableAttachments.map((a) => a.id));
		for (const [id, url] of documentBlobUrls.current) {
			if (!currentIds.has(id)) {
				URL.revokeObjectURL(url);
				documentBlobUrls.current.delete(id);
			}
		}

		return previewableAttachments.map((a) => {
			if (a.type === "image") {
				return {
					id: a.id,
					type: "image" as const,
					url: a.preview,
					fileName: a.name,
					mimeType: a.file?.type ?? a.mimeType,
					fileSize: a.file?.size ?? a.fileSize,
				};
			} else {
				// For documents, create/reuse blob URL (only if we have a file)
				let blobUrl = documentBlobUrls.current.get(a.id);
				if (!blobUrl && a.file) {
					blobUrl = URL.createObjectURL(a.file);
					documentBlobUrls.current.set(a.id, blobUrl);
				}
				return {
					id: a.id,
					type: "document" as const,
					url: blobUrl ?? a.preview, // Use preview URL for existing media
					fileName: a.name,
					mimeType: a.file?.type ?? a.mimeType,
					fileSize: a.file?.size ?? a.fileSize,
				};
			}
		});
	}, [previewableAttachments]);

	// Cleanup blob URLs on unmount
	useEffect(() => {
		const blobUrls = documentBlobUrls.current;
		return () => {
			for (const url of blobUrls.values()) {
				URL.revokeObjectURL(url);
			}
			blobUrls.clear();
		};
	}, []);

	// Handle preview click
	const handlePreview = useCallback(
		(id: string) => {
			const index = previewableAttachments.findIndex((a) => a.id === id);
			if (index !== -1) {
				setLightboxIndex(index);
				setLightboxOpen(true);
			}
		},
		[previewableAttachments],
	);

	// Handle retry for failed uploads
	const handleRetry = useCallback(
		async (id: string) => {
			const attachment = attachments.find((a) => a.id === id);
			if (!attachment || attachment.status !== "error" || !attachment.file) return;

			// Set status back to uploading
			onAttachmentsChange(attachments.map((a) => (a.id === id ? { ...a, status: "uploading" as const } : a)));

			try {
				const mediaId = await onUpload(attachment.file);

				// Update with real ID and done status
				onAttachmentsChange((prev: UploadedAttachment[]) => prev.map((a) => (a.id === id ? { ...a, id: mediaId, status: "done" as const } : a)));
			} catch {
				// Set back to error status
				onAttachmentsChange((prev: UploadedAttachment[]) => prev.map((a) => (a.id === id ? { ...a, status: "error" as const } : a)));
			}
		},
		[attachments, onAttachmentsChange, onUpload],
	);

	// Handle file upload
	const handleFiles = useCallback(
		async (files: File[]) => {
			const remainingSlots = maxFiles - attachments.length;
			const filesToUpload = files.filter((file) => acceptedTypes.includes(file.type)).slice(0, remainingSlots);

			for (const file of filesToUpload) {
				const isImage = file.type.startsWith("image/");
				const maxSize = isImage ? maxImageSize : maxDocumentSize;

				if (file.size > maxSize) {
					// TODO: Show error toast
					continue;
				}

				const tempId = `temp-${Date.now()}-${Math.random()}`;
				const preview = isImage ? URL.createObjectURL(file) : "";

				// Add to attachments with uploading status
				const newAttachment: UploadedAttachment = {
					id: tempId,
					file,
					preview,
					type: isImage ? "image" : "document",
					status: "uploading",
					name: file.name,
				};

				onAttachmentsChange([...attachments, newAttachment]);

				try {
					const mediaId = await onUpload(file);

					// Update with real ID
					onAttachmentsChange((prev: UploadedAttachment[]) =>
						prev.map((a) => (a.id === tempId ? { ...a, id: mediaId, status: "done" as const } : a)),
					);
				} catch {
					onAttachmentsChange((prev: UploadedAttachment[]) => prev.map((a) => (a.id === tempId ? { ...a, status: "error" as const } : a)));
				}
			}
		},
		[attachments, maxFiles, acceptedTypes, maxImageSize, maxDocumentSize, onUpload, onAttachmentsChange],
	);

	// Drag and drop handlers
	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragActive(false);
			const files = Array.from(e.dataTransfer.files);
			handleFiles(files);
		},
		[handleFiles],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(false);
	}, []);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files || []);
			handleFiles(files);
			e.target.value = "";
		},
		[handleFiles],
	);

	// Remove attachment
	const removeAttachment = useCallback(
		(id: string) => {
			const attachment = attachments.find((a) => a.id === id);
			if (attachment?.preview) {
				URL.revokeObjectURL(attachment.preview);
			}
			onAttachmentsChange(attachments.filter((a) => a.id !== id));
		},
		[attachments, onAttachmentsChange],
	);

	// DnD handlers
	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveId(null);

			if (over && active.id !== over.id) {
				const oldIndex = attachments.findIndex((a) => a.id === active.id);
				const newIndex = attachments.findIndex((a) => a.id === over.id);
				onAttachmentsChange(arrayMove(attachments, oldIndex, newIndex));
			}
		},
		[attachments, onAttachmentsChange],
	);

	const activeAttachment = activeId ? attachments.find((a) => a.id === activeId) : null;

	// Layout styles
	const gridStyles = {
		grid: "grid grid-cols-4 gap-2",
		horizontal: "flex gap-2 overflow-x-auto pb-1 scrollbar-thin",
		compact: "flex gap-1.5 flex-wrap",
	};

	const dropzoneHeights = {
		sm: "py-3",
		md: "py-5",
		lg: "py-8",
	};

	const hasAttachments = attachments.length > 0;
	const canAddMore = attachments.length < maxFiles;

	// Hidden file input
	const fileInput = <input ref={inputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleInputChange} className="hidden" />;

	// Empty state with dropzone
	if (!hasAttachments && showEmptyDropzone) {
		return (
			<div className={className}>
				{fileInput}
				<div
					onDrop={disableDrop ? undefined : handleDrop}
					onDragOver={disableDrop ? undefined : handleDragOver}
					onDragLeave={disableDrop ? undefined : handleDragLeave}
					onClick={() => inputRef.current?.click()}
					className={cn(
						"border border-dashed rounded-xl text-center cursor-pointer transition-all duration-200",
						dropzoneHeights[dropzoneHeight],
						isDragActive ? "border-primary bg-primary/10 scale-[1.01]" : "border-white/10 hover:border-white/20 hover:bg-white/2",
					)}>
					<div className="flex flex-col items-center gap-1">
						<Paperclip size={20} className={cn("text-muted-foreground", isDragActive && "text-primary")} />
						<p className="text-sm text-muted-foreground">{isDragActive ? "Drop files here" : "Drag & drop or click to upload"}</p>
						<p className="text-xs text-muted-foreground/60">Images (10MB) or documents (25MB)</p>
					</div>
				</div>
			</div>
		);
	}

	// With attachments - show grid/list with plus placeholder at end
	return (
		<div
			className={className}
			onDrop={disableDrop ? undefined : handleDrop}
			onDragOver={disableDrop ? undefined : handleDragOver}
			onDragLeave={disableDrop ? undefined : handleDragLeave}>
			{fileInput}

			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
				<SortableContext items={attachments.map((a) => a.id)} strategy={horizontalListSortingStrategy}>
					<div className={gridStyles[variant]}>
						{attachments.map((attachment) => (
							<SortableAttachment
								key={attachment.id}
								attachment={attachment}
								onRemove={removeAttachment}
								onPreview={handlePreview}
								onRetry={handleRetry}
								variant={variant}
								isDragging={attachment.id === activeId}
							/>
						))}

						{/* Plus placeholder at end */}
						{canAddMore && <AddMorePlaceholder variant={variant} onClick={() => inputRef.current?.click()} isDragActive={isDragActive} />}
					</div>
				</SortableContext>

				<DragOverlay>{activeAttachment && <DragOverlayItem attachment={activeAttachment} variant={variant} />}</DragOverlay>
			</DndContext>

			{/* Lightbox for image previews */}
			<MediaLightbox items={mediaItems} initialIndex={lightboxIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} />
		</div>
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { AttachmentsUploader };
