"use client";

import type { DrillAnimation } from "./types";
import { Play, Pencil, Trash2 } from "lucide-react";

interface AnimationThumbnailProps {
	animation: DrillAnimation;
	onClick?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	className?: string;
}

export default function AnimationThumbnail({ animation, onClick, onEdit, onDelete, className }: AnimationThumbnailProps) {
	const name = animation.name || "Untitled animation";
	const frameCount = animation.keyframes.length;

	return (
		<button
			type="button"
			onClick={onClick}
			className={`group relative flex-shrink-0 w-[140px] h-[100px] rounded-xl overflow-hidden cursor-pointer bg-green-800 ${className || ""}`}
		>
			{/* Mini court preview */}
			<svg
				viewBox="0 0 320 640"
				className="absolute inset-0 w-full h-full opacity-30"
			>
				<rect x={20} y={20} width={280} height={600} fill="none" stroke="white" strokeWidth="2" />
				<line x1={20} y1={320} x2={300} y2={320} stroke="white" strokeWidth="3" />
			</svg>

			{/* Play icon overlay */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
					<Play size={20} className="text-white ml-0.5" fill="currentColor" />
				</div>
			</div>

			{/* Frame count badge */}
			<div className="absolute top-2 right-2">
				<span className="text-[10px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded-full">
					{frameCount} {frameCount === 1 ? "frame" : "frames"}
				</span>
			</div>

			{/* Edit/Delete actions on hover */}
			{(onEdit || onDelete) && (
				<div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					{onEdit && (
						<span
							role="button"
							onClick={(e) => { e.stopPropagation(); onEdit(); }}
							className="w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
						>
							<Pencil size={12} className="text-white" />
						</span>
					)}
					{onDelete && (
						<span
							role="button"
							onClick={(e) => { e.stopPropagation(); onDelete(); }}
							className="w-6 h-6 rounded-full bg-black/60 hover:bg-red-600/80 flex items-center justify-center transition-colors"
						>
							<Trash2 size={12} className="text-white" />
						</span>
					)}
				</div>
			)}

			{/* Name label at bottom */}
			<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
				<p className="text-xs text-white font-medium truncate">{name}</p>
			</div>
		</button>
	);
}
