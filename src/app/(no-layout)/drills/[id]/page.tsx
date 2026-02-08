"use client";

// TODO: Temporary public page for showing drills to unauthorized users.
// Once proper public/private access control is implemented, consolidate
// with the dashboard drill detail page or use a shared component.

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import {
	INTENSITY_COLORS,
	DrillAttachments,
	DrillInteractionBar,
	DrillCommentsSection,
} from "@/components/features/drills";
import { Loader } from "@/components/ui";
import { MediaLightbox, type MediaItem } from "@/components/ui/media-preview";
import { useDrill } from "@/hooks/useDrills";
import { AuthProvider } from "@/providers";
import { Clock, Dumbbell, Users, ArrowLeft, ChevronRight, Play } from "lucide-react";
import { useRef } from "react";

export default function PublicDrillPage() {
	return (
		<AuthProvider>
			<DrillDetailContent />
		</AuthProvider>
	);
}

function DrillDetailContent() {
	const params = useParams();
	const drillId = params.id as string;
	const { data: drill, isLoading, error } = useDrill(drillId);
	const [showAnimationLightbox, setShowAnimationLightbox] = useState(false);
	const commentsRef = useRef<HTMLDivElement>(null);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader />
			</div>
		);
	}

	if (error || !drill) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<p className="text-error">Drill not found.</p>
			</div>
		);
	}

	const currentAnimation = drill.animation;
	const intensityColor = INTENSITY_COLORS[drill.intensity].color;
	const intensityDot = intensityColor === "success" ? "bg-success" : intensityColor === "warning" ? "bg-warning" : "bg-error";

	const hasEquipment = drill.equipment?.length > 0;
	const hasInstructions = drill.instructions?.length > 0;
	const hasCoachingPoints = drill.coachingPoints?.length > 0;
	const hasVariations = drill.variations?.length > 0;
	const hasAttachments = drill.attachments?.length > 0;
	const hasAnimation = currentAnimation && currentAnimation.keyframes?.length > 0;
	const hasMedia = hasAttachments || hasAnimation;

	const animationMediaItem: MediaItem | null = hasAnimation ? {
		id: "drill-animation",
		type: "animation",
		url: "",
		fileName: "Drill Animation",
		animation: {
			keyframes: currentAnimation.keyframes.map(kf => ({
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
			speed: currentAnimation.speed,
		},
	} : null;

	return (
		<>
		<div className="max-w-4xl mx-auto px-4 py-8">
			{/* Header */}
			<header className="mb-10">
				<div className="flex items-center gap-2 mb-3">
					<span className="text-xs font-medium text-muted/80 uppercase tracking-widest">{drill.category}</span>
					<span className={`w-1.5 h-1.5 rounded-full ${intensityDot}`} title={`${drill.intensity} Intensity`} />
				</div>

				<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-5">{drill.name}</h1>

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
				<div className="mt-6">
					<DrillInteractionBar
						drillId={drillId}
						likeCount={drill.likeCount}
						isBookmarked={drill.isBookmarked}
						showComments={true}
						onCommentsClick={() => commentsRef.current?.scrollIntoView({ behavior: "smooth" })}
					/>
				</div>
			</header>

			{/* Description */}
			{drill.description && (
				<p className="text-lg text-muted/90 leading-relaxed mb-10 max-w-2xl">{drill.description}</p>
			)}

			{/* Media */}
			{hasMedia && (
				<section className="mb-10">
					<DrillAttachments attachments={drill.attachments} animation={currentAnimation} />
				</section>
			)}

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
				<div className="lg:col-span-2 space-y-10">
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
											href={`/drills/${variation.drillId}`}
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

				<aside className="space-y-8">
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

					{hasAnimation && (
						<section>
							<h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Animation</h3>
							<button
								type="button"
								onClick={() => setShowAnimationLightbox(true)}
								className="relative w-full aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer bg-green-800"
							>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
										<Play size={24} className="text-white ml-0.5" fill="currentColor" />
									</div>
								</div>
								<div className="absolute bottom-2 left-2">
									<span className="text-xs text-white/80 bg-black/50 px-2 py-0.5 rounded-full">
										{currentAnimation.keyframes.length} frames
									</span>
								</div>
							</button>
						</section>
					)}
				</aside>
			</div>

			{/* Comments */}
			<div ref={commentsRef} className="mt-12">
				<DrillCommentsSection drillId={drillId} />
			</div>
		</div>

		{animationMediaItem && (
			<MediaLightbox
				items={[animationMediaItem]}
				initialIndex={0}
				isOpen={showAnimationLightbox}
				onClose={() => setShowAnimationLightbox(false)}
			/>
		)}
		</>
	);
}
