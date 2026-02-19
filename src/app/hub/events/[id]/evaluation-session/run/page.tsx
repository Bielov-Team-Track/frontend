"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, PauseCircle } from "lucide-react";

import { Avatar, Badge, Button, Card, CardContent } from "@/components/ui";
import { useEvaluationSession, useSessionScores, useSubmitExerciseScores } from "@/hooks/useEvaluations";
import { useRealtimeEvaluationSession } from "@/hooks/useRealtimeEvaluationSession";
import { useEvaluationSessionStore } from "@/lib/realtime/evaluationSessionStore";
import type { EvaluationParticipantDto, MetricScoreValueDto, PlayerExerciseScoreDto } from "@/lib/models/Evaluation";

import { ExerciseNav } from "@/components/features/evaluations/session";
import { MetricInput } from "@/components/features/evaluations/session";
import { PlayerNav } from "@/components/features/evaluations/session";

import { useEventContext } from "../../../layout";

// ---------------------------------------------------------------------------
// Paused overlay
// ---------------------------------------------------------------------------

function PausedOverlay() {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="flex flex-col items-center gap-4 text-center px-6 max-w-sm">
				<PauseCircle size={56} className="text-warning" />
				<div>
					<h2 className="text-xl font-bold text-white mb-1">Session Paused</h2>
					<p className="text-sm text-muted">Scoring is temporarily disabled. Wait for the session to resume.</p>
				</div>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Completed state
// ---------------------------------------------------------------------------

interface CompletedStateProps {
	eventId: string;
	onGoBack: () => void;
}

function CompletedState({ onGoBack }: CompletedStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
			<CheckCircle2 size={56} className="text-success" />
			<div>
				<h2 className="text-xl font-bold text-white mb-2">Session Completed</h2>
				<p className="text-sm text-muted max-w-xs mx-auto">
					The evaluation session has been completed. All scores have been recorded.
				</p>
			</div>
			<Button variant="outline" onClick={onGoBack}>
				Back to Setup
			</Button>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Empty state when no session
// ---------------------------------------------------------------------------

function NoSessionState({ onGoBack }: { onGoBack: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
			<ClipboardList size={48} className="text-muted" />
			<div>
				<h2 className="text-lg font-bold text-white mb-1">No session found</h2>
				<p className="text-sm text-muted">Pass a session ID via the <code className="text-xs bg-surface px-1 rounded">sessionId</code> query param.</p>
			</div>
			<Button variant="outline" onClick={onGoBack}>
				Go to Setup
			</Button>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a lookup key for a player+exercise score record. */
function scoreKey(playerId: string, exerciseId: string): string {
	return `${playerId}_${exerciseId}`;
}

/** Extract local scores map from a PlayerExerciseScoreDto. */
function extractLocalScores(score: PlayerExerciseScoreDto | undefined): Record<string, number> {
	if (!score) return {};
	return Object.fromEntries(score.metricScores.map((ms) => [ms.metricId, ms.value]));
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function EvaluationRunPage() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const eventId = params.id as string;

	// Session ID comes from query param: /run?sessionId=xxx
	const sessionId = searchParams.get("sessionId");

	const { event } = useEventContext();

	// ---------------------------------------------------------------------------
	// Data fetching
	// ---------------------------------------------------------------------------

	const { data: session, isLoading } = useEvaluationSession(sessionId);
	const { data: scoresData } = useSessionScores(sessionId);

	// Real-time
	useRealtimeEvaluationSession(sessionId);
	const sessionStatus = useEvaluationSessionStore((s) => s.sessionStatus);
	const realtimeScores = useEvaluationSessionStore((s) => s.exerciseScores);

	// ---------------------------------------------------------------------------
	// Mutations
	// ---------------------------------------------------------------------------

	const submitScores = useSubmitExerciseScores(sessionId ?? "");

	// ---------------------------------------------------------------------------
	// Local state
	// ---------------------------------------------------------------------------

	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [localScores, setLocalScores] = useState<Record<string, number>>({});
	const [isSaving, setIsSaving] = useState(false);

	// ---------------------------------------------------------------------------
	// Derived data
	// ---------------------------------------------------------------------------

	const exercises = useMemo(
		() => session?.evaluationPlan?.items?.slice().sort((a, b) => a.order - b.order) ?? [],
		[session]
	);

	const currentPlanItem = exercises[currentExerciseIndex];
	const currentExercise = currentPlanItem?.exercise;

	const players: EvaluationParticipantDto[] = useMemo(
		() => session?.participants ?? [],
		[session]
	);

	const currentPlayer = players[currentPlayerIndex] ?? null;

	// Effective status: prefer real-time store value, fall back to session data
	const effectiveStatus = sessionStatus ?? session?.status ?? "Draft";

	// All scores: combine REST response with real-time updates
	const allScores = useMemo(() => {
		const base: Record<string, PlayerExerciseScoreDto> = {};
		if (scoresData) {
			for (const score of scoresData) {
				base[scoreKey(score.playerId, score.exerciseId)] = score;
			}
		}
		// Real-time scores override REST scores
		return { ...base, ...realtimeScores };
	}, [scoresData, realtimeScores]);

	// Set of player IDs that have been scored for the current exercise
	const scoredPlayerIds = useMemo<Set<string>>(() => {
		if (!currentExercise) return new Set();
		return new Set(
			players
				.filter((p) => {
					const key = scoreKey(p.playerId, currentExercise.id);
					return allScores[key]?.status === "Scored";
				})
				.map((p) => p.playerId)
		);
	}, [players, currentExercise, allScores]);

	// Set of exercise IDs where ALL players are scored
	const completedExerciseIds = useMemo<Set<string>>(() => {
		const completed = new Set<string>();
		for (const item of exercises) {
			const ex = item.exercise;
			const allScored = players.length > 0 && players.every((p) => {
				const key = scoreKey(p.playerId, ex.id);
				return allScores[key]?.status === "Scored";
			});
			if (allScored) completed.add(ex.id);
		}
		return completed;
	}, [exercises, players, allScores]);

	// ---------------------------------------------------------------------------
	// Load existing scores for a given player index into local state
	// ---------------------------------------------------------------------------

	const loadScoresForPlayer = useCallback(
		(playerIndex: number, exerciseId?: string) => {
			const player = players[playerIndex];
			const exId = exerciseId ?? currentExercise?.id;
			if (!player || !exId) {
				setLocalScores({});
				return;
			}
			const existing = allScores[scoreKey(player.playerId, exId)];
			setLocalScores(extractLocalScores(existing));
		},
		[players, currentExercise, allScores]
	);

	// Initialize local scores when the current player/exercise changes
	useEffect(() => {
		loadScoresForPlayer(currentPlayerIndex);
		// allScores is intentionally excluded — we only re-sync on navigation
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPlayerIndex, currentExerciseIndex]);

	// ---------------------------------------------------------------------------
	// Save current scores and navigate to another player
	// ---------------------------------------------------------------------------

	const saveAndNavigate = useCallback(
		async (nextPlayerIndex: number) => {
			if (currentPlayer && currentExercise && sessionId) {
				// Only submit if there are actual scores to save
				const scores: MetricScoreValueDto[] = Object.entries(localScores).map(
					([metricId, value]) => ({ metricId, value, notes: null })
				);
				if (scores.length > 0) {
					setIsSaving(true);
					try {
						await submitScores.mutateAsync({
							playerId: currentPlayer.playerId,
							exerciseId: currentExercise.id,
							scores,
						});
					} catch {
						toast.error("Failed to save scores");
					}
					setIsSaving(false);
				}
			}
			setCurrentPlayerIndex(nextPlayerIndex);
		},
		[currentPlayer, currentExercise, sessionId, localScores, submitScores]
	);

	// ---------------------------------------------------------------------------
	// Navigation handlers
	// ---------------------------------------------------------------------------

	const handleExerciseSelect = useCallback(
		async (exerciseId: string) => {
			const nextIndex = exercises.findIndex((item) => item.exercise.id === exerciseId);
			if (nextIndex === -1) return;

			// Save current player's scores before switching exercise
			if (currentPlayer && currentExercise && sessionId) {
				const scores: MetricScoreValueDto[] = Object.entries(localScores).map(
					([metricId, value]) => ({ metricId, value, notes: null })
				);
				if (scores.length > 0) {
					setIsSaving(true);
					try {
						await submitScores.mutateAsync({
							playerId: currentPlayer.playerId,
							exerciseId: currentExercise.id,
							scores,
						});
					} catch {
						toast.error("Failed to save scores");
					}
					setIsSaving(false);
				}
			}

			setCurrentExerciseIndex(nextIndex);
			// Load scores for current player in the new exercise
			const newExercise = exercises[nextIndex]?.exercise;
			if (currentPlayer && newExercise) {
				const existing = allScores[scoreKey(currentPlayer.playerId, newExercise.id)];
				setLocalScores(extractLocalScores(existing));
			}
		},
		[exercises, currentPlayer, currentExercise, sessionId, localScores, submitScores, allScores]
	);

	const handlePlayerSelect = useCallback(
		async (playerId: string) => {
			const nextIndex = players.findIndex((p) => p.playerId === playerId);
			if (nextIndex === -1 || nextIndex === currentPlayerIndex) return;
			await saveAndNavigate(nextIndex);
		},
		[players, currentPlayerIndex, saveAndNavigate]
	);

	const handlePrevious = useCallback(() => {
		if (currentPlayerIndex > 0) {
			saveAndNavigate(currentPlayerIndex - 1);
		}
	}, [currentPlayerIndex, saveAndNavigate]);

	const handleNext = useCallback(() => {
		if (currentPlayerIndex < players.length - 1) {
			saveAndNavigate(currentPlayerIndex + 1);
		}
	}, [currentPlayerIndex, players.length, saveAndNavigate]);

	const handleGoBack = useCallback(() => {
		router.push(`/hub/events/${eventId}/evaluation-session/setup`);
	}, [router, eventId]);

	// ---------------------------------------------------------------------------
	// Loading state
	// ---------------------------------------------------------------------------

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	// ---------------------------------------------------------------------------
	// No session passed via query param
	// ---------------------------------------------------------------------------

	if (!sessionId) {
		return <NoSessionState onGoBack={handleGoBack} />;
	}

	// ---------------------------------------------------------------------------
	// Completed state
	// ---------------------------------------------------------------------------

	if (effectiveStatus === "Completed") {
		return <CompletedState eventId={eventId} onGoBack={handleGoBack} />;
	}

	// ---------------------------------------------------------------------------
	// No plan or no players
	// ---------------------------------------------------------------------------

	if (session && (!session.evaluationPlan || exercises.length === 0)) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
				<ClipboardList size={48} className="text-muted" />
				<div>
					<h2 className="text-lg font-bold text-white mb-1">No evaluation plan</h2>
					<p className="text-sm text-muted max-w-xs mx-auto">
						This session does not have an evaluation plan assigned. Go to setup to configure it.
					</p>
				</div>
				<Button variant="outline" onClick={handleGoBack}>
					Back to Setup
				</Button>
			</div>
		);
	}

	// ---------------------------------------------------------------------------
	// Render
	// ---------------------------------------------------------------------------

	const exerciseNavItems = exercises.map((item) => ({
		id: item.exercise.id,
		name: item.exercise.name,
		order: item.order,
	}));

	const playerNavItems = players.map((p) => ({
		playerId: p.playerId,
		playerName: p.playerName,
		avatarUrl: p.avatarUrl,
	}));

	const sortedMetrics = currentExercise?.metrics.slice().sort((a, b) => a.order - b.order) ?? [];

	const isDisabled = effectiveStatus === "Paused" || effectiveStatus === "Completed" || effectiveStatus === "Draft";

	return (
		<div className="space-y-4 relative">
			{/* Paused overlay */}
			{effectiveStatus === "Paused" && <PausedOverlay />}

			{/* Exercise navigation */}
			{exercises.length > 0 && (
				<ExerciseNav
					exercises={exerciseNavItems}
					currentExerciseId={currentExercise?.id ?? null}
					completedExerciseIds={completedExerciseIds}
					onSelectExercise={handleExerciseSelect}
				/>
			)}

			{/* Scoring header */}
			{currentExercise && (
				<div className="flex items-center justify-between gap-3">
					<div className="min-w-0">
						<h2 className="text-lg font-bold text-white leading-tight truncate">
							{currentExercise.name}
						</h2>
						<p className="text-xs text-muted">
							{sortedMetrics.length} {sortedMetrics.length === 1 ? "metric" : "metrics"}
							{event && (
								<>
									{" · "}
									<span className="text-muted">{event.name}</span>
								</>
							)}
						</p>
					</div>
					<Badge size="sm" color="info" variant="soft" className="shrink-0">
						{scoredPlayerIds.size}/{players.length} scored
					</Badge>
				</div>
			)}

			{/* Metric inputs */}
			{currentPlayer && currentExercise ? (
				<Card>
					<CardContent className="pt-5 space-y-6">
						{/* Player header */}
						<div className="flex items-center gap-3 pb-4 border-b border-border">
							<Avatar
								name={currentPlayer.playerName ?? "?"}
								src={currentPlayer.avatarUrl ?? undefined}
								size="sm"
							/>
							<div className="min-w-0">
								<p className="font-semibold text-white leading-tight truncate">
									{currentPlayer.playerName ?? "Unknown"}
								</p>
								<p className="text-xs text-muted">
									Player {currentPlayerIndex + 1} of {players.length}
								</p>
							</div>
							{scoredPlayerIds.has(currentPlayer.playerId) && (
								<Badge size="xs" color="success" variant="soft" className="ml-auto shrink-0">
									Scored
								</Badge>
							)}
						</div>

						{/* Metrics */}
						{sortedMetrics.length > 0 ? (
							sortedMetrics.map((metric) => (
								<MetricInput
									key={metric.id}
									metric={metric}
									value={localScores[metric.id] ?? 0}
									onChange={(val) =>
										setLocalScores((prev) => ({ ...prev, [metric.id]: val }))
									}
									disabled={isDisabled}
								/>
							))
						) : (
							<p className="text-sm text-muted text-center py-4">No metrics defined for this exercise.</p>
						)}
					</CardContent>
				</Card>
			) : (
				!isLoading && session && players.length === 0 && (
					<div className="flex flex-col items-center gap-3 py-12 text-center">
						<ClipboardList size={40} className="text-muted" />
						<p className="text-sm text-muted">No participants in this session.</p>
					</div>
				)
			)}

			{/* Sticky bottom bar: player nav + navigation buttons */}
			{players.length > 0 && (
				<div className="sticky bottom-0 bg-background/90 backdrop-blur-sm py-3 border-t border-border -mx-0">
					<PlayerNav
						players={playerNavItems}
						currentPlayerId={currentPlayer?.playerId ?? null}
						scoredPlayerIds={scoredPlayerIds}
						onSelectPlayer={handlePlayerSelect}
					/>

					<div className="flex items-center justify-between mt-3 px-1">
						<Button
							variant="outline"
							size="sm"
							disabled={currentPlayerIndex === 0 || isSaving}
							onClick={handlePrevious}
						>
							Previous
						</Button>

						{isSaving ? (
							<span className="text-xs text-muted flex items-center gap-1.5">
								<span className="loading loading-spinner loading-xs" />
								Saving...
							</span>
						) : (
							<span className="text-xs text-muted">
								{currentPlayerIndex + 1} / {players.length}
							</span>
						)}

						<Button
							size="sm"
							disabled={currentPlayerIndex === players.length - 1 || isSaving}
							onClick={handleNext}
						>
							{isSaving ? "Saving..." : "Next Player"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
