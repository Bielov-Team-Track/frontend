"use client";

import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AnimationPreviewProps, AnimationKeyframe, AnimationEquipmentItem, AnimationPlayerPosition } from "../types";

// =============================================================================
// COURT DIMENSIONS
// =============================================================================
const COURT_WIDTH = 320;
const COURT_HEIGHT = 640;
const COURT_PADDING = 20;

// =============================================================================
// EQUIPMENT DEFINITIONS
// =============================================================================
const EQUIPMENT_COLORS: Record<string, string> = {
	cone: "#f97316",
	target: "#ef4444",
	ball: "#fef3c7",
	hoop: "#3b82f6",
	ladder: "#eab308",
	hurdle: "#22c55e",
	antenna: "#a855f7",
};

// =============================================================================
// EQUIPMENT RENDERING
// =============================================================================
function EquipmentRenderer({ item }: { item: AnimationEquipmentItem }) {
	const color = EQUIPMENT_COLORS[item.type] || "#888";

	switch (item.type) {
		case "cone":
			return (
				<polygon
					points={`${item.x},${item.y - 8} ${item.x - 6},${item.y + 5} ${item.x + 6},${item.y + 5}`}
					fill={color}
					stroke="#c2410c"
					strokeWidth="1"
				/>
			);

		case "target":
			return (
				<g>
					<circle cx={item.x} cy={item.y} r="10" fill="white" stroke="#ef4444" strokeWidth="1.5" />
					<circle cx={item.x} cy={item.y} r="6" fill="none" stroke="#ef4444" strokeWidth="1.5" />
					<circle cx={item.x} cy={item.y} r="3" fill="#ef4444" />
				</g>
			);

		case "ball":
			return (
				<g>
					<circle cx={item.x} cy={item.y} r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
					<path
						d={`M ${item.x - 4} ${item.y} Q ${item.x} ${item.y - 4} ${item.x + 4} ${item.y}`}
						fill="none"
						stroke="#f59e0b"
						strokeWidth="0.6"
					/>
				</g>
			);

		case "hoop":
			return <circle cx={item.x} cy={item.y} r="12" fill="none" stroke={color} strokeWidth="2.5" />;

		case "ladder":
			return (
				<g>
					<rect x={item.x - 16} y={item.y - 5} width="32" height="10" fill="none" stroke={color} strokeWidth="1.5" />
					{[-10, -3, 3, 10].map((offset) => (
						<line key={offset} x1={item.x + offset} y1={item.y - 5} x2={item.x + offset} y2={item.y + 5} stroke={color} strokeWidth="1" />
					))}
				</g>
			);

		case "hurdle":
			return (
				<g>
					<rect x={item.x - 10} y={item.y - 6} width="20" height="3" fill={color} />
					<line x1={item.x - 8} y1={item.y - 3} x2={item.x - 8} y2={item.y + 6} stroke={color} strokeWidth="1.5" />
					<line x1={item.x + 8} y1={item.y - 3} x2={item.x + 8} y2={item.y + 6} stroke={color} strokeWidth="1.5" />
				</g>
			);

		case "antenna":
			return (
				<g>
					<line x1={item.x} y1={item.y + 8} x2={item.x} y2={item.y - 10} stroke={color} strokeWidth="2.5" />
					<circle cx={item.x} cy={item.y - 10} r="3" fill={color} />
				</g>
			);

		default:
			return null;
	}
}

// =============================================================================
// COURT COMPONENT
// =============================================================================
function CourtSVG({ children, className }: { children?: React.ReactNode; className?: string }) {
	const courtLeft = COURT_PADDING;
	const courtRight = COURT_WIDTH - COURT_PADDING;
	const courtTop = COURT_PADDING;
	const courtBottom = COURT_HEIGHT - COURT_PADDING;
	const courtMidY = COURT_HEIGHT / 2;
	const attackLineOffset = (courtBottom - courtTop) / 6;

	return (
		<svg viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`} className={cn("bg-green-800 rounded-lg", className)}>
			{/* Court outline */}
			<rect x={courtLeft} y={courtTop} width={courtRight - courtLeft} height={courtBottom - courtTop} fill="none" stroke="white" strokeWidth="2" />

			{/* Center line (net) */}
			<line x1={courtLeft} y1={courtMidY} x2={courtRight} y2={courtMidY} stroke="white" strokeWidth="3" />

			{/* Attack lines */}
			<line x1={courtLeft} y1={courtMidY - attackLineOffset} x2={courtRight} y2={courtMidY - attackLineOffset} stroke="white" strokeWidth="1" strokeDasharray="5" />
			<line x1={courtLeft} y1={courtMidY + attackLineOffset} x2={courtRight} y2={courtMidY + attackLineOffset} stroke="white" strokeWidth="1" strokeDasharray="5" />

			{/* Position markers */}
			{[
				{ x: 60, y: courtMidY + 70, label: "4" },
				{ x: 160, y: courtMidY + 70, label: "3" },
				{ x: 260, y: courtMidY + 70, label: "2" },
				{ x: 60, y: courtMidY + 200, label: "5" },
				{ x: 160, y: courtMidY + 200, label: "6" },
				{ x: 260, y: courtMidY + 200, label: "1" },
			].map((pos) => (
				<text key={pos.label} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="rgba(255,255,255,0.25)" fontWeight="bold">
					{pos.label}
				</text>
			))}

			{children}
		</svg>
	);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function AnimationPreview({ item, className, showControls = true }: AnimationPreviewProps) {
	const animation = item.animation;

	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackProgress, setPlaybackProgress] = useState(0);
	const [speed, setSpeed] = useState(1); // Speed multiplier
	const animationRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number>(0);

	if (!animation || !animation.keyframes?.length) {
		return (
			<div className={cn("flex items-center justify-center h-full text-muted", className)}>
				No animation data
			</div>
		);
	}

	const { keyframes } = animation;
	const baseSpeed = animation.speed || 1000;

	// Get interpolated state for smooth animation
	const getInterpolatedState = useCallback((): AnimationKeyframe | null => {
		if (keyframes.length < 2) {
			return keyframes[0] || null;
		}

		const totalSegments = keyframes.length - 1;
		const progressPerSegment = 1 / totalSegments;
		const currentSegment = Math.floor(playbackProgress / progressPerSegment);
		const segmentProgress = (playbackProgress - currentSegment * progressPerSegment) / progressPerSegment;

		const fromFrame = keyframes[Math.min(currentSegment, keyframes.length - 1)];
		const toFrame = keyframes[Math.min(currentSegment + 1, keyframes.length - 1)];

		if (!fromFrame || !toFrame) return keyframes[0];

		// Ease function for smoother animation
		const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
		const easedProgress = ease(Math.min(segmentProgress, 1));

		const interpolatedPlayers = fromFrame.players.map((player, index) => ({
			...player,
			x: player.x + ((toFrame.players[index]?.x || player.x) - player.x) * easedProgress,
			y: player.y + ((toFrame.players[index]?.y || player.y) - player.y) * easedProgress,
		}));

		const interpolatedBall = {
			x: fromFrame.ball.x + (toFrame.ball.x - fromFrame.ball.x) * easedProgress,
			y: fromFrame.ball.y + (toFrame.ball.y - fromFrame.ball.y) * easedProgress,
		};

		const interpolatedEquipment = (fromFrame.equipment || []).map((equip, index) => {
			const toEquip = toFrame.equipment?.[index];
			if (!toEquip) return equip;
			return {
				...equip,
				x: equip.x + (toEquip.x - equip.x) * easedProgress,
				y: equip.y + (toEquip.y - equip.y) * easedProgress,
			};
		});

		return {
			...fromFrame,
			players: interpolatedPlayers,
			ball: interpolatedBall,
			equipment: interpolatedEquipment,
		};
	}, [keyframes, playbackProgress]);

	// Animation loop
	useEffect(() => {
		if (!isPlaying || keyframes.length < 2) {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
			return;
		}

		const totalDuration = (baseSpeed / speed) * (keyframes.length - 1);

		const animate = (timestamp: number) => {
			if (!lastTimeRef.current) {
				lastTimeRef.current = timestamp;
			}

			const elapsed = timestamp - lastTimeRef.current;
			const progressIncrement = elapsed / totalDuration;

			setPlaybackProgress((prev) => {
				const next = prev + progressIncrement;
				if (next >= 1) {
					return 0; // Loop
				}
				return next;
			});

			lastTimeRef.current = timestamp;
			animationRef.current = requestAnimationFrame(animate);
		};

		lastTimeRef.current = 0;
		animationRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [isPlaying, keyframes.length, baseSpeed, speed]);

	const displayState = isPlaying ? getInterpolatedState() : keyframes[0];
	const currentFrameIndex = Math.min(Math.floor(playbackProgress * (keyframes.length - 1)), keyframes.length - 1);

	const togglePlay = () => {
		if (!isPlaying && playbackProgress >= 0.99) {
			setPlaybackProgress(0);
		}
		setIsPlaying(!isPlaying);
	};

	const reset = () => {
		setIsPlaying(false);
		setPlaybackProgress(0);
	};

	const goToFrame = (index: number) => {
		setIsPlaying(false);
		const progress = keyframes.length > 1 ? index / (keyframes.length - 1) : 0;
		setPlaybackProgress(Math.min(Math.max(progress, 0), 1));
	};

	const prevFrame = () => {
		const newIndex = Math.max(currentFrameIndex - 1, 0);
		goToFrame(newIndex);
	};

	const nextFrame = () => {
		const newIndex = Math.min(currentFrameIndex + 1, keyframes.length - 1);
		goToFrame(newIndex);
	};

	const adjustSpeed = (delta: number) => {
		setSpeed((prev) => Math.max(0.25, Math.min(2, prev + delta)));
	};

	if (!displayState) return null;

	return (
		<div className={cn("flex flex-col h-full", className)}>
			{/* Animation display */}
			<div className="flex-1 flex items-center justify-center p-4">
				<CourtSVG className="w-auto h-full max-h-[60vh] aspect-[1/2]">
					{/* Equipment */}
					{(displayState.equipment || []).map((item) => (
						<EquipmentRenderer key={item.id} item={item} />
					))}

					{/* Players */}
					{displayState.players.map((player) => (
						<g key={player.id}>
							<circle cx={player.x} cy={player.y} r="14" fill={player.color} stroke="white" strokeWidth="2" />
							{player.label && (
								<text
									x={player.x}
									y={player.y}
									textAnchor="middle"
									dominantBaseline="middle"
									fontSize={player.label.length > 2 ? "8" : player.label.length > 1 ? "9" : "11"}
									fill="white"
									fontWeight="bold"
								>
									{player.label}
								</text>
							)}
						</g>
					))}

					{/* Ball */}
					<g>
						<circle cx={displayState.ball.x} cy={displayState.ball.y} r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
						<path
							d={`M ${displayState.ball.x - 5} ${displayState.ball.y} Q ${displayState.ball.x} ${displayState.ball.y - 6} ${displayState.ball.x + 5} ${displayState.ball.y}`}
							fill="none"
							stroke="#f59e0b"
							strokeWidth="1"
						/>
						<path
							d={`M ${displayState.ball.x - 5} ${displayState.ball.y} Q ${displayState.ball.x} ${displayState.ball.y + 6} ${displayState.ball.x + 5} ${displayState.ball.y}`}
							fill="none"
							stroke="#f59e0b"
							strokeWidth="1"
						/>
					</g>
				</CourtSVG>
			</div>

			{/* Controls */}
			{showControls && (
				<div className="space-y-4 p-4">
					{/* Progress bar / Frame scrubber */}
					<div className="flex items-center gap-3">
						<input
							type="range"
							min="0"
							max="100"
							value={playbackProgress * 100}
							onChange={(e) => {
								setIsPlaying(false);
								setPlaybackProgress(Number(e.target.value) / 100);
							}}
							className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
						/>
						<span className="text-sm text-white/70 w-16 text-right">
							{currentFrameIndex + 1} / {keyframes.length}
						</span>
					</div>

					{/* Playback controls */}
					<div className="flex items-center justify-center gap-2">
						{/* Speed control */}
						<div className="flex items-center gap-1 mr-4">
							<button
								type="button"
								onClick={() => adjustSpeed(-0.25)}
								className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
								aria-label="Slower"
							>
								<Minus size={16} />
							</button>
							<span className="text-sm text-white/70 w-12 text-center">{speed}x</span>
							<button
								type="button"
								onClick={() => adjustSpeed(0.25)}
								className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
								aria-label="Faster"
							>
								<Plus size={16} />
							</button>
						</div>

						{/* Frame navigation */}
						<button
							type="button"
							onClick={prevFrame}
							disabled={currentFrameIndex === 0}
							className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
							aria-label="Previous frame"
						>
							<ChevronLeft size={20} />
						</button>

						<button
							type="button"
							onClick={reset}
							className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
							aria-label="Reset"
						>
							<RotateCcw size={20} />
						</button>

						<button
							type="button"
							onClick={togglePlay}
							disabled={keyframes.length < 2}
							className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
							aria-label={isPlaying ? "Pause" : "Play"}
						>
							{isPlaying ? <Pause size={24} /> : <Play size={24} />}
						</button>

						<button
							type="button"
							onClick={nextFrame}
							disabled={currentFrameIndex === keyframes.length - 1}
							className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
							aria-label="Next frame"
						>
							<ChevronRight size={20} />
						</button>
					</div>

					{/* Frame indicator dots */}
					{keyframes.length > 1 && keyframes.length <= 10 && (
						<div className="flex justify-center gap-2">
							{keyframes.map((_, index) => (
								<button
									key={index}
									type="button"
									onClick={() => goToFrame(index)}
									className={cn(
										"w-2.5 h-2.5 rounded-full transition-colors",
										index === currentFrameIndex ? "bg-primary" : "bg-white/30 hover:bg-white/50"
									)}
									aria-label={`Go to frame ${index + 1}`}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
