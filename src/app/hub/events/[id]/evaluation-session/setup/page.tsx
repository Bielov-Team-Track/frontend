"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEventContext } from "../../layout";
import {
	Button,
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CollapsibleSection,
	Avatar,
	Input,
} from "@/components/ui";
import {
	ArrowLeft,
	Play,
	Pause,
	Square,
	Users,
	ClipboardList,
	UserCheck,
	Plus,
	Trash2,
	Shuffle,
	AlertTriangle,
} from "lucide-react";
import {
	useEvaluationSession,
	useStartSession,
	usePauseSession,
	useResumeSession,
	useCompleteSession,
	useAutoSplitGroups,
	useCreateGroup,
	useDeleteGroup,
	useCreateEvaluationSession,
} from "@/hooks/useEvaluations";
import { toast } from "sonner";
import type {
	EvaluationSessionStatus,
	EvaluationGroupDto,
	EvaluationParticipantDto,
} from "@/lib/models/Evaluation";

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: EvaluationSessionStatus }) {
	const config: Record<EvaluationSessionStatus, { color: "neutral" | "success" | "warning" | "info"; label: string }> = {
		Draft: { color: "neutral", label: "Draft" },
		Running: { color: "success", label: "Running" },
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
// GroupCard
// ---------------------------------------------------------------------------

interface GroupCardProps {
	group: EvaluationGroupDto;
	participants: EvaluationParticipantDto[];
	isDraft: boolean;
	onDeleteGroup: (groupId: string) => void;
}

function GroupCard({ group, participants, isDraft, onDeleteGroup }: GroupCardProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">{group.name}</CardTitle>
					{isDraft && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onDeleteGroup(group.id)}
							className="text-muted hover:text-error h-7 w-7 p-0"
							aria-label={`Delete ${group.name}`}
						>
							<Trash2 size={14} />
						</Button>
					)}
				</div>
				<p className="text-xs text-muted">{group.players.length} players</p>
			</CardHeader>
			<CardContent>
				{group.players.length > 0 ? (
					<div className="space-y-1.5">
						{group.players.map((player) => {
							const participant = participants.find((p) => p.playerId === player.playerId);
							return (
								<div
									key={player.id}
									className="flex items-center gap-2 p-2 rounded-md hover:bg-hover transition-colors"
								>
									<Avatar
										name={participant?.playerName ?? "?"}
										src={participant?.avatarUrl ?? undefined}
										size="xs"
									/>
									<span className="text-sm text-white flex-1 truncate">
										{participant?.playerName ?? "Unknown"}
									</span>
								</div>
							);
						})}
					</div>
				) : (
					<p className="text-xs text-muted text-center py-3">No players assigned</p>
				)}
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function EvaluationSessionSetupPage() {
	const params = useParams();
	const router = useRouter();
	const eventId = params.id as string;
	const { event } = useEventContext();

	const [sessionId, setSessionId] = useState<string | null>(null);
	const [numberOfGroups, setNumberOfGroups] = useState(2);

	// Queries
	const { data: session, isLoading } = useEvaluationSession(sessionId);

	// Session lifecycle mutations
	const startSession = useStartSession();
	const pauseSession = usePauseSession();
	const resumeSession = useResumeSession();
	const completeSession = useCompleteSession();
	const createSession = useCreateEvaluationSession();

	// Group mutations — hooks must always be called, sessionId may be null
	const autoSplitGroups = useAutoSplitGroups(sessionId ?? "");
	const createGroup = useCreateGroup(sessionId ?? "");
	const deleteGroup = useDeleteGroup(sessionId ?? "");

	// ---------------------------------------------------------------------------
	// Derived state
	// ---------------------------------------------------------------------------

	const isDraft = session?.status === "Draft";
	const isEditable = isDraft;

	const assignedPlayerIds = useMemo(() => {
		if (!session) return new Set<string>();
		return new Set(session.groups.flatMap((g) => g.players.map((p) => p.playerId)));
	}, [session]);

	const unassignedPlayers = useMemo(() => {
		if (!session) return [];
		return session.participants.filter((p) => !assignedPlayerIds.has(p.playerId));
	}, [session, assignedPlayerIds]);

	const canStart = useMemo(() => {
		if (!session) return false;
		return session.status === "Draft" && session.groups.length > 0 && session.participants.length > 0;
	}, [session]);

	// ---------------------------------------------------------------------------
	// Handlers
	// ---------------------------------------------------------------------------

	const handleCreateSession = useCallback(async () => {
		if (!event || !event.contextId) return;
		try {
			const created = await createSession.mutateAsync({
				clubId: event.contextId,
				eventId,
				title: `${event.name} Evaluation`,
			});
			setSessionId(created.id);
			toast.success("Evaluation session created");
		} catch {
			toast.error("Failed to create evaluation session");
		}
	}, [createSession, event, eventId]);

	const handleStart = useCallback(async () => {
		if (!sessionId) return;
		try {
			await startSession.mutateAsync(sessionId);
			toast.success("Session started");
		} catch {
			toast.error("Failed to start session");
		}
	}, [startSession, sessionId]);

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

	const handleAutoSplit = useCallback(async () => {
		if (!sessionId) return;
		try {
			await autoSplitGroups.mutateAsync({ numberOfGroups });
			toast.success(`Players split into ${numberOfGroups} groups`);
		} catch {
			toast.error("Failed to auto-split players");
		}
	}, [autoSplitGroups, sessionId, numberOfGroups]);

	const handleCreateGroup = useCallback(async () => {
		if (!sessionId || !session) return;
		const groupNumber = session.groups.length + 1;
		try {
			await createGroup.mutateAsync({ name: `Group ${groupNumber}` });
			toast.success("Group created");
		} catch {
			toast.error("Failed to create group");
		}
	}, [createGroup, sessionId, session]);

	const handleDeleteGroup = useCallback(
		async (groupId: string) => {
			if (!sessionId) return;
			try {
				await deleteGroup.mutateAsync(groupId);
				toast.success("Group deleted");
			} catch {
				toast.error("Failed to delete group");
			}
		},
		[deleteGroup, sessionId],
	);

	// ---------------------------------------------------------------------------
	// Action buttons — vary by session status
	// ---------------------------------------------------------------------------

	function renderActionButtons() {
		if (!session) return null;

		const anyPending =
			startSession.isPending ||
			pauseSession.isPending ||
			resumeSession.isPending ||
			completeSession.isPending;

		if (session.status === "Draft") {
			return (
				<Button
					color="primary"
					size="sm"
					leftIcon={<Play size={14} />}
					onClick={handleStart}
					disabled={!canStart || anyPending}
					loading={startSession.isPending}
				>
					Start Session
				</Button>
			);
		}

		if (session.status === "Running") {
			return (
				<>
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
					<Button
						variant="outline"
						color="primary"
						size="sm"
						leftIcon={<Square size={14} />}
						onClick={handleComplete}
						disabled={anyPending}
						loading={completeSession.isPending}
					>
						Complete
					</Button>
				</>
			);
		}

		if (session.status === "Paused") {
			return (
				<>
					<Button
						color="primary"
						size="sm"
						leftIcon={<Play size={14} />}
						onClick={handleResume}
						disabled={anyPending}
						loading={resumeSession.isPending}
					>
						Resume
					</Button>
					<Button
						variant="outline"
						size="sm"
						leftIcon={<Square size={14} />}
						onClick={handleComplete}
						disabled={anyPending}
						loading={completeSession.isPending}
					>
						Complete
					</Button>
				</>
			);
		}

		// Completed — no action buttons
		return null;
	}

	// ---------------------------------------------------------------------------
	// Render
	// ---------------------------------------------------------------------------

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.back()}
						className="h-8 w-8 p-0 shrink-0"
						aria-label="Go back"
					>
						<ArrowLeft size={16} />
					</Button>
					<div className="min-w-0">
						<h1 className="text-xl font-bold text-white leading-tight">Evaluation Session</h1>
						{event && (
							<p className="text-sm text-muted truncate">{event.name}</p>
						)}
					</div>
					{session && <StatusBadge status={session.status} />}
				</div>

				{session && (
					<div className="flex items-center gap-2 pl-11 sm:pl-0">
						{renderActionButtons()}
					</div>
				)}
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className="flex items-center justify-center py-16">
					<span className="loading loading-spinner loading-lg text-accent" />
				</div>
			)}

			{/* No session — prompt to create */}
			{!session && !isLoading && (
				<div className="bg-surface border border-border rounded-2xl py-16 px-4 flex flex-col items-center text-center gap-4">
					<div className="w-16 h-16 rounded-full bg-hover flex items-center justify-center text-muted">
						<ClipboardList size={32} />
					</div>
					<div>
						<h3 className="text-lg font-bold text-white mb-1">No evaluation session</h3>
						<p className="text-sm text-muted max-w-xs">
							Create an evaluation session to start assessing players at this event.
						</p>
					</div>
					<Button
						color="primary"
						onClick={handleCreateSession}
						loading={createSession.isPending}
						disabled={!event || !event.contextId}
					>
						Create Session
					</Button>
				</div>
			)}

			{/* Main content — shown only when session exists */}
			{session && (
				<>
					{/* ------------------------------------------------------------------ */}
					{/* Section 1: Evaluation Plan                                          */}
					{/* ------------------------------------------------------------------ */}
					<CollapsibleSection label="Evaluation Plan" defaultOpen={true}>
						{session.evaluationPlan ? (
							<div className="space-y-3">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<h3 className="font-semibold text-white truncate">
											{session.evaluationPlan.name ?? "Unnamed Plan"}
										</h3>
										<p className="text-sm text-muted">
											{session.evaluationPlan.items.length}{" "}
											{session.evaluationPlan.items.length === 1 ? "exercise" : "exercises"}
										</p>
									</div>
									{isEditable && (
										<Button variant="outline" size="sm" className="shrink-0">
											Change Plan
										</Button>
									)}
								</div>

								{session.evaluationPlan.items.length > 0 && (
									<div className="space-y-2">
										{session.evaluationPlan.items
											.slice()
											.sort((a, b) => a.order - b.order)
											.map((item, i) => (
												<div
													key={item.id}
													className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border"
												>
													<span className="w-6 h-6 shrink-0 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
														{i + 1}
													</span>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-white truncate">
															{item.exercise.name}
														</p>
														<p className="text-xs text-muted">
															{item.exercise.metrics.length}{" "}
															{item.exercise.metrics.length === 1 ? "metric" : "metrics"}
														</p>
													</div>
												</div>
											))}
									</div>
								)}
							</div>
						) : (
							<div className="text-center py-6">
								<ClipboardList className="w-8 h-8 text-muted mx-auto mb-2" />
								<p className="text-sm text-muted mb-3">No evaluation plan selected</p>
								{isEditable && (
									<Button variant="outline" size="sm">
										Select Plan
									</Button>
								)}
							</div>
						)}
					</CollapsibleSection>

					{/* ------------------------------------------------------------------ */}
					{/* Section 2: Groups                                                   */}
					{/* ------------------------------------------------------------------ */}
					<CollapsibleSection
						label={`Groups (${session.groups.length})`}
						defaultOpen={true}
					>
						{/* Auto-split controls — Draft only */}
						{isEditable && (
							<div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg bg-surface/50 border border-border">
								<Shuffle size={16} className="text-muted shrink-0" />
								<span className="text-sm text-white">Auto-split into</span>
								<Input
									type="number"
									min={1}
									max={10}
									value={numberOfGroups}
									onChange={(e) => {
										const parsed = parseInt(e.target.value, 10);
										setNumberOfGroups(isNaN(parsed) ? 2 : Math.min(10, Math.max(1, parsed)));
									}}
									className="w-16 text-center"
									aria-label="Number of groups"
								/>
								<span className="text-sm text-white">groups</span>
								<Button
									variant="outline"
									size="sm"
									onClick={handleAutoSplit}
									loading={autoSplitGroups.isPending}
									disabled={autoSplitGroups.isPending || session.participants.length === 0}
								>
									{autoSplitGroups.isPending ? "Splitting..." : "Split"}
								</Button>
							</div>
						)}

						{/* Group cards grid */}
						{session.groups.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{session.groups
									.slice()
									.sort((a, b) => a.order - b.order)
									.map((group) => (
										<GroupCard
											key={group.id}
											group={group}
											participants={session.participants}
											isDraft={isDraft}
											onDeleteGroup={handleDeleteGroup}
										/>
									))}
							</div>
						) : (
							<div className="text-center py-6">
								<Users className="w-8 h-8 text-muted mx-auto mb-2" />
								<p className="text-sm text-muted mb-3">No groups created yet</p>
								{isEditable && (
									<Button
										variant="outline"
										size="sm"
										leftIcon={<Plus size={14} />}
										onClick={handleCreateGroup}
										loading={createGroup.isPending}
									>
										Add Group
									</Button>
								)}
							</div>
						)}

						{/* Unassigned players warning */}
						{unassignedPlayers.length > 0 && (
							<div className="mt-4 p-3 rounded-lg border border-warning/30 bg-warning/5">
								<div className="flex items-center gap-2 mb-2">
									<AlertTriangle size={14} className="text-warning shrink-0" />
									<span className="text-sm font-medium text-warning">
										{unassignedPlayers.length}{" "}
										{unassignedPlayers.length === 1 ? "player" : "players"} not assigned to a group
									</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{unassignedPlayers.map((p) => (
										<div
											key={p.id}
											className="flex items-center gap-2 px-2 py-1 rounded-md bg-surface border border-border"
										>
											<Avatar
												name={p.playerName ?? "?"}
												src={p.avatarUrl ?? undefined}
												size="xs"
											/>
											<span className="text-xs text-white">{p.playerName ?? "Unknown"}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Add group button — shown at bottom when groups already exist */}
						{isEditable && session.groups.length > 0 && (
							<Button
								variant="ghost"
								size="sm"
								leftIcon={<Plus size={14} />}
								onClick={handleCreateGroup}
								loading={createGroup.isPending}
								className="mt-3"
							>
								Add Group
							</Button>
						)}
					</CollapsibleSection>

					{/* ------------------------------------------------------------------ */}
					{/* Section 3: Evaluator Assignment                                     */}
					{/* ------------------------------------------------------------------ */}
					<CollapsibleSection label="Evaluator Assignment" defaultOpen={true}>
						{session.groups.length > 0 ? (
							<div className="space-y-3">
								{session.groups
									.slice()
									.sort((a, b) => a.order - b.order)
									.map((group) => (
										<div
											key={group.id}
											className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface border border-border"
										>
											<div className="flex items-center gap-3 min-w-0">
												<div className="w-8 h-8 shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
													<UserCheck size={14} className="text-accent" />
												</div>
												<div className="min-w-0">
													<p className="text-sm font-medium text-white truncate">{group.name}</p>
													<p className="text-xs text-muted">
														{group.players.length}{" "}
														{group.players.length === 1 ? "player" : "players"}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2 shrink-0">
												{group.evaluatorUserId ? (
													<Badge size="sm" color="success" variant="soft">
														Assigned
													</Badge>
												) : (
													<Badge size="sm" color="warning" variant="soft">
														No evaluator
													</Badge>
												)}
												{isEditable && (
													<Button variant="outline" size="sm">
														{group.evaluatorUserId ? "Change" : "Assign"}
													</Button>
												)}
											</div>
										</div>
									))}
							</div>
						) : (
							<div className="text-center py-6">
								<UserCheck className="w-8 h-8 text-muted mx-auto mb-2" />
								<p className="text-sm text-muted">Create groups first to assign evaluators</p>
							</div>
						)}
					</CollapsibleSection>
				</>
			)}
		</div>
	);
}
