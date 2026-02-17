"use client";

import { VOLLEYBALL_SKILLS } from "@/components/features/evaluations/types";
import { GripHorizontal, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { EditorLevel } from "./LevelManager";

interface MatrixEditorProps {
	levels: EditorLevel[];
	anchors: number[][];
	criteria: Record<string, string>;
	onAnchorChange: (skillIndex: number, levelIndex: number, value: number) => void;
	onCriteriaChange: (key: string, value: string) => void;
}

function scoreToPercent(score: number) {
	return (score / 10) * 100;
}

function roundToHalf(value: number) {
	return Math.round(value * 2) / 2;
}

export function MatrixEditor({
	levels,
	anchors,
	criteria,
	onAnchorChange,
	onCriteriaChange,
}: MatrixEditorProps) {
	const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [dragState, setDragState] = useState<{
		skillIndex: number;
		levelIndex: number;
	} | null>(null);
	const [popover, setPopover] = useState<{
		skill: string;
		skillIndex: number;
		levelIndex: number;
		key: string;
		rect: { left: number; top: number };
	} | null>(null);
	const [popoverText, setPopoverText] = useState("");
	const dragRef = useRef<{
		skillIndex: number;
		levelIndex: number;
		columnRect: DOMRect;
	} | null>(null);

	const getAnchor = (skillIndex: number, levelIndex: number) => {
		if (levelIndex === levels.length - 1) return 10;
		return anchors[skillIndex]?.[levelIndex] ?? 0;
	};

	const getBottom = (skillIndex: number, levelIndex: number) => {
		if (levelIndex === 0) return 0;
		return anchors[skillIndex]?.[levelIndex - 1] ?? 0;
	};

	const handleAnchorMouseDown = useCallback(
		(e: React.MouseEvent, skillIndex: number, levelIndex: number) => {
			e.preventDefault();
			e.stopPropagation();

			const column = columnRefs.current[skillIndex];
			if (!column) return;

			const columnRect = column.getBoundingClientRect();
			dragRef.current = { skillIndex, levelIndex, columnRect };
			setDragState({ skillIndex, levelIndex });

			const handleMouseMove = (me: MouseEvent) => {
				if (!dragRef.current) return;
				const { skillIndex: si, levelIndex: li, columnRect: rect } = dragRef.current;

				const relativeY = me.clientY - rect.top;
				const percent = 100 - (relativeY / rect.height) * 100;
				let newScore = roundToHalf(Math.max(0, Math.min(10, (percent / 100) * 10)));

				const prevAnchor = li === 0 ? 0 : anchors[si][li - 1];
				const nextAnchor = li === anchors[si].length - 1 ? 10 : anchors[si][li + 1];
				newScore = Math.max(prevAnchor + 0.5, Math.min(nextAnchor - 0.5, newScore));

				onAnchorChange(si, li, newScore);
			};

			const handleMouseUp = () => {
				dragRef.current = null;
				setDragState(null);
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
			};

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "ns-resize";
			document.body.style.userSelect = "none";
		},
		[anchors, levels.length, onAnchorChange]
	);

	const handleSegmentClick = (
		e: React.MouseEvent,
		skill: string,
		skillIndex: number,
		levelIndex: number
	) => {
		const key = `${skill}-${levelIndex}`;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		setPopoverText(criteria[key] || "");
		setPopover({
			skill,
			skillIndex,
			levelIndex,
			key,
			rect: {
				left: Math.min(rect.left, window.innerWidth - 420),
				top: Math.min(rect.top, window.innerHeight - 300),
			},
		});
	};

	const handlePopoverSave = () => {
		if (!popover) return;
		onCriteriaChange(popover.key, popoverText.trim());
		setPopover(null);
	};

	const handlePopoverClose = () => {
		setPopover(null);
	};

	// Y-axis ticks
	const yTicks = Array.from({ length: 11 }, (_, i) => i);

	return (
		<div className="relative">
			<div className="flex gap-4">
				{/* Y-axis */}
				<div className="w-8 flex-shrink-0 relative" style={{ height: 400 }}>
					{yTicks.map((tick) => (
						<div
							key={tick}
							className="absolute right-0 text-xs text-muted-foreground"
							style={{ bottom: `${scoreToPercent(tick)}%`, transform: "translateY(50%)" }}
						>
							{tick}
						</div>
					))}
				</div>

				{/* Skill columns */}
				<div className="flex-1 grid grid-cols-7 gap-3">
					{VOLLEYBALL_SKILLS.map((skill, skillIndex) => (
						<div key={skill} className="flex flex-col">
							{/* Skill header */}
							<div className="text-center text-sm font-semibold text-foreground mb-2 h-8 flex items-center justify-center">
								{skill}
							</div>

							{/* Column */}
							<div
								ref={(el) => { columnRefs.current[skillIndex] = el; }}
								className="relative rounded-xl bg-background border border-border overflow-visible"
								style={{ height: 400 }}
							>
								{/* Segments */}
								{levels.map((level, levelIndex) => {
									const bottomScore = getBottom(skillIndex, levelIndex);
									const topScore = getAnchor(skillIndex, levelIndex);
									const key = `${skill}-${levelIndex}`;
									const hasCriteria = !!criteria[key];

									return (
										<div
											key={levelIndex}
											onClick={(e) => handleSegmentClick(e, skill, skillIndex, levelIndex)}
											className="absolute left-0 right-0 rounded cursor-pointer transition-all hover:brightness-115 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.1)] flex items-center justify-center text-center overflow-hidden px-1.5 py-1 group/segment"
											style={{
												bottom: `${scoreToPercent(bottomScore)}%`,
												height: `${scoreToPercent(topScore - bottomScore)}%`,
												backgroundColor: level.color,
											}}
										>
											{hasCriteria ? (
												<span className="text-[11px] leading-tight text-white/90 line-clamp-3">
													{criteria[key]}
												</span>
											) : (
												<span className="text-[11px] text-white/40 opacity-0 group-hover/segment:opacity-100 transition-opacity">
													+ Add criteria
												</span>
											)}
										</div>
									);
								})}

								{/* Anchors */}
								{anchors[skillIndex]?.map((anchorValue, levelIndex) => (
									<div
										key={levelIndex}
										onMouseDown={(e) => handleAnchorMouseDown(e, skillIndex, levelIndex)}
										className="absolute -left-2 -right-2 h-[3px] cursor-ns-resize z-10 group/anchor"
										style={{
											bottom: `${scoreToPercent(anchorValue)}%`,
											transform: "translateY(1.5px)",
											background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
										}}
									>
										{/* Handle */}
										<div
											className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[18px] rounded-md flex items-center justify-center transition-all ${
												dragState?.skillIndex === skillIndex && dragState?.levelIndex === levelIndex
													? "bg-[#3a3a4a] border-[#52525b] text-gray-300 shadow-[0_0_0_3px_rgba(255,255,255,0.08)] scale-110"
													: "bg-[#2a2a3a] border-[#3a3a4a] text-gray-500 group-hover/anchor:bg-[#3a3a4a] group-hover/anchor:border-[#52525b] group-hover/anchor:text-gray-300 group-hover/anchor:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] group-hover/anchor:scale-110"
											} border`}
										>
											<GripHorizontal size={14} />
										</div>

										{/* Score label */}
										<div
											className={`absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 bg-[#1e1e2a] text-blue-300 px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap pointer-events-none transition-opacity ${
												dragState?.skillIndex === skillIndex && dragState?.levelIndex === levelIndex
													? "opacity-100"
													: "opacity-0 group-hover/anchor:opacity-100"
											}`}
										>
											{anchorValue.toFixed(1)}
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Criteria popover */}
			{popover && (
				<>
					{/* Overlay */}
					<div
						className="fixed inset-0 bg-black/50 z-[999]"
						onClick={handlePopoverClose}
					/>

					{/* Popover */}
					<div
						className="fixed z-[1000] bg-surface border border-border rounded-xl p-5 shadow-2xl w-[400px]"
						style={{ left: popover.rect.left, top: popover.rect.top }}
					>
						<div className="flex items-start justify-between mb-4">
							<div>
								<h4 className="text-base font-semibold text-foreground">
									{levels[popover.levelIndex]?.name} - {popover.skill}
								</h4>
								<p className="text-sm text-muted-foreground">
									Define criteria for this skill level
								</p>
							</div>
							<button
								type="button"
								onClick={handlePopoverClose}
								className="p-1 rounded-md hover:bg-hover text-muted-foreground hover:text-foreground transition-colors"
							>
								<X size={16} />
							</button>
						</div>

						<textarea
							value={popoverText}
							onChange={(e) => setPopoverText(e.target.value)}
							placeholder="Describe what defines this skill level..."
							className="w-full min-h-[120px] bg-background border border-border rounded-lg p-3 text-sm text-foreground resize-y focus:outline-none focus:border-primary transition-colors"
							autoFocus
						/>

						<div className="flex justify-end gap-2 mt-4">
							<button
								type="button"
								onClick={handlePopoverClose}
								className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground border border-border hover:bg-hover hover:text-foreground transition-all"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handlePopoverSave}
								className="px-4 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-colors"
							>
								Save
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
