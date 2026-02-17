"use client";

import { useState } from "react";
import { Button } from "@/components";
import {
	AnimationEditor,
	EditDrillModal,
	INTENSITY_COLORS,
	DrillAnimation,
	DrillInteractionBar,
	DrillCommentsSection,
	AnimationThumbnail,
	MediaThumbnail,
	UploadingThumbnail,
	type UploadingFile,
	MediaStrip,
} from "@/components/features/drills";
import { AddMediaMenu, Loader } from "@/components/ui";
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
import { MediaLightbox, type MediaItem, parseEmbedUrl, isEmbedUrl } from "@/components/ui/media-preview";
import { useDrill, useUpdateDrillAnimations, useCanEditDrill, useAddDrillAttachment, useDeleteDrillAttachment } from "@/hooks/useDrills";
import { useAuth } from "@/providers";
import { DrillAttachmentTypeEnum } from "@/lib/models/Drill";
import { getDrillAttachmentUploadUrl, uploadFileToS3 } from "@/lib/api/drills";
import { Clock, Dumbbell, Users, Pencil, ArrowLeft, ChevronRight, ListPlus, Clapperboard, ImagePlus, Trash2 } from "lucide-react";
import { useRef } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";

export default function DrillDetailPage() {
	const params = useParams();
	const drillId = params.id as string;
	const { userProfile } = useAuth();
	const { data: drill, isLoading, error } = useDrill(drillId);
	const { canEdit } = useCanEditDrill(drill, userProfile?.id);
	const updateAnimations = useUpdateDrillAnimations();
	const addAttachment = useAddDrillAttachment();
	const deleteAttachment = useDeleteDrillAttachment();
	const [showAnimationEditor, setShowAnimationEditor] = useState(false);
	const [editingAnimationIndex, setEditingAnimationIndex] = useState<number | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [animationLightboxIndex, setAnimationLightboxIndex] = useState(0);
	const [showAnimationLightbox, setShowAnimationLightbox] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const commentsRef = useRef<HTMLDivElement>(null);

	// Upload tracking state
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

	// Lightbox state for media
	const [mediaLightboxOpen, setMediaLightboxOpen] = useState(false);
	const [mediaLightboxIndex, setMediaLightboxIndex] = useState(0);

	// Delete confirmation state
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [isDeletingMedia, setIsDeletingMedia] = useState(false);

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

	const animations = drill.animations || [];

	const handleOpenAnimationEditor = (index?: number) => {
		setEditingAnimationIndex(index ?? null);
		setShowAnimationEditor(true);
	};

	const handleSaveAnimation = async (animation: DrillAnimation) => {
		setIsSaving(true);
		try {
			const updated = [...animations];
			if (editingAnimationIndex !== null) {
				updated[editingAnimationIndex] = animation;
			} else {
				updated.push(animation);
			}
			await updateAnimations.mutateAsync({ drillId, animations: updated });
			setShowAnimationEditor(false);
			setEditingAnimationIndex(null);
		} catch (err) {
			console.error("Failed to save animation:", err);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteAnimation = async (index: number) => {
		const updated = animations.filter((_, i) => i !== index);
		await updateAnimations.mutateAsync({ drillId, animations: updated });
	};

	const intensityColor = INTENSITY_COLORS[drill.intensity].color;
	const intensityDot = intensityColor === "success" ? "bg-success" : intensityColor === "warning" ? "bg-warning" : "bg-error";

	if (showAnimationEditor) {
		const initialAnimation = editingAnimationIndex !== null ? animations[editingAnimationIndex] : undefined;
		return (
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex items-center gap-4">
					<button
						onClick={() => { setShowAnimationEditor(false); setEditingAnimationIndex(null); }}
						className="p-2 rounded-lg hover:bg-white/10 transition-colors"
					>
						<ArrowLeft size={24} className="text-white" />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-white">
							{editingAnimationIndex !== null ? "Edit" : "Create"} Animation
						</h1>
						<p className="text-muted mt-1">for {drill.name}</p>
					</div>
				</div>
				<AnimationEditor
					initialAnimation={initialAnimation}
					onSave={handleSaveAnimation}
					onCancel={() => { setShowAnimationEditor(false); setEditingAnimationIndex(null); }}
					isSaving={isSaving}
				/>
			</div>
		);
	}

	const hasEquipment = drill.equipment?.length > 0;
	const hasInstructions = drill.instructions?.length > 0;
	const hasCoachingPoints = drill.coachingPoints?.length > 0;
	const hasVariations = drill.variations?.length > 0;
	const hasAnimations = animations.length > 0;
	const attachments = drill.attachments || [];
	const mediaCount = attachments.length;

	// Build animation media items for lightbox
	const animationMediaItems: MediaItem[] = animations
		.filter(anim => anim.keyframes?.length > 0)
		.map((anim, i) => ({
			id: `drill-animation-${i}`,
			type: "animation" as const,
			url: "",
			fileName: anim.name || `Animation ${i + 1}`,
			animation: {
				keyframes: anim.keyframes.map(kf => ({
					id: kf.id,
					players: kf.players.map(p => ({
						id: p.id,
						x: p.x,
						y: p.y,
						color: p.color,
						label: p.label,
					})),
					ball: kf.ball,
					equipment: kf.equipment?.map(e => ({
						id: e.id,
						type: e.type,
						x: e.x,
						y: e.y,
						rotation: e.rotation,
						label: e.label,
					})),
				})),
				speed: anim.speed,
			},
		}));

	const openAnimationLightbox = (animIndex: number) => {
		setAnimationLightboxIndex(animIndex);
		setShowAnimationLightbox(true);
	};

	// Build media items for lightbox (attachments only, not animations)
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

	const openMediaLightbox = (attachmentId: string) => {
		const index = mediaItems.findIndex((m) => m.id === attachmentId);
		if (index >= 0) {
			setMediaLightboxIndex(index);
			setMediaLightboxOpen(true);
		}
	};

	// Add media handlers
	const detectType = (url: string): "Image" | "Video" | "Document" => {
		if (isEmbedUrl(url)) return "Video";
		if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(url)) return "Image";
		if (/\.(mp4|webm|mov|avi|mkv|m4v)(\?|$)/i.test(url)) return "Video";
		if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)(\?|$)/i.test(url)) return "Document";
		return "Video";
	};

	const handleAddMediaUrl = async (url: string) => {
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

	const handleUploadMediaFiles = async (files: File[]) => {
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

	const handleDeleteMedia = (attachmentId: string) => {
		setPendingDeleteId(attachmentId);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDeleteMedia = async () => {
		if (!pendingDeleteId) return;
		setIsDeletingMedia(true);
		try {
			await deleteAttachment.mutateAsync({ drillId, attachmentId: pendingDeleteId });
		} finally {
			setIsDeletingMedia(false);
			setDeleteConfirmOpen(false);
			setPendingDeleteId(null);
		}
	};

	return (
		<>
		<div className="max-w-4xl mx-auto">
			{/* Navigation */}
			<div className="flex items-center justify-between mb-8">
				<Link
					href="/hub/coaching/training/drills"
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Drills
				</Link>
				{canEdit && (
					<Button
						variant="ghost"
						color="neutral"
						size="sm"
						leftIcon={<Pencil size={14} />}
						onClick={() => setShowEditModal(true)}
					>
						Edit
					</Button>
				)}
			</div>

			{/* Hero Section */}
			<header className="mb-10">
				{/* Category + Intensity indicator */}
				<div className="flex items-center gap-2 mb-3">
					<span className="text-xs font-medium text-muted/80 uppercase tracking-widest">{drill.category}</span>
					<span className={`w-1.5 h-1.5 rounded-full ${intensityDot}`} title={`${drill.intensity} Intensity`} />
				</div>

				{/* Title */}
				<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-5">{drill.name}</h1>

				{/* Meta chips */}
				<div className="flex flex-wrap items-center gap-3">
					{drill.duration && (
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-sm text-muted">
							<Clock size={14} className="text-accent" />
							{drill.duration} min
						</span>
					)}
					{drill.minPlayers && (
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-sm text-muted">
							<Users size={14} className="text-accent" />
							{drill.minPlayers}{drill.maxPlayers && drill.maxPlayers !== drill.minPlayers ? `–${drill.maxPlayers}` : "+"} players
						</span>
					)}
					{drill.skills.map((skill) => (
						<span
							key={skill}
							className="px-3 py-1.5 rounded-full bg-accent/10 text-sm text-accent font-medium"
						>
							{skill}
						</span>
					))}
				</div>

				{/* Interaction Bar */}
				<div className="mt-6 flex flex-wrap items-center gap-3">
					<DrillInteractionBar
						drillId={drillId}
						likeCount={drill.likeCount}
						isBookmarked={drill.isBookmarked}
						showComments={true}
						onCommentsClick={() => commentsRef.current?.scrollIntoView({ behavior: "smooth" })}
					/>
					<div className="hidden sm:block w-px h-6 bg-white/10" />
					<Button
						variant="ghost"
						color="neutral"
						size="sm"
						leftIcon={<ListPlus size={16} />}
					>
						Add to Training Plan
					</Button>
				</div>
			</header>

			{/* Description */}
			{drill.description && (
				<p className="text-lg text-muted/90 leading-relaxed mb-10 max-w-2xl">{drill.description}</p>
			)}

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-10">
					{/* Instructions */}
					{hasInstructions && (
						<section>
							<h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-5">How to Run</h2>
							<ol className="space-y-4">
								{drill.instructions.map((item, i) => (
									<li key={i} className="flex gap-4">
										<span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent text-sm font-bold flex items-center justify-center">
											{i + 1}
										</span>
										<span className="text-muted leading-relaxed pt-0.5">{item}</span>
									</li>
								))}
							</ol>
						</section>
					)}

					{/* Coaching Points */}
					{hasCoachingPoints && (
						<section>
							<h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-5">Coaching Points</h2>
							<ul className="space-y-3">
								{drill.coachingPoints.map((point, i) => (
									<li key={i} className="flex items-start gap-3">
										<span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
										<span className="text-muted leading-relaxed">{point}</span>
									</li>
								))}
							</ul>
						</section>
					)}

					{/* Variations */}
					{hasVariations && (
						<section>
							<h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-5">Related Drills</h2>
							<div className="space-y-1">
								{drill.variations.map((variation) => {
									const varIntensity = INTENSITY_COLORS[variation.drillIntensity]?.color;
									const varDot = varIntensity === "success" ? "bg-success" : varIntensity === "warning" ? "bg-warning" : "bg-error";
									return (
										<Link
											key={variation.id}
											href={`/hub/coaching/training/drills/${variation.drillId}`}
											className="flex items-center gap-3 py-3 px-4 -mx-4 rounded-xl hover:bg-white/5 transition-colors group"
										>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<span className="text-white font-medium group-hover:text-accent transition-colors">
														{variation.drillName}
													</span>
													<span className="text-xs text-muted/60">{variation.drillCategory}</span>
													<span className={`w-1.5 h-1.5 rounded-full ${varDot}`} />
												</div>
												{variation.note && (
													<p className="text-sm text-muted/70 mt-0.5">{variation.note}</p>
												)}
											</div>
											<ChevronRight size={16} className="text-muted/40 group-hover:text-accent transition-colors shrink-0" />
										</Link>
									);
								})}
							</div>
						</section>
					)}
				</div>

				{/* Sidebar */}
				<aside className="space-y-8">
					{/* Equipment */}
					{hasEquipment && (
						<section>
							<h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Equipment</h3>
							<div className="space-y-2.5">
								{drill.equipment.map((item, i) => (
									<div key={i} className="flex items-center gap-2.5 text-sm">
										<Dumbbell size={14} className={item.isOptional ? "text-muted/40" : "text-accent/70"} />
										<span className={item.isOptional ? "text-muted/60" : "text-muted"}>
											{item.name}
										</span>
										{item.isOptional && (
											<span className="text-xs text-muted/40">(optional)</span>
										)}
									</div>
								))}
							</div>
						</section>
					)}
				</aside>
			</div>

			{/* Animations Strip */}
			{(hasAnimations || canEdit) && (
				<div className="mt-12">
					<MediaStrip
						title="Animations"
						count={animations.length}
						canEdit={canEdit}
						onAdd={() => handleOpenAnimationEditor()}
						addLabel="Create animation"
						emptyState={canEdit ? {
							icon: Clapperboard,
							title: "No animations yet",
							description: "Create court animations to illustrate player movement and positioning",
						} : undefined}
					>
						{animations.map((anim, i) => (
							<AnimationThumbnail
								key={i}
								animation={anim}
								onClick={() => openAnimationLightbox(i)}
								onEdit={canEdit ? () => handleOpenAnimationEditor(i) : undefined}
								onDelete={canEdit ? () => handleDeleteAnimation(i) : undefined}
							/>
						))}
					</MediaStrip>
				</div>
			)}

			{/* Media Strip */}
			<div className="mt-8">
				<MediaStrip
					title="Media"
					count={mediaCount}
					canEdit={false}
					alwaysShow
					emptyState={canEdit ? {
						icon: ImagePlus,
						title: "No media yet",
						description: "Add images, videos, or embed YouTube links to enrich this drill",
					} : undefined}
					viewAllHref={`/hub/coaching/training/drills/${drillId}/media`}
					addButton={canEdit ? (
						<AddMediaMenu
							onAddUrl={handleAddMediaUrl}
							onUploadFiles={handleUploadMediaFiles}
							isLoading={addAttachment.isPending}
							label="Add media"
							size="sm"
							variant="dashed"
						/>
					) : undefined}
				>
					{attachments.map((attachment) => (
						<div key={attachment.id} className="relative group flex-shrink-0">
							<MediaThumbnail
								attachment={attachment}
								onClick={() => {
									if (attachment.fileType === "Document") return;
									openMediaLightbox(attachment.id);
								}}
							/>
							{canEdit && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleDeleteMedia(attachment.id);
									}}
									className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white/70 hover:text-error opacity-0 group-hover:opacity-100 transition-all"
									title="Delete"
								>
									<Trash2 size={12} />
								</button>
							)}
						</div>
					))}
					{uploadingFiles.map((upload) => (
						<UploadingThumbnail key={upload.id} upload={upload} onRetry={handleRetryUpload} />
					))}
				</MediaStrip>
			</div>

			{/* Comments Section */}
			<div ref={commentsRef} className="mt-12">
				<DrillCommentsSection drillId={drillId} />
			</div>
		</div>

		<EditDrillModal
			drill={drill}
			isOpen={showEditModal}
			onClose={() => setShowEditModal(false)}
		/>
		{/* Delete media confirmation */}
		<AlertDialog open={deleteConfirmOpen} onOpenChange={(open) => setDeleteConfirmOpen(open)}>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>Delete media item?</AlertDialogTitle>
					<AlertDialogDescription>
						This media item will be permanently removed from this drill.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeletingMedia}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={handleConfirmDeleteMedia}
						disabled={isDeletingMedia}
					>
						{isDeletingMedia ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>

		{/* Animation Lightbox */}
		{animationMediaItems.length > 0 && (
			<MediaLightbox
				items={animationMediaItems}
				initialIndex={animationLightboxIndex}
				isOpen={showAnimationLightbox}
				onClose={() => setShowAnimationLightbox(false)}
			/>
		)}

		{/* Media Lightbox */}
		<MediaLightbox
			items={mediaItems}
			initialIndex={mediaLightboxIndex}
			isOpen={mediaLightboxOpen}
			onClose={() => setMediaLightboxOpen(false)}
		/>
		</>
	);
}
