"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock, MessageSquare, BarChart2 } from "lucide-react";
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, Loader } from "@/components/ui";
import { CollapsibleSection } from "@/components/ui";
import { SKILL_COLORS } from "@/components/features/evaluations/types";
import { useMyEvaluations } from "@/hooks/useEvaluations";
import type { PlayerSkillScoreDto, PlayerMetricScoreDto } from "@/lib/models/Evaluation";

// =============================================================================
// HELPERS
// =============================================================================

function getSkillHexColor(skill: string): string {
	const colors: Record<string, string> = {
		Passing: "#38bdf8",
		Setting: "#a78bfa",
		Defending: "#34d399",
		Serving: "#fbbf24",
		Attacking: "#fb7185",
		Blocking: "#fb923c",
		Game: "#f472b6",
	};
	return colors[skill] ?? "#94a3b8";
}

function computeOverallScore(skillScores: PlayerSkillScoreDto[]): number {
	if (skillScores.length === 0) return 0;
	const sum = skillScores.reduce((acc, s) => acc + s.score, 0);
	return sum / skillScores.length;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ScoreRing({ score, maxScore = 10 }: { score: number; maxScore?: number }) {
	const percentage = (score / maxScore) * 100;
	const radius = 60;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;
	const color =
		percentage >= 70 ? "#4A7A45" : percentage >= 40 ? "#D99100" : "#BE3F23";

	return (
		<div className="relative w-40 h-40 mx-auto">
			<svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
				<circle
					cx="70"
					cy="70"
					r={radius}
					stroke="var(--border)"
					strokeWidth="8"
					fill="none"
				/>
				<circle
					cx="70"
					cy="70"
					r={radius}
					stroke={color}
					strokeWidth="8"
					fill="none"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					className="transition-all duration-1000"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-3xl font-bold text-white">{score.toFixed(1)}</span>
				<span className="text-xs text-muted">out of {maxScore}</span>
			</div>
		</div>
	);
}

function SkillBar({ skillScore }: { skillScore: PlayerSkillScoreDto }) {
	const colorClass =
		SKILL_COLORS[skillScore.skill as keyof typeof SKILL_COLORS] ??
		"bg-surface text-muted";
	const percentage = (skillScore.score / 10) * 100;

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Badge size="xs" color="neutral" variant="soft" className={colorClass}>
						{skillScore.skill}
					</Badge>
					{skillScore.level && (
						<span className="text-xs text-muted">{skillScore.level}</span>
					)}
				</div>
				<span className="text-sm font-bold text-white tabular-nums">
					{skillScore.score.toFixed(1)}
				</span>
			</div>
			<div className="h-2.5 rounded-full bg-surface overflow-hidden">
				<div
					className="h-full rounded-full transition-all duration-700"
					style={{
						width: `${percentage}%`,
						backgroundColor: getSkillHexColor(skillScore.skill),
					}}
				/>
			</div>
		</div>
	);
}

function MetricRow({ metric }: { metric: PlayerMetricScoreDto }) {
	const normalizedPct = Math.round(metric.normalizedScore * 100);
	const scoreColor =
		normalizedPct >= 70
			? "text-emerald-400"
			: normalizedPct >= 40
			? "text-amber-400"
			: "text-rose-400";

	return (
		<div className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
			<span className="text-sm text-muted flex-1 min-w-0 truncate">
				{metric.metricName}
			</span>
			<div className="flex items-center gap-3 shrink-0">
				<span className="text-xs text-muted tabular-nums">
					raw: {metric.rawValue}
				</span>
				<span className={`text-sm font-bold tabular-nums ${scoreColor}`}>
					{normalizedPct}%
				</span>
			</div>
		</div>
	);
}

function OutcomeBanner({ outcome }: { outcome?: string }) {
	if (!outcome || outcome === "Pending") {
		return (
			<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex items-center gap-3">
				<div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
				<div>
					<p className="text-sm font-semibold text-amber-300">Result Pending</p>
					<p className="text-xs text-amber-400/70 mt-0.5">
						Your coach has not finalised the outcome yet.
					</p>
				</div>
			</div>
		);
	}

	if (outcome === "Pass") {
		return (
			<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 flex items-center gap-3">
				<div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
				<div>
					<p className="text-sm font-semibold text-emerald-300">Passed</p>
					<p className="text-xs text-emerald-400/70 mt-0.5">
						You have successfully passed this evaluation.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 flex items-center gap-3">
			<div className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
			<div>
				<p className="text-sm font-semibold text-rose-300">Not Passed</p>
				<p className="text-xs text-rose-400/70 mt-0.5">
					Review your coach&apos;s notes and keep working on the areas below.
				</p>
			</div>
		</div>
	);
}

// =============================================================================
// PAGE
// =============================================================================

export default function MyEvaluationResultPage() {
	const params = useParams();
	const router = useRouter();
	const evaluationId = params.id as string;

	// Fetch the paginated list and find the matching evaluation.
	// Page size 100 covers reasonable use-cases; a dedicated endpoint can replace
	// this in the future once the backend exposes GET /player-evaluations/me/{id}.
	const { data, isLoading, error } = useMyEvaluations(1, 100);

	const evaluation = data?.items.find((e) => e.id === evaluationId) ?? null;

	// ── Loading ──────────────────────────────────────────────────────────────
	if (isLoading) {
		return (
			<div className="container mx-auto p-6 max-w-2xl">
				<div className="flex items-center gap-3 mb-8">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft size={16} />
					</Button>
					<h1 className="text-xl font-bold text-white">My Evaluation</h1>
				</div>
				<div className="flex justify-center py-20">
					<Loader />
				</div>
			</div>
		);
	}

	// ── Error / Not Found ────────────────────────────────────────────────────
	if (error || !evaluation) {
		return (
			<div className="container mx-auto p-6 max-w-2xl">
				<div className="flex items-center gap-3 mb-8">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft size={16} />
					</Button>
					<h1 className="text-xl font-bold text-white">My Evaluation</h1>
				</div>
				<Card>
					<CardContent className="py-16 text-center">
						<BarChart2 className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
						<h3 className="text-lg font-semibold text-white mb-2">
							Evaluation Not Found
						</h3>
						<p className="text-sm text-muted">
							This evaluation could not be found or you do not have access to it.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// ── Not shared ───────────────────────────────────────────────────────────
	if (!evaluation.sharedWithPlayer) {
		return (
			<div className="container mx-auto p-6 max-w-2xl">
				<div className="flex items-center gap-3 mb-8">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft size={16} />
					</Button>
					<h1 className="text-xl font-bold text-white">My Evaluation</h1>
				</div>
				<Card>
					<CardContent className="py-16 text-center">
						<Lock className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
						<h3 className="text-lg font-semibold text-white mb-2">
							Evaluation in Review
						</h3>
						<p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
							Your evaluation is being reviewed by the coaching staff. Results will
							be visible once they are shared with you.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// ── Shared result ────────────────────────────────────────────────────────
	const overallScore = computeOverallScore(evaluation.skillScores ?? []);
	const hasMetrics = (evaluation.metricScores ?? []).length > 0;
	const hasSkills = (evaluation.skillScores ?? []).length > 0;

	return (
		<div className="container mx-auto p-6 space-y-6 max-w-2xl">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="sm" onClick={() => router.back()}>
					<ArrowLeft size={16} />
				</Button>
				<div className="flex-1 min-w-0">
					<h1 className="text-xl font-bold text-white">My Evaluation</h1>
					{evaluation.createdAt && (
						<p className="text-xs text-muted mt-0.5">
							{new Date(evaluation.createdAt).toLocaleDateString(undefined, {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					)}
				</div>
			</div>

			{/* Outcome banner */}
			<OutcomeBanner outcome={evaluation.outcome} />

			{/* Overall score ring */}
			{hasSkills && (
				<Card>
					<CardContent className="pt-6 pb-6">
						<p className="text-xs font-semibold text-muted text-center uppercase tracking-widest mb-5">
							Overall Score
						</p>
						<ScoreRing score={overallScore} />
					</CardContent>
				</Card>
			)}

			{/* Skill breakdown */}
			{hasSkills && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Skill Breakdown</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5 pt-0">
						{evaluation.skillScores.map((skillScore) => (
							<SkillBar key={skillScore.id} skillScore={skillScore} />
						))}
					</CardContent>
				</Card>
			)}

			{/* Metric details (collapsible) */}
			{hasMetrics && (
				<CollapsibleSection label="Metric Details">
					<div className="divide-y divide-border">
						{evaluation.metricScores.map((metric) => (
							<MetricRow key={metric.id} metric={metric} />
						))}
					</div>
				</CollapsibleSection>
			)}

			{/* Coach notes */}
			{evaluation.coachNotes && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<MessageSquare size={16} className="text-muted" />
							Coach Notes
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
							{evaluation.coachNotes}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Empty state when evaluation has no data yet */}
			{!hasSkills && !hasMetrics && !evaluation.coachNotes && (
				<Card>
					<CardContent className="py-12 text-center">
						<BarChart2 className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
						<p className="text-sm text-muted">
							No scores have been recorded for this evaluation yet.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
