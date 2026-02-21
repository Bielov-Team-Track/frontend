"use client";

import { useState } from "react";
import { Button } from "@/components";
import { Badge, Modal } from "@/components/ui";
import { MediaLightbox, type MediaItem, parseEmbedUrl, isEmbedUrl } from "@/components/ui/media-preview";
import { Clock, Dumbbell, Plus, Users } from "lucide-react";
import { CATEGORY_COLORS, Drill, INTENSITY_COLORS } from "./types";
import AnimationThumbnail from "./AnimationThumbnail";
import MediaThumbnail from "./MediaThumbnail";
import MediaStrip from "./MediaStrip";
import type { DrillAttachment } from "@/lib/models/Drill";

interface DrillDetailModalProps {
	drill: Drill | null;
	isOpen: boolean;
	onClose: () => void;
	onAddToTimeline?: (drill: Drill) => void;
	showAddButton?: boolean;
}

export default function DrillDetailModal({
	drill,
	isOpen,
	onClose,
	onAddToTimeline,
	showAddButton = false,
}: DrillDetailModalProps) {
	const [showAnimationLightbox, setShowAnimationLightbox] = useState(false);
	const [animationLightboxIndex, setAnimationLightboxIndex] = useState(0);
	const [showMediaLightbox, setShowMediaLightbox] = useState(false);
	const [mediaLightboxIndex, setMediaLightboxIndex] = useState(0);

	if (!drill) return null;

	const handleAdd = () => {
		onAddToTimeline?.(drill);
		onClose();
	};

	// Build animation media items for lightbox
	const animationMediaItems: MediaItem[] = (drill.animations || [])
		.filter((anim) => anim.keyframes?.length > 0)
		.map((anim, i) => ({
			id: `drill-animation-${i}`,
			type: "animation" as const,
			url: "",
			fileName: anim.name || `Animation ${i + 1}`,
			animation: {
				keyframes: anim.keyframes.map((kf) => ({
					id: kf.id,
					players: kf.players.map((p) => ({
						id: p.id,
						x: p.x,
						y: p.y,
						color: p.color,
						label: p.label,
					})),
					ball: kf.ball,
					equipment: kf.equipment?.map((e) => ({
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

	// Attachments may or may not exist depending on the Drill type variant passed in
	const attachments: DrillAttachment[] = (drill as Drill & { attachments?: DrillAttachment[] }).attachments || [];

	// Build media items for lightbox (images/videos only, documents open in new tab)
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

	const openAnimationLightbox = (index: number) => {
		setAnimationLightboxIndex(index);
		setShowAnimationLightbox(true);
	};

	const openMediaLightbox = (attachmentId: string) => {
		const idx = mediaItems.findIndex((m) => m.id === attachmentId);
		if (idx !== -1) {
			setMediaLightboxIndex(idx);
			setShowMediaLightbox(true);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={drill.name} size="lg">
			<div className="space-y-6">
				{/* Badges */}
				<div className="flex flex-wrap items-center gap-2">
					<Badge color={CATEGORY_COLORS[drill.category].color} variant="ghost">
						{drill.category}
					</Badge>
					<Badge color={INTENSITY_COLORS[drill.intensity].color} variant="outline">
						{drill.intensity} Intensity
					</Badge>
				</div>

				{/* Quick Stats */}
				<div className="flex flex-wrap gap-4 text-sm text-muted">
					<span className="flex items-center gap-2">
						<Clock size={16} className="text-accent" />
						{drill.duration} minutes
					</span>
					{drill.minPlayers && (
						<span className="flex items-center gap-2">
							<Users size={16} className="text-accent" />
							{drill.minPlayers}
							{drill.maxPlayers && drill.maxPlayers !== drill.minPlayers ? `-${drill.maxPlayers}` : "+"} players
						</span>
					)}
				</div>

				{/* Animations */}
				{drill.animations?.length > 0 && (
					<MediaStrip title="Animations" count={drill.animations.length} canEdit={false}>
						{drill.animations.map((anim, i) => (
							<AnimationThumbnail
								key={i}
								animation={anim}
								onClick={() => openAnimationLightbox(i)}
							/>
						))}
					</MediaStrip>
				)}

				{/* Media */}
				{attachments.length > 0 && (
					<MediaStrip title="Media" count={attachments.length} canEdit={false}>
						{attachments.map((attachment) => (
							<MediaThumbnail
								key={attachment.id}
								attachment={attachment}
								onClick={() => {
									if (attachment.fileType !== "Document") {
										openMediaLightbox(attachment.id);
									}
								}}
							/>
						))}
					</MediaStrip>
				)}

				{/* Description */}
				<Section title="Description">
					<p className="text-muted leading-relaxed">{drill.description}</p>
				</Section>

				{/* Skills */}
				<Section title="Skills Developed">
					<div className="flex flex-wrap gap-2">
						{drill.skills.map((skill) => (
							<Badge key={skill} color="neutral" variant="ghost">
								{skill}
							</Badge>
						))}
					</div>
				</Section>

				{/* Instructions */}
				{drill.instructions?.length ? (
					<Section title="Instructions">
						<ol className="list-decimal list-inside space-y-2 text-muted">
							{drill.instructions.map((item, i) => (
								<li key={i} className="leading-relaxed">
									{item}
								</li>
							))}
						</ol>
					</Section>
				) : null}

				{/* Coaching Points */}
				{drill.coachingPoints?.length ? (
					<Section title="Coaching Points">
						<ul className="list-disc list-inside space-y-1 text-muted">
							{drill.coachingPoints.map((point, i) => (
								<li key={i}>{point}</li>
							))}
						</ul>
					</Section>
				) : null}

				{/* Variations */}
				{drill.variations?.length ? (
					<Section title="Variations">
						<ul className="list-disc list-inside space-y-1 text-muted">
							{drill.variations.map((item, i) => (
								<li key={i}>{item}</li>
							))}
						</ul>
					</Section>
				) : null}

				{/* Equipment */}
				{drill.equipment?.length ? (
					<Section title="Equipment Needed">
						<div className="flex flex-wrap gap-2">
							{drill.equipment.map((item, i) => (
								<Badge key={i} color="neutral" variant="ghost" icon={<Dumbbell size={12} />}>
									{item.name}
								</Badge>
							))}
						</div>
					</Section>
				) : null}

				{/* Actions */}
				<div className="flex justify-end gap-3 pt-4 border-t border-border">
					<Button variant="ghost" color="neutral" onClick={onClose}>
						Close
					</Button>
					{showAddButton && onAddToTimeline && (
						<Button color="primary" leftIcon={<Plus size={16} />} onClick={handleAdd}>
							Add to Timeline
						</Button>
					)}
				</div>

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
				{mediaItems.length > 0 && (
					<MediaLightbox
						items={mediaItems}
						initialIndex={mediaLightboxIndex}
						isOpen={showMediaLightbox}
						onClose={() => setShowMediaLightbox(false)}
					/>
				)}
			</div>
		</Modal>
	);
}

// Simple section component for modal content
function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div>
			<h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">{title}</h4>
			{children}
		</div>
	);
}
