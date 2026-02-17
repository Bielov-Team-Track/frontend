"use client";

import { Button, Input } from "@/components/ui";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export interface EditorLevel {
	name: string;
	color: string;
	description: string;
}

export const COLOR_PALETTE = [
	"#64748b", "#6b7280", "#78716c", "#71717a",
	"#ef4444", "#f97316", "#f59e0b", "#eab308",
	"#84cc16", "#22c55e", "#10b981", "#14b8a6",
	"#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
	"#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

interface LevelManagerProps {
	levels: EditorLevel[];
	onAddLevel: () => void;
	onDeleteLevel: (index: number) => void;
	onRenameLevel: (index: number, name: string) => void;
	onReorderLevel: (fromIndex: number, toIndex: number) => void;
	onColorChange: (index: number, color: string) => void;
	onDescriptionChange: (index: number, description: string) => void;
}

export function LevelManager({
	levels,
	onAddLevel,
	onDeleteLevel,
	onRenameLevel,
	onReorderLevel,
	onColorChange,
	onDescriptionChange,
}: LevelManagerProps) {
	const [colorPickerIndex, setColorPickerIndex] = useState<number | null>(null);
	const [dragFrom, setDragFrom] = useState<number | null>(null);
	const [dragOver, setDragOver] = useState<number | null>(null);
	const colorButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDragFrom(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOver(index);
	};

	const handleDragEnd = () => {
		if (dragFrom !== null && dragOver !== null && dragFrom !== dragOver) {
			onReorderLevel(dragFrom, dragOver);
		}
		setDragFrom(null);
		setDragOver(null);
	};

	const handleColorClick = (index: number) => {
		setColorPickerIndex(colorPickerIndex === index ? null : index);
	};

	const handleColorSelect = (index: number, color: string) => {
		onColorChange(index, color);
		setColorPickerIndex(null);
	};

	return (
		<div className="space-y-3">
			{levels.map((level, index) => (
				<div
					key={index}
					draggable
					onDragStart={(e) => handleDragStart(e, index)}
					onDragOver={(e) => handleDragOver(e, index)}
					onDragEnd={handleDragEnd}
					className={`group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-hover/50 ${
						dragFrom === index ? "opacity-50" : ""
					} ${dragOver === index && dragFrom !== index ? "border-t-2 border-primary" : ""}`}
				>
					{/* Drag handle */}
					<div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
						<GripVertical size={14} />
					</div>

					{/* Color dot */}
					<div className="relative">
						<button
							ref={(el) => { colorButtonRefs.current[index] = el; }}
							type="button"
							onClick={() => handleColorClick(index)}
							className="w-4 h-4 rounded flex-shrink-0 border-2 border-transparent hover:border-white/30 hover:scale-110 transition-all"
							style={{ backgroundColor: level.color }}
							title="Change color"
						/>
						{colorPickerIndex === index && (
							<div className="absolute left-0 top-full mt-2 z-50 bg-surface border border-border rounded-xl p-2.5 shadow-2xl w-[164px]">
								<div className="grid grid-cols-4 gap-1.5">
									{COLOR_PALETTE.map((color) => (
										<button
											key={color}
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleColorSelect(index, color);
											}}
											className={`w-8 h-8 rounded-md transition-all hover:scale-110 ${
												color === level.color
													? "ring-2 ring-white shadow-[0_0_0_2px_rgba(255,255,255,0.2)]"
													: "border-2 border-transparent hover:border-white/40"
											}`}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Name input */}
					<div className="flex-1 min-w-0">
						<input
							type="text"
							value={level.name}
							onChange={(e) => onRenameLevel(index, e.target.value)}
							className="w-full bg-transparent border-none text-sm font-medium text-foreground px-1 py-0.5 rounded hover:bg-hover/50 focus:bg-hover/50 focus:outline-none"
						/>
					</div>

					{/* Description input */}
					<div className="flex-1 min-w-0">
						<input
							type="text"
							value={level.description}
							onChange={(e) => onDescriptionChange(index, e.target.value)}
							placeholder="Level description..."
							className="w-full bg-transparent border-none text-xs text-muted-foreground px-1 py-0.5 rounded hover:bg-hover/50 focus:bg-hover/50 focus:outline-none placeholder:text-muted-foreground/50"
						/>
					</div>

					{/* Delete button */}
					{levels.length > 2 && (
						<button
							type="button"
							onClick={() => onDeleteLevel(index)}
							className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
							title={`Delete ${level.name}`}
						>
							<Trash2 size={14} />
						</button>
					)}
				</div>
			))}

			<button
				type="button"
				onClick={onAddLevel}
				className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-400 bg-blue-500/8 border border-blue-500/25 hover:border-blue-500 hover:bg-blue-500/15 hover:text-blue-300 transition-all"
			>
				<Plus size={16} />
				Add Level
			</button>
		</div>
	);
}
