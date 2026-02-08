"use client";

import { Button } from "@/components";
import { Badge, Modal } from "@/components/ui";
import { Clock, Dumbbell, Plus, Users } from "lucide-react";
import { CATEGORY_COLORS, Drill, INTENSITY_COLORS } from "./types";
import { AnimationPreview } from "./AnimationPreview";

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
	if (!drill) return null;

	const handleAdd = () => {
		onAddToTimeline?.(drill);
		onClose();
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

				{/* Animation Previews */}
				{drill.animations?.length > 0 && (
					<Section title={drill.animations.length > 1 ? "Animations" : "Animation"}>
						<div className="space-y-4">
							{drill.animations.map((anim, i) => (
								<div key={i}>
									{anim.name && <p className="text-xs text-muted mb-1">{anim.name}</p>}
									<AnimationPreview animation={anim} width={380} height={285} />
								</div>
							))}
						</div>
					</Section>
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
