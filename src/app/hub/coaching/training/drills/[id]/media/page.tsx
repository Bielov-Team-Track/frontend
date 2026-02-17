"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AddMediaMenu, Loader } from "@/components/ui";
import { MediaLightbox, type MediaItem, parseEmbedUrl, isEmbedUrl } from "@/components/ui/media-preview";
import MediaThumbnail, { UploadingThumbnail, type UploadingFile } from "@/components/features/drills/MediaThumbnail";
import { useDrill, useCanEditDrill, useAddDrillAttachment, useDeleteDrillAttachment } from "@/hooks/useDrills";
import { useAuth } from "@/providers";
import { DrillAttachmentTypeEnum } from "@/lib/models/Drill";
import { getDrillAttachmentUploadUrl, uploadFileToS3 } from "@/lib/api/drills";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, Check, X } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";

export default function DrillMediaGalleryPage() {
	const params = useParams();
	const drillId = params.id as string;
	const { userProfile } = useAuth();
	const { data: drill, isLoading, error } = useDrill(drillId);
	const { canEdit } = useCanEditDrill(drill, userProfile?.id);
	const addAttachment = useAddDrillAttachment();
	const deleteAttachment = useDeleteDrillAttachment();

	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

	// Selection state
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const lastClickedRef = useRef<string | null>(null);

	// Delete confirmation state
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
	const [isDeleting, setIsDeleting] = useState(false);

	const isSelecting = selectedIds.size > 0;

	// Escape to deselect
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isSelecting) {
				setSelectedIds(new Set());
				lastClickedRef.current = null;
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isSelecting]);

	const handleSelect = useCallback((attachmentId: string, e: React.MouseEvent) => {
		if (!canEdit) return;

		setSelectedIds((prev) => {
			const next = new Set(prev);

			if (e.shiftKey && lastClickedRef.current && attachmentId !== lastClickedRef.current) {
				// Shift+click: range select
				const ids = (drill?.attachments || []).map((a) => a.id);
				const startIdx = ids.indexOf(lastClickedRef.current);
				const endIdx = ids.indexOf(attachmentId);
				if (startIdx !== -1 && endIdx !== -1) {
					const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
					for (let i = from; i <= to; i++) {
						next.add(ids[i]);
					}
				}
			} else if (e.ctrlKey || e.metaKey) {
				// Ctrl/Cmd+click: toggle single
				if (next.has(attachmentId)) {
					next.delete(attachmentId);
				} else {
					next.add(attachmentId);
				}
			} else {
				// Plain click: toggle single (start/extend selection)
				if (next.has(attachmentId)) {
					next.delete(attachmentId);
				} else {
					next.add(attachmentId);
				}
			}

			return next;
		});

		lastClickedRef.current = attachmentId;
	}, [canEdit, drill?.attachments]);

	const handleSelectAll = useCallback(() => {
		const ids = (drill?.attachments || []).map((a) => a.id);
		setSelectedIds(new Set(ids));
	}, [drill?.attachments]);

	const handleDeselectAll = useCallback(() => {
		setSelectedIds(new Set());
		lastClickedRef.current = null;
	}, []);

	// Delete flow
	const openDeleteConfirm = useCallback((ids: string[]) => {
		setPendingDeleteIds(ids);
		setDeleteConfirmOpen(true);
	}, []);

	const handleConfirmDelete = async () => {
		setIsDeleting(true);
		try {
			for (const id of pendingDeleteIds) {
				await deleteAttachment.mutateAsync({ drillId, attachmentId: id });
			}
			setSelectedIds((prev) => {
				const next = new Set(prev);
				pendingDeleteIds.forEach((id) => next.delete(id));
				return next;
			});
		} finally {
			setIsDeleting(false);
			setDeleteConfirmOpen(false);
			setPendingDeleteIds([]);
		}
	};

	const handleDeleteSingle = (attachmentId: string) => {
		openDeleteConfirm([attachmentId]);
	};

	const handleDeleteSelected = () => {
		openDeleteConfirm(Array.from(selectedIds));
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader />
			</div>
		);
	}

	if (error || !drill) {
		notFound();
	}

	const attachments = drill.attachments || [];

	// Build media items for lightbox
	const mediaItems: MediaItem[] = [];

	const embeds = attachments.filter((a) => a.fileType === "Video" && isEmbedUrl(a.fileUrl));
	embeds.forEach((embed) => {
		const embedInfo = parseEmbedUrl(embed.fileUrl);
		if (embedInfo) {
			mediaItems.push({
				id: embed.id,
				type: "embed",
				url: embed.fileUrl,
				fileName: embed.fileName || embedInfo.provider,
				embedInfo,
			});
		}
	});

	const regularAttachments = attachments.filter((a) => !(a.fileType === "Video" && isEmbedUrl(a.fileUrl)));
	regularAttachments
		.filter((a) => a.fileType === "Image" || a.fileType === "Video")
		.forEach((a) => {
			mediaItems.push({
				id: a.id,
				type: a.fileType === "Image" ? "image" : "video",
				url: a.fileUrl,
				fileName: a.fileName,
				fileSize: a.fileSize,
			});
		});

	const openLightbox = (attachmentId: string) => {
		const index = mediaItems.findIndex((m) => m.id === attachmentId);
		if (index >= 0) {
			setLightboxIndex(index);
			setLightboxOpen(true);
		}
	};

	const detectType = (url: string): "Image" | "Video" | "Document" => {
		if (isEmbedUrl(url)) return "Video";
		if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(url)) return "Image";
		if (/\.(mp4|webm|mov|avi|mkv|m4v)(\?|$)/i.test(url)) return "Video";
		if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)(\?|$)/i.test(url)) return "Document";
		return "Video";
	};

	const handleAddUrl = async (url: string) => {
		const fileType = detectType(url);
		const fileTypeEnum = DrillAttachmentTypeEnum[fileType];
		await addAttachment.mutateAsync({
			drillId,
			data: {
				fileName: url.split("/").pop() || "Attachment",
				fileUrl: url,
				fileType: fileTypeEnum,
				fileSize: 0,
			},
		});
	};

	const uploadSingleFile = async (tempId: string, file: File) => {
		setUploadingFiles((prev) =>
			prev.map((u) => (u.id === tempId ? { ...u, status: "uploading" as const } : u)),
		);
		try {
			const { uploadUrl, fileUrl } = await getDrillAttachmentUploadUrl(
				drillId,
				file.name,
				file.type || "application/octet-stream",
				file.size,
			);
			await uploadFileToS3(uploadUrl, file);
			const isImage = file.type.startsWith("image/");
			const fileType = isImage
				? "Image"
				: file.type.startsWith("video/")
					? "Video"
					: "Document";
			await addAttachment.mutateAsync({
				drillId,
				data: {
					fileName: file.name,
					fileUrl,
					fileType: DrillAttachmentTypeEnum[fileType],
					fileSize: file.size,
				},
			});
			setUploadingFiles((prev) => {
				const entry = prev.find((u) => u.id === tempId);
				if (entry?.preview) URL.revokeObjectURL(entry.preview);
				return prev.filter((u) => u.id !== tempId);
			});
		} catch {
			setUploadingFiles((prev) =>
				prev.map((u) => (u.id === tempId ? { ...u, status: "error" as const } : u)),
			);
		}
	};

	const handleUploadFiles = async (files: File[]) => {
		for (const file of files) {
			const tempId = `temp-${Date.now()}-${Math.random()}`;
			const isImage = file.type.startsWith("image/");
			const preview = isImage ? URL.createObjectURL(file) : "";
			setUploadingFiles((prev) => [...prev, { id: tempId, file, preview, status: "uploading" }]);
			await uploadSingleFile(tempId, file);
		}
	};

	const handleRetryUpload = (id: string) => {
		const entry = uploadingFiles.find((u) => u.id === id);
		if (entry) uploadSingleFile(id, entry.file);
	};

	const deleteConfirmCount = pendingDeleteIds.length;

	return (
		<div className="max-w-4xl mx-auto">
			{/* Navigation */}
			<div className="flex items-center justify-between mb-8">
				<Link
					href={`/hub/coaching/training/drills/${drillId}`}
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft size={16} />
					Back to {drill.name}
				</Link>
				{canEdit && (
					<AddMediaMenu
						onAddUrl={handleAddUrl}
						onUploadFiles={handleUploadFiles}
						isLoading={addAttachment.isPending}
						label="Add Media"
					/>
				)}
			</div>

			{/* Header */}
			<header className="mb-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-white">Media</h1>
						<p className="text-sm text-muted mt-1">{attachments.length} items</p>
					</div>
					{canEdit && attachments.length > 0 && (
						<div className="flex items-center gap-2">
							{isSelecting ? (
								<>
									<button
										type="button"
										onClick={handleSelectAll}
										className="text-xs text-muted hover:text-white transition-colors"
									>
										Select all
									</button>
									<button
										type="button"
										onClick={handleDeselectAll}
										className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors"
									>
										<X size={12} />
										Clear
									</button>
								</>
							) : (
								<p className="text-xs text-muted/60">
									Click to select &middot; Shift for range &middot; Ctrl to toggle
								</p>
							)}
						</div>
					)}
				</div>
			</header>

			{/* Grid */}
			{attachments.length > 0 || uploadingFiles.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
					{attachments.map((attachment) => {
						const isSelected = selectedIds.has(attachment.id);
						return (
							<div
								key={attachment.id}
								className={`relative group cursor-pointer rounded-xl transition-all ${
									isSelected
										? "ring-2 ring-accent ring-offset-2 ring-offset-background"
										: ""
								}`}
								onClick={(e) => {
									if (isSelecting) {
										// In selection mode, clicks select
										handleSelect(attachment.id, e);
									} else if (e.ctrlKey || e.metaKey || e.shiftKey) {
										// Start selection with modifier keys
										handleSelect(attachment.id, e);
									} else {
										// Normal click: open lightbox
										if (attachment.fileType !== "Document") {
											openLightbox(attachment.id);
										}
									}
								}}
							>
								<MediaThumbnail
									attachment={attachment}
									className="!w-full !h-[120px] pointer-events-none"
								/>
								{/* Selection indicator */}
								{canEdit && (
									<div
										className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
											isSelected
												? "bg-accent border-accent"
												: "border-white/30 bg-black/30 opacity-0 group-hover:opacity-100"
										}`}
									>
										{isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
									</div>
								)}
								{/* Delete button (single) */}
								{canEdit && !isSelecting && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteSingle(attachment.id);
										}}
										className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-error opacity-0 group-hover:opacity-100 transition-all"
										title="Delete"
									>
										<Trash2 size={14} />
									</button>
								)}
							</div>
						);
					})}
					{uploadingFiles.map((upload) => (
						<UploadingThumbnail key={upload.id} upload={upload} onRetry={handleRetryUpload} />
					))}
				</div>
			) : (
				<div className="text-center py-16 text-muted">
					<p>No media yet</p>
					{canEdit && (
						<p className="text-sm mt-1">Add images, videos, or embed YouTube links</p>
					)}
				</div>
			)}

			{/* Selection toolbar */}
			{isSelecting && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface border border-border shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-200">
					<span className="text-sm text-white font-medium">
						{selectedIds.size} selected
					</span>
					<div className="w-px h-5 bg-border" />
					<button
						type="button"
						onClick={handleDeleteSelected}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-error bg-error/10 hover:bg-error/20 transition-colors"
					>
						<Trash2 size={14} />
						Delete
					</button>
					<button
						type="button"
						onClick={handleDeselectAll}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
					>
						<X size={14} />
						Cancel
					</button>
				</div>
			)}

			{/* Delete confirmation dialog */}
			<AlertDialog open={deleteConfirmOpen} onOpenChange={(open) => setDeleteConfirmOpen(open)}>
				<AlertDialogContent size="sm">
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {deleteConfirmCount === 1 ? "media item" : `${deleteConfirmCount} media items`}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							{deleteConfirmCount === 1
								? "This media item will be permanently removed from this drill."
								: `These ${deleteConfirmCount} media items will be permanently removed from this drill.`
							}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleConfirmDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Lightbox */}
			<MediaLightbox
				items={mediaItems}
				initialIndex={lightboxIndex}
				isOpen={lightboxOpen}
				onClose={() => setLightboxOpen(false)}
			/>
		</div>
	);
}
