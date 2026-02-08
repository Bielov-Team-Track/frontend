"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Button,
	TextArea,
	Slider,
	Avatar,
} from "@/components/ui";
import { ArrowLeft, Save, CheckCircle2, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useEvent, useEventParticipants } from "@/hooks/useEvents";
import { useEventEvaluationPlan, usePlayerEvaluations, useCreatePlayerEvaluation } from "@/hooks/useEvaluations";
import { EventType } from "@/lib/models/Event";
import { ParticipationStatus } from "@/lib/models/EventParticipant";

// Player interface based on EventParticipant
interface Player {
	id: string;
	name: string;
	avatarUrl?: string;
}

// Skill metric structure matching the evaluation system
interface SkillMetric {
	id: string;
	name: string;
	description: string;
	score: number;
}

interface PlayerEvaluation {
	playerId: string;
	skills: SkillMetric[];
	notes: string;
	completed: boolean;
}

// Validation schema
const evaluationSchema = yup.object({
	scores: yup.array()
		.of(
			yup.object({
				metricId: yup.string().required(),
				score: yup.number()
					.min(0, "Score must be at least 0")
					.max(100, "Score cannot exceed 100")
					.required("Score is required")
			})
		)
		.required()
		.min(1, "At least one score is required")
		.test('at-least-one-non-zero', 'At least one skill must be scored above 0', function(scores) {
			return scores ? scores.some(s => s.score > 0) : false;
		}),
	notes: yup.string()
		.max(1000, "Notes cannot exceed 1000 characters")
		.default("")
});

// Infer form data type from schema
type EvaluationFormData = yup.InferType<typeof evaluationSchema>;

// Default skill metrics (fallback if no evaluation plan exists)
const DEFAULT_SKILL_METRICS: SkillMetric[] = [
	{ id: "serve", name: "Serving", description: "Accuracy and power", score: 0 },
	{ id: "reception", name: "Reception", description: "Passing quality", score: 0 },
	{ id: "setting", name: "Setting", description: "Ball placement", score: 0 },
	{ id: "attack", name: "Attack", description: "Spike effectiveness", score: 0 },
	{ id: "blocking", name: "Blocking", description: "Net defense", score: 0 },
	{ id: "defense", name: "Defense", description: "Court coverage", score: 0 },
];

export default function EvaluateEventPage() {
	const params = useParams();
	const router = useRouter();
	const eventId = params.id as string;

	const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
	const [evaluations, setEvaluations] = useState<Map<string, PlayerEvaluation>>(new Map());

	// Fetch event details
	const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId);

	// Fetch event participants
	const { data: participants = [], isLoading: participantsLoading } = useEventParticipants(eventId);

	// Fetch evaluation plan (optional - may not exist)
	const { data: evaluationPlan, isLoading: planLoading } = useEventEvaluationPlan(eventId, false);

	// Fetch existing evaluations for this event
	const { data: existingEvaluations = [], isLoading: evaluationsLoading } = usePlayerEvaluations(eventId);

	// Create player evaluation mutation
	const createEvaluation = useCreatePlayerEvaluation(eventId);

	// Check if event is valid for evaluation
	const isValidEvaluationType =
		event?.type === EventType.TrainingSession ||
		event?.type === EventType.Evaluation ||
		event?.type === EventType.Trial;

	// Convert participants to players (only accepted participants)
	const players: Player[] = useMemo(() => {
		return participants
			.filter(p => p.status === ParticipationStatus.Accepted || p.status === ParticipationStatus.Attended)
			.map(p => ({
				id: p.userId,
				name: p.userProfile?.name || p.userProfile?.email || "Unknown Player",
				avatarUrl: p.userProfile?.avatar,
			}));
	}, [participants]);

	// Build skill metrics from evaluation plan or use defaults
	const skillMetrics: SkillMetric[] = useMemo(() => {
		// For now, use default skills
		// TODO: In future, load exercises from evaluationPlan and convert to metrics
		return DEFAULT_SKILL_METRICS;
	}, [evaluationPlan]);

	// React Hook Form setup
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		watch,
		setValue,
	} = useForm<EvaluationFormData>({
		resolver: yupResolver(evaluationSchema),
		defaultValues: {
			scores: skillMetrics.map(skill => ({
				metricId: skill.id,
				score: 0
			})),
			notes: ""
		}
	});

	// Watch scores for real-time updates
	const scores = watch("scores");

	const handlePlayerSelect = (player: Player) => {
		// Load existing evaluation or create new one
		const existing = evaluations.get(player.id);
		if (existing) {
			reset({
				scores: existing.skills.map(skill => ({
					metricId: skill.id,
					score: skill.score
				})),
				notes: existing.notes
			});
		} else {
			reset({
				scores: skillMetrics.map(skill => ({
					metricId: skill.id,
					score: 0
				})),
				notes: ""
			});
		}

		setSelectedPlayer(player);
	};

	const onSubmit = async (data: EvaluationFormData) => {
		if (!selectedPlayer) return;

		try {
			// Map form data to API format
			const skillScores = {
				serve: data.scores.find(s => s.metricId === "serve")?.score || 0,
				attack: data.scores.find(s => s.metricId === "attack")?.score || 0,
				defense: data.scores.find(s => s.metricId === "defense")?.score || 0,
				setting: data.scores.find(s => s.metricId === "setting")?.score || 0,
				blocking: data.scores.find(s => s.metricId === "blocking")?.score || 0,
				reception: data.scores.find(s => s.metricId === "reception")?.score || 0,
			};

			// Calculate overall score as average
			const scores = Object.values(skillScores);
			const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

			// Create evaluation request
			const request = {
				playerId: selectedPlayer.id,
				coachNotes: data.notes || undefined,
			};

			// Submit to API
			await createEvaluation.mutateAsync(request);

			// Map form data back to skills format for local state
			const skills: SkillMetric[] = skillMetrics.map(metric => {
				const scoreData = data.scores.find(s => s.metricId === metric.id);
				return {
					...metric,
					score: scoreData?.score || 0
				};
			});

			const evaluation: PlayerEvaluation = {
				playerId: selectedPlayer.id,
				skills,
				notes: data.notes,
				completed: true,
			};

			const newEvals = new Map(evaluations);
			newEvals.set(selectedPlayer.id, evaluation);
			setEvaluations(newEvals);

			toast.success(`Evaluation saved for ${selectedPlayer.name}`);

			// Move to next player
			const currentIndex = players.findIndex((p) => p.id === selectedPlayer.id);
			if (currentIndex < players.length - 1) {
				handlePlayerSelect(players[currentIndex + 1]);
			} else {
				// All players evaluated
				toast.success("All players have been evaluated!");
			}
		} catch (error) {
			console.error("Failed to save evaluation:", error);
			toast.error("Failed to save evaluation. Please try again.");
		}
	};

	const calculateOverallScore = () => {
		if (!scores || scores.length === 0) return 0;
		const total = scores.reduce((sum, item) => sum + item.score, 0);
		return Math.round(total / scores.length);
	};

	const getCompletedCount = () => {
		return Array.from(evaluations.values()).filter((e) => e.completed).length;
	};

	// Loading state
	if (eventLoading || participantsLoading) {
		return (
			<div className="container mx-auto p-6 space-y-6 max-w-7xl">
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
						<p className="text-muted">Loading evaluation session...</p>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (eventError || !event) {
		return (
			<div className="container mx-auto p-6 space-y-6 max-w-7xl">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push("/hub/coach")}
						className="gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Dashboard
					</Button>
				</div>
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<AlertCircle className="w-12 h-12 mx-auto mb-3 text-error" />
							<h3 className="text-lg font-semibold text-white mb-2">Event not found</h3>
							<p className="text-muted">The event you're looking for doesn't exist or has been deleted.</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Invalid event type
	if (!isValidEvaluationType) {
		return (
			<div className="container mx-auto p-6 space-y-6 max-w-7xl">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push(`/hub/events/${eventId}`)}
						className="gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Event
					</Button>
				</div>
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<AlertCircle className="w-12 h-12 mx-auto mb-3 text-warning" />
							<h3 className="text-lg font-semibold text-white mb-2">Invalid Event Type</h3>
							<p className="text-muted">
								Evaluations can only be created for Training Sessions, Evaluations, or Trial events.
							</p>
							<p className="text-sm text-muted mt-2">Current event type: {event.type}</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// No participants
	if (players.length === 0) {
		return (
			<div className="container mx-auto p-6 space-y-6 max-w-7xl">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push(`/hub/events/${eventId}`)}
						className="gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Event
					</Button>
				</div>
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<User className="w-12 h-12 mx-auto mb-3 text-muted opacity-50" />
							<h3 className="text-lg font-semibold text-white mb-2">No Participants</h3>
							<p className="text-muted">
								There are no accepted participants for this event yet.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6 max-w-7xl">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push(`/hub/events/${eventId}`)}
					className="gap-2"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Event
				</Button>
			</div>

			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white">{event.name}</h1>
					<p className="text-muted mt-1">
						{new Date(event.startTime).toLocaleDateString()} • {getCompletedCount()}/{players.length}{" "}
						evaluations completed
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="text-right">
						<p className="text-sm text-muted">Overall Progress</p>
						<p className="text-2xl font-bold text-white">
							{players.length > 0 ? Math.round((getCompletedCount() / players.length) * 100) : 0}%
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Player List */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle>Players</CardTitle>
						<CardDescription>Select a player to evaluate</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{players.map((player) => {
								const isCompleted = evaluations.get(player.id)?.completed;
								const isSelected = selectedPlayer?.id === player.id;

								return (
									<button
										key={player.id}
										onClick={() => handlePlayerSelect(player)}
										className={`w-full p-3 rounded-lg border transition-all ${
											isSelected
												? "bg-primary/10 border-primary/50"
												: "bg-surface border-border hover:bg-hover"
										}`}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<Avatar
													src={player.avatarUrl}
													alt={player.name}
													name={player.name}
													size="sm"
												/>
												<span className="text-sm font-medium text-white">{player.name}</span>
											</div>
											{isCompleted && <CheckCircle2 className="w-5 h-5 text-green-400" />}
										</div>
									</button>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Evaluation Form */}
				<div className="lg:col-span-2 space-y-6">
					{!selectedPlayer ? (
						<Card>
							<CardContent className="py-12">
								<div className="text-center text-muted">
									<User className="w-12 h-12 mx-auto mb-3 opacity-50" />
									<p>Select a player to start evaluation</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<>
							{/* Player Info */}
							<Card>
								<CardContent className="pt-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<Avatar
												src={selectedPlayer.avatarUrl}
												alt={selectedPlayer.name}
												name={selectedPlayer.name}
												size="lg"
											/>
											<div>
												<h2 className="text-2xl font-bold text-white">{selectedPlayer.name}</h2>
												<p className="text-sm text-muted">Player Evaluation</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm text-muted">Overall Score</p>
											<p className="text-3xl font-bold text-primary">{calculateOverallScore()}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Skill Metrics */}
							<Card>
								<CardHeader>
									<CardTitle>Skill Assessment</CardTitle>
									<CardDescription>Rate each skill from 0-100</CardDescription>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
										{skillMetrics.map((skill, index) => {
											const currentScore = scores?.[index]?.score || 0;
											const fieldError = errors.scores?.[index]?.score;

											return (
												<div key={skill.id} className="space-y-2">
													<div className="flex items-center justify-between">
														<div>
															<label className="text-sm font-medium text-white">{skill.name}</label>
															<p className="text-xs text-muted">{skill.description}</p>
														</div>
														<span className="text-2xl font-bold text-white tabular-nums w-16 text-right">
															{currentScore}
														</span>
													</div>
													<Controller
														name={`scores.${index}.score`}
														control={control}
														render={({ field }) => (
															<Slider
																value={Number(field.value) || 0}
																onValueChange={(value) => field.onChange(value ?? 0)}
																max={100}
																step={1}
																className="w-full"
															/>
														)}
													/>
													{fieldError && (
														<p className="text-xs text-red-400">{fieldError.message}</p>
													)}
												</div>
											);
										})}

										{/* Global validation error for scores */}
										{errors.scores && typeof errors.scores.message === 'string' && (
											<div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20">
												<p className="text-sm text-red-400">{errors.scores.message}</p>
											</div>
										)}
									</form>
								</CardContent>
							</Card>

							{/* Notes */}
							<Card>
								<CardHeader>
									<CardTitle>Evaluation Notes</CardTitle>
									<CardDescription>Additional feedback and observations (optional, max 1000 characters)</CardDescription>
								</CardHeader>
								<CardContent>
									<Controller
										name="notes"
										control={control}
										render={({ field }) => (
											<TextArea
												{...field}
												placeholder="Enter your observations, strengths, and areas for improvement..."
												rows={6}
												className="w-full"
												maxLength={1000}
												showCharCount
												error={errors.notes?.message}
											/>
										)}
									/>
								</CardContent>
							</Card>

							{/* Actions */}
							<div className="flex items-center justify-end gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={() => setSelectedPlayer(null)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="default"
									onClick={handleSubmit(onSubmit)}
									disabled={isSubmitting || createEvaluation.isPending}
									className="gap-2"
								>
									<Save className="w-4 h-4" />
									{(isSubmitting || createEvaluation.isPending) ? "Saving..." : "Save Evaluation"}
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
