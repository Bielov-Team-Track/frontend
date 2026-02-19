"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEventContext } from "../../../layout";
import {
	Button,
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import {
	ArrowLeft,
	Pause,
	Play,
	Square,
	Users,
	BarChart3,
	CheckCircle2,
	Clock,
	Wifi,
	WifiOff,
} from "lucide-react";
import {
	useEvaluationSession,
	useSessionProgress,
	usePauseSession,
	useResumeSession,
	useCompleteSession,
} from "@/hooks/useEvaluations";
import { useRealtimeEvaluationSession } from "@/hooks/useRealtimeEvaluationSession";
import { useEvaluationSessionStore } from "@/lib/realtime/evaluationSessionStore";
import { toast } from "sonner";
import type { EvaluationSessionStatus, GroupProgressDto } from "@/lib/models/Evaluation";

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: EvaluationSessionStatus }) {
	const config: Record<EvaluationSessionStatus, { color: "neutral" | "success" | "warning" | "info"; label: string }> = {
		Draft: { color: "neutral", label: "Draft" },
		Running: { color: "success", label: "Live" },
		Paused: { color: "warning", label: "Paused" },
		Completed: { color: "info", label: "Completed" },
	};
	const { color, label } = config[status];
	return (
		<Badge size="sm" color={color} variant="soft">
			{label}
		</Badge>
	);
}

// ---------------------------------------------------------------------------
// ProgressBar
// ---------------------------------------------------------------------------

function ProgressBar({ value, className }: { value: number; className?: string }) {
	return (
		<div className={`h-2 rounded-full bg-surface overflow-hidden ${className ?? ""}`}>
			<div
				className="h-full rounded-full bg-primary transition-all duration-500"
				style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
			/>
		</div>
	);
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	subValue?: string;
}

function StatCard({ icon, label, value, subValue }: StatCardProps) {
	return (
		<div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
			<div className="w-10 h-10 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
				{icon}
			</div>
			<div className="min-w-0">
				<p className="text-xs text-muted mb-0.5">{label}</p>
				<p className="text-xl font-bold text-white leading-tight">{value}</p>
				{subValue && <p className="text-xs text-muted mt-0.5">{subValue}</p>}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// GroupProgressCard
// ---------------------------------------------------------------------------

function GroupProgressCard({ group }: { group: GroupProgressDto }) {
	const playerProgress =
		group.totalPlayers > 0 ? (group.playersScored / group.totalPlayers) * 100 : 0;
	const exerciseProgress =
		group.totalExercises > 0 ? (group.exercisesCompleted / group.totalExercises) * 100 : 0;

	const isComplete =
		group.playersScored >= group.totalPlayers &&
		group.totalPlayers > 0 &&
		group.exercisesCompleted >= group.totalExercises &&
		group.totalExercises > 0;

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-base leading-snug">{group.groupName}</CardTitle>
					<div className="flex items-center gap-1.5 shrink-0">
						{isComplete && (
							<CheckCircle2 size={14} className="text-success" aria-label="Group complete" />
						)}
						{group.currentExerciseName && (
							<Badge size="xs" color="info" variant="soft">
								{group.currentExerciseName}
							</Badge>
						)}
					</div>
				</div>
				{group.evaluatorName ? (
					<p className="text-xs text-muted">Evaluator: {group.evaluatorName}</p>
				) : (
					<p className="text-xs text-muted italic">No evaluator assigned</p>
				)}
			</CardHeader>
			<CardContent className="space-y-3">
				<div>
					<div className="flex justify-between text-xs mb-1">
						<span className="text-muted">Players scored</span>
						<span className="text-white font-medium">
							{group.playersScored}/{group.totalPlayers}
						</span>
					</div>
					<ProgressBar value={playerProgress} />
				</div>
				<div>
					<div className="flex justify-between text-xs mb-1">
						<span className="text-muted">Exercises</span>
						<span className="text-white font-medium">
							{group.exercisesCompleted}/{group.totalExercises}
						</span>
					</div>
					<ProgressBar value={exerciseProgress} />
				</div>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Connection indicator
// ---------------------------------------------------------------------------

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
	if (status === "connected") {
		return (
			<span className="flex items-center gap-1 text-xs text-success">
				<Wifi size={12} />
				Live
			</span>
		);
	}
	if (status === "connecting" || status === "reconnecting") {
		return (
			<span className="flex items-center gap-1 text-xs text-warning">
				<span className="loading loading-spinner loading-xs" />
				{status === "reconnecting" ? "Reconnecting" : "Connecting"}
			</span>
		);
	}
	return (
		<span className="flex items-center gap-1 text-xs text-muted">
			<WifiOff size={12} />
			Offline
		</span>
	);
}

// ---------------------------------------------------------------------------
// Session timer helpers
// ---------------------------------------------------------------------------

function formatElapsed(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	if (h > 0) {
		return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	}
	return `${m}:${String(s).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Completed banner
// ---------------------------------------------------------------------------

interface CompletedBannerProps {
	eventId: string;
	sessionId: string;
	onViewResults: () => void;
}

function CompletedBanner({ onViewResults }: CompletedBannerProps) {
	return (
		<div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-success/10 border border-success/20">
			<CheckCircle2 size={36} className="text-success shrink-0" />
			<div className="flex-1 text-center sm:text-left">
				<h3 className="text-base font-bold text-white mb-0.5">Session Completed</h3>
				<p className="text-sm text-muted">
					All evaluations have been recorded. You can now review the results.
				</p>
			</div>
			<Button variant="outline" size="sm" onClick={onViewResults} className="shrink-0">
				View Results
			</Button>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function EvaluationDashboardPage() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const eventId = params.id as string;
	const sessionId = searchParams.get("sessionId");

	const { event } = useEventContext();

	// -------------------------------------------------------------------------
	// Data fetching
	// -------------------------------------------------------------------------

	const { data: session, isLoading: sessionLoading } = useEvaluationSession(sessionId);
	const { data: progress } = useSessionProgress(sessionId);

	// -------------------------------------------------------------------------
	// Real-time
	// -------------------------------------------------------------------------

	useRealtimeEvaluationSession(sessionId);
	const realtimeStatus = useEvaluationSessionStore((s) => s.sessionStatus);
	const realtimeProgress = useEvaluationSessionStore((s) => s.sessionProgress);
	const connectionStatus = useEvaluationSessionStore((s) => s.connectionStatus);

	// Use real-time data when available, fall back to REST
	const effectiveStatus: EvaluationSessionStatus =
		realtimeStatus ?? session?.status ?? "Draft";
	const effectiveProgress = realtimeProgress ?? progress;

	// -------------------------------------------------------------------------
	// Session timer
	// -------------------------------------------------------------------------

	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		if (session?.startedAt && effectiveStatus === "Running") {
			const start = new Date(session.startedAt).getTime();
			const interval = setInterval(() => {
				setElapsed(Math.floor((Date.now() - start) / 1000));
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [session?.startedAt, effectiveStatus]);

	// -------------------------------------------------------------------------
	// Mutations
	// -------------------------------------------------------------------------

	const pauseSession = usePauseSession();
	const resumeSession = useResumeSession();
	const completeSession = useCompleteSession();

	const anyPending =
		pauseSession.isPending || resumeSession.isPending || completeSession.isPending;

	const handlePause = useCallback(async () => {
		if (!sessionId) return;
		try {
			await pauseSession.mutateAsync(sessionId);
			toast.success("Session paused");
		} catch {
			toast.error("Failed to pause session");
		}
	}, [pauseSession, sessionId]);

	const handleResume = useCallback(async () => {
		if (!sessionId) return;
		try {
			await resumeSession.mutateAsync(sessionId);
			toast.success("Session resumed");
		} catch {
			toast.error("Failed to resume session");
		}
	}, [resumeSession, sessionId]);

	const handleComplete = useCallback(async () => {
		if (!sessionId) return;
		try {
			await completeSession.mutateAsync(sessionId);
			toast.success("Session completed");
		} catch {
			toast.error("Failed to complete session");
		}
	}, [completeSession, sessionId]);

	const handleBack = useCallback(() => {
		router.back();
	}, [router]);

	const handleViewResults = useCallback(() => {
		router.push(`/hub/events/${eventId}/evaluation-session/setup?sessionId=${sessionId}`);
	}, [router, eventId, sessionId]);

	// -------------------------------------------------------------------------
	// Derived stats
	// -------------------------------------------------------------------------

	const overallProgress = effectiveProgress?.overallProgress ?? 0;
	const totalPlayers = effectiveProgress?.totalPlayers ?? 0;
	const totalExercises = effectiveProgress?.totalExercises ?? 0;
	const groups = effectiveProgress?.groups ?? [];

	// -------------------------------------------------------------------------
	// Loading state
	// -------------------------------------------------------------------------

	if (sessionLoading) {
		return (
			<div className="flex items-center justify-center py-24">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	// -------------------------------------------------------------------------
	// No session passed via query param
	// -------------------------------------------------------------------------

	if (!sessionId) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
				<BarChart3 size={48} className="text-muted" />
				<div>
					<h2 className="text-lg font-bold text-white mb-1">No session selected</h2>
					<p className="text-sm text-muted">
						Pass a session ID via the{" "}
						<code className="text-xs bg-surface px-1 rounded">sessionId</code> query param.
					</p>
				</div>
				<Button variant="outline" onClick={handleBack}>
					Go Back
				</Button>
			</div>
		);
	}

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	return (
		<div className="space-y-6">
			{/* ---------------------------------------------------------------- */}
			{/* Top bar                                                           */}
			{/* ---------------------------------------------------------------- */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				{/* Left: back + title + status */}
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleBack}
						className="h-8 w-8 p-0 shrink-0"
						aria-label="Go back"
					>
						<ArrowLeft size={16} />
					</Button>
					<div className="min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<h1 className="text-xl font-bold text-white leading-tight">
								Coach Dashboard
							</h1>
							{session && <StatusBadge status={effectiveStatus} />}
						</div>
						{event && (
							<p className="text-sm text-muted truncate">{event.name}</p>
						)}
					</div>
					<ConnectionIndicator status={connectionStatus} />
				</div>

				{/* Right: action buttons */}
				{session && effectiveStatus !== "Completed" && (
					<div className="flex items-center gap-2 pl-11 sm:pl-0">
						{effectiveStatus === "Running" && (
							<Button
								variant="outline"
								size="sm"
								leftIcon={<Pause size={14} />}
								onClick={handlePause}
								disabled={anyPending}
								loading={pauseSession.isPending}
							>
								Pause
							</Button>
						)}
						{effectiveStatus === "Paused" && (
							<Button
								size="sm"
								leftIcon={<Play size={14} />}
								onClick={handleResume}
								disabled={anyPending}
								loading={resumeSession.isPending}
							>
								Resume
							</Button>
						)}
						{(effectiveStatus === "Running" || effectiveStatus === "Paused") && (
							<Button
								variant="outline"
								size="sm"
								leftIcon={<Square size={14} />}
								onClick={handleComplete}
								disabled={anyPending}
								loading={completeSession.isPending}
							>
								Complete Session
							</Button>
						)}
					</div>
				)}
			</div>

			{/* ---------------------------------------------------------------- */}
			{/* Completed banner                                                  */}
			{/* ---------------------------------------------------------------- */}
			{effectiveStatus === "Completed" && sessionId && (
				<CompletedBanner
					eventId={eventId}
					sessionId={sessionId}
					onViewResults={handleViewResults}
				/>
			)}

			{/* ---------------------------------------------------------------- */}
			{/* Stats row                                                         */}
			{/* ---------------------------------------------------------------- */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				<StatCard
					icon={<Users size={18} />}
					label="Total Players"
					value={totalPlayers}
					subValue={
						effectiveProgress
							? `${effectiveProgress.totalScored} scored`
							: undefined
					}
				/>
				<StatCard
					icon={<BarChart3 size={18} />}
					label="Total Exercises"
					value={totalExercises}
					subValue={
						effectiveProgress
							? `${effectiveProgress.totalPossible} possible scores`
							: undefined
					}
				/>
				<StatCard
					icon={<CheckCircle2 size={18} />}
					label="Overall Progress"
					value={`${Math.round(overallProgress)}%`}
					subValue={
						effectiveProgress
							? `${effectiveProgress.totalScored}/${effectiveProgress.totalPossible} scores`
							: undefined
					}
				/>
				<StatCard
					icon={<Clock size={18} />}
					label="Session Duration"
					value={
						session?.startedAt
							? formatElapsed(elapsed)
							: "—"
					}
					subValue={
						effectiveStatus === "Paused"
							? "Paused"
							: effectiveStatus === "Completed"
							? "Completed"
							: effectiveStatus === "Running"
							? "Running"
							: undefined
					}
				/>
			</div>

			{/* ---------------------------------------------------------------- */}
			{/* Overall progress bar                                              */}
			{/* ---------------------------------------------------------------- */}
			{effectiveProgress && (
				<div className="bg-surface border border-border rounded-2xl p-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-white">Overall Progress</span>
						<span className="text-sm font-bold text-white">{Math.round(overallProgress)}%</span>
					</div>
					<div className="h-3 rounded-full bg-hover overflow-hidden">
						<div
							className="h-full rounded-full bg-primary transition-all duration-500"
							style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
						/>
					</div>
					<p className="text-xs text-muted mt-2">
						{effectiveProgress.totalScored} of {effectiveProgress.totalPossible} scores recorded
					</p>
				</div>
			)}

			{/* ---------------------------------------------------------------- */}
			{/* Group progress grid                                               */}
			{/* ---------------------------------------------------------------- */}
			{groups.length > 0 ? (
				<div>
					<h2 className="text-base font-semibold text-white mb-3">
						Groups{" "}
						<span className="text-sm font-normal text-muted">({groups.length})</span>
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{groups.map((group) => (
							<GroupProgressCard key={group.groupId} group={group} />
						))}
					</div>
				</div>
			) : (
				!sessionLoading && (
					<div className="flex flex-col items-center justify-center gap-3 py-12 bg-surface border border-border rounded-2xl text-center">
						<Users size={36} className="text-muted" />
						<div>
							<p className="text-sm font-medium text-white mb-1">No groups yet</p>
							<p className="text-sm text-muted">
								Groups and their progress will appear here once the session has started.
							</p>
						</div>
					</div>
				)
			)}
		</div>
	);
}
