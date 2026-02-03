"use client";

import { Button } from "@/components";
import { CATEGORY_COLORS, DrillDetailModal, INTENSITY_COLORS, TimelineItem } from "@/components/features/drills";
import { Badge } from "@/components/ui";
import { Check, ChevronRight, Clock, Edit2, Pause, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface TrainingViewModeProps {
	timeline: TimelineItem[];
	onExitToEdit: () => void;
}

type SessionState = "idle" | "running" | "paused" | "completed";

export default function TrainingViewMode({ timeline, onExitToEdit }: TrainingViewModeProps) {
	const [state, setState] = useState<SessionState>("idle");
	const [currentIndex, setCurrentIndex] = useState(0);
	const [elapsed, setElapsed] = useState(0);
	const [totalElapsed, setTotalElapsed] = useState(0);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [selectedDrill, setSelectedDrill] = useState<TimelineItem | null>(null);
	const [timeUp, setTimeUp] = useState(false);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const currentDrill = timeline[currentIndex];
	const nextDrill = timeline[currentIndex + 1];
	const drillDuration = currentDrill ? currentDrill.duration * 60 : 0;
	const remaining = Math.max(0, drillDuration - elapsed);

	// Initialize audio
	useEffect(() => {
		audioRef.current = new Audio("/sounds/chime.mp3");
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	const playSound = useCallback(() => {
		if (soundEnabled && audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play().catch(() => {});
		}
	}, [soundEnabled]);

	// Timer
	useEffect(() => {
		if (state === "running") {
			intervalRef.current = setInterval(() => {
				setElapsed((prev) => {
					const next = prev + 1;
					if (next >= drillDuration && !timeUp) {
						setTimeUp(true);
						playSound();
					}
					return next;
				});
				setTotalElapsed((prev) => prev + 1);
			}, 1000);
		} else if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [state, drillDuration, timeUp, playSound]);

	const formatTime = (secs: number) => {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	const handleStart = () => {
		setState("running");
		setTimeUp(false);
	};

	const handlePause = () => setState("paused");
	const handleResume = () => setState("running");

	const handleNext = () => {
		if (currentIndex < timeline.length - 1) {
			setCurrentIndex((i) => i + 1);
			setElapsed(0);
			setTimeUp(false);
			if (state === "paused") setState("running");
		} else {
			setState("completed");
		}
	};

	const handleEnd = () => setState("completed");

	const handleReset = () => {
		setState("idle");
		setCurrentIndex(0);
		setElapsed(0);
		setTotalElapsed(0);
		setTimeUp(false);
	};

	if (!currentDrill) {
		return (
			<div className="text-center py-20">
				<p className="text-muted">No drills in timeline</p>
				<Button variant="ghost" color="neutral" className="mt-4" onClick={onExitToEdit}>
					Go to Edit Mode
				</Button>
			</div>
		);
	}

	// Completed state
	if (state === "completed") {
		return (
			<div className="max-w-2xl mx-auto">
				<div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
					<div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
						<Check size={40} className="text-success" />
					</div>
					<h2 className="text-2xl font-bold text-white mb-2">Training Complete!</h2>
					<p className="text-muted mb-6">
						{timeline.length} drills completed in {formatTime(totalElapsed)}
					</p>
					<div className="flex justify-center gap-4">
						<Button variant="outline" color="neutral" leftIcon={<RotateCcw size={16} />} onClick={handleReset}>
							Start Over
						</Button>
						<Button variant="outline" color="primary" leftIcon={<Edit2 size={16} />} onClick={onExitToEdit}>
							Edit Plan
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const progress = timeline.reduce((acc, _, i) => acc + (i < currentIndex ? timeline[i].duration * 60 : 0), 0) + elapsed;
	const total = timeline.reduce((acc, d) => acc + d.duration * 60, 0);
	const progressPercent = total > 0 ? (progress / total) * 100 : 0;

	return (
		<>
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Progress */}
				<div className="rounded-2xl bg-white/5 border border-white/10 p-4">
					<div className="flex items-center justify-between mb-2 text-sm text-muted">
						<span>Session Progress</span>
						<span>{currentIndex + 1} of {timeline.length} drills</span>
					</div>
					<div className="h-2 rounded-full bg-white/10 overflow-hidden">
						<div className="h-full bg-accent transition-all duration-500" style={{ width: `${progressPercent}%` }} />
					</div>
				</div>

				{/* Current Drill */}
				<div className={`rounded-2xl border p-8 transition-all ${timeUp ? "bg-warning/10 border-warning/50" : "bg-white/5 border-white/10"}`}>
					{timeUp && (
						<div className="flex justify-center mb-4">
							<span className="px-4 py-2 rounded-full bg-warning text-white font-bold text-sm animate-bounce">
								Time&apos;s Up! Tap Next when ready
							</span>
						</div>
					)}

					<div className="flex items-center gap-2 mb-4">
						<Badge color={CATEGORY_COLORS[currentDrill.category].color} variant="soft">
							{currentDrill.category}
						</Badge>
						<Badge color={INTENSITY_COLORS[currentDrill.intensity].color} variant="outline">
							{currentDrill.intensity}
						</Badge>
					</div>

					<h2 className="text-3xl font-bold text-white mb-2">{currentDrill.name}</h2>
					<p className="text-muted mb-8">{currentDrill.description}</p>

					{/* Timer */}
					<div className="text-center mb-8">
						<div className={`text-7xl font-mono font-bold ${timeUp ? "text-warning" : remaining < 60 ? "text-error" : "text-white"}`}>
							{formatTime(remaining)}
						</div>
						<p className="text-sm text-muted mt-2">
							{timeUp ? `Over by ${formatTime(elapsed - drillDuration)}` : "remaining"}
						</p>
						<div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden max-w-md mx-auto">
							<div
								className={`h-full transition-all ${timeUp ? "bg-warning" : "bg-accent"}`}
								style={{ width: `${Math.min((elapsed / drillDuration) * 100, 100)}%` }}
							/>
						</div>
					</div>

					{/* Controls */}
					<div className="flex justify-center gap-4">
						{state === "idle" && (
							<Button color="primary" size="lg" leftIcon={<Play size={20} />} onClick={handleStart}>
								Start Training
							</Button>
						)}
						{state === "running" && (
							<>
								<Button variant="outline" color="neutral" size="lg" leftIcon={<Pause size={20} />} onClick={handlePause}>
									Pause
								</Button>
								<Button color="primary" size="lg" leftIcon={<ChevronRight size={20} />} onClick={handleNext}>
									Next Drill
								</Button>
							</>
						)}
						{state === "paused" && (
							<>
								<Button variant="outline" color="neutral" size="lg" leftIcon={<Play size={20} />} onClick={handleResume}>
									Resume
								</Button>
								<Button color="primary" size="lg" leftIcon={<ChevronRight size={20} />} onClick={handleNext}>
									Next Drill
								</Button>
							</>
						)}
					</div>

					<div className="text-center mt-4">
						<button onClick={() => setSelectedDrill(currentDrill)} className="text-sm text-accent hover:underline">
							View drill details
						</button>
					</div>
				</div>

				{/* Up Next */}
				{nextDrill && (
					<div className="rounded-2xl bg-white/5 border border-white/10 p-4">
						<h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Up Next</h3>
						<div className="flex items-center justify-between">
							<div>
								<Badge size="xs" color={CATEGORY_COLORS[nextDrill.category].color} variant="soft" className="mb-1">
									{nextDrill.category}
								</Badge>
								<h4 className="font-bold text-white">{nextDrill.name}</h4>
								<p className="text-sm text-muted flex items-center gap-2 mt-1">
									<Clock size={14} /> {nextDrill.duration} minutes
								</p>
							</div>
							<button onClick={() => setSelectedDrill(nextDrill)} className="text-sm text-accent hover:underline">
								Preview
							</button>
						</div>
					</div>
				)}

				{/* Bottom Controls */}
				<div className="flex items-center justify-between pt-4">
					<Button variant="ghost" color="neutral" leftIcon={<Edit2 size={16} />} onClick={onExitToEdit}>
						Edit Plan
					</Button>
					<div className="flex items-center gap-4">
						<button
							onClick={() => setSoundEnabled(!soundEnabled)}
							className="p-2 rounded-lg bg-white/5 text-muted hover:text-white transition-colors">
							{soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
						</button>
						{(state === "running" || state === "paused") && (
							<Button variant="ghost" color="neutral" leftIcon={<Square size={16} />} onClick={handleEnd}>
								End Session
							</Button>
						)}
					</div>
				</div>
			</div>

			<DrillDetailModal drill={selectedDrill} isOpen={!!selectedDrill} onClose={() => setSelectedDrill(null)} />
		</>
	);
}
