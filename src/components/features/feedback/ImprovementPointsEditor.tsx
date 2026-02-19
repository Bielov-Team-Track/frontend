"use client";

import { Plus, GripVertical, Trash2, Link, } from "lucide-react";
import { Button, Input, TextArea } from "@/components/ui";

interface ImprovementPointDraft {
	id: string;
	description: string;
	drillIds: string[];
	mediaLinks: { url: string; type: "Video" | "Article" | "Image"; title?: string }[];
}

interface ImprovementPointsEditorProps {
	points: ImprovementPointDraft[];
	onChange: (points: ImprovementPointDraft[]) => void;
}

export function ImprovementPointsEditor({ points, onChange }: ImprovementPointsEditorProps) {
	const addPoint = () => {
		onChange([
			...points,
			{ id: crypto.randomUUID(), description: "", drillIds: [], mediaLinks: [] },
		]);
	};

	const updatePoint = (index: number, description: string) => {
		const updated = [...points];
		updated[index] = { ...updated[index], description };
		onChange(updated);
	};

	const removePoint = (index: number) => {
		onChange(points.filter((_, i) => i !== index));
	};

	const addMediaLink = (index: number) => {
		const updated = [...points];
		updated[index] = {
			...updated[index],
			mediaLinks: [...updated[index].mediaLinks, { url: "", type: "Video" as const }],
		};
		onChange(updated);
	};

	const updateMediaLink = (
		pointIndex: number,
		mediaIndex: number,
		field: string,
		value: string
	) => {
		const updated = [...points];
		const mediaLinks = [...updated[pointIndex].mediaLinks];
		mediaLinks[mediaIndex] = { ...mediaLinks[mediaIndex], [field]: value };
		updated[pointIndex] = { ...updated[pointIndex], mediaLinks };
		onChange(updated);
	};

	const removeMediaLink = (pointIndex: number, mediaIndex: number) => {
		const updated = [...points];
		updated[pointIndex] = {
			...updated[pointIndex],
			mediaLinks: updated[pointIndex].mediaLinks.filter((_, i) => i !== mediaIndex),
		};
		onChange(updated);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium text-foreground">Improvement Points</h4>
				<Button variant="ghost" size="sm" onClick={addPoint}>
					<Plus size={14} className="mr-1" />
					Add point
				</Button>
			</div>

			{points.map((point, index) => (
				<div key={point.id} className="rounded-lg border border-border bg-surface p-3 space-y-2">
					<div className="flex items-start gap-2">
						<GripVertical size={16} className="mt-2 text-muted shrink-0" />
						<div className="flex-1">
							<TextArea
								value={point.description}
								onChange={(e) => updatePoint(index, e.target.value)}
								placeholder={`Improvement point ${index + 1}...`}
								minRows={2}
								className="text-sm"
							/>
						</div>
						<button
							type="button"
							onClick={() => removePoint(index)}
							className="p-1 text-muted hover:text-destructive transition-colors"
						>
							<Trash2 size={14} />
						</button>
					</div>

					{/* Media links */}
					{point.mediaLinks.map((media, mediaIndex) => (
						<div key={mediaIndex} className="flex items-center gap-2 pl-6">
							<Link size={12} className="text-muted shrink-0" />
							<Input
								value={media.url}
								onChange={(e) => updateMediaLink(index, mediaIndex, "url", e.target.value)}
								placeholder="https://..."
								className="text-sm flex-1"
							/>
							<select
								value={media.type}
								onChange={(e) => updateMediaLink(index, mediaIndex, "type", e.target.value)}
								className="text-xs rounded border border-border bg-surface px-2 py-1"
							>
								<option value="Video">Video</option>
								<option value="Article">Article</option>
								<option value="Image">Image</option>
							</select>
							<button
								type="button"
								onClick={() => removeMediaLink(index, mediaIndex)}
								className="p-1 text-muted hover:text-destructive"
							>
								<Trash2 size={12} />
							</button>
						</div>
					))}

					<div className="flex gap-2 pl-6">
						<Button variant="ghost" size="sm" onClick={() => addMediaLink(index)}>
							<Link size={12} className="mr-1" />
							Add media link
						</Button>
					</div>
				</div>
			))}
		</div>
	);
}

export type { ImprovementPointDraft };
