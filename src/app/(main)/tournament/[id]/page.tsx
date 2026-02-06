"use client";

import { Badge, EmptyState } from "@/components";
import {
	useTournament,
	useTournamentMatches,
	useTournamentSlots,
	useStartTournament,
	useCompleteTournament,
	useCancelTournament,
} from "@/hooks/useTournaments";
import {
	TournamentStatus,
	TournamentMatch,
	TournamentTeam,
} from "@/lib/models/Tournament";
import { useAuth } from "@/providers/AuthProvider";
import {
	Calendar,
	Edit3,
	PlayCircle,
	Settings,
	Trophy,
	Users,
} from "lucide-react";
import { use, useState } from "react";

type ViewMode = "overview" | "groups" | "bracket" | "matches" | "teams";

const STATUS_BADGE: Record<TournamentStatus, { color: "neutral" | "info" | "success" | "warning" | "error"; label: string }> = {
	[TournamentStatus.Draft]: { color: "neutral", label: "Draft" },
	[TournamentStatus.Registration]: { color: "info", label: "Registration" },
	[TournamentStatus.InProgress]: { color: "warning", label: "Live" },
	[TournamentStatus.Completed]: { color: "success", label: "Completed" },
	[TournamentStatus.Cancelled]: { color: "error", label: "Cancelled" },
};

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { userProfile } = useAuth();
	const { data: tournament, isLoading, error } = useTournament(id);
	const { data: matches } = useTournamentMatches(id);
	const { data: slots } = useTournamentSlots(id);

	const [activeTab, setActiveTab] = useState<ViewMode>("overview");

	const startTournament = useStartTournament();
	const completeTournament = useCompleteTournament();
	const cancelTournament = useCancelTournament();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<span className="loading loading-spinner loading-lg text-primary"></span>
			</div>
		);
	}

	if (error || !tournament) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="alert alert-error max-w-md">
					<span>Tournament not found.</span>
				</div>
			</div>
		);
	}

	const isOrganizer = userProfile?.id === tournament.organizerId;
	const statusBadge = STATUS_BADGE[tournament.status];

	const formattedDateRange = (() => {
		const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
		const start = tournament.startDate
			? new Date(tournament.startDate).toLocaleDateString("en-GB", opts)
			: null;
		const end = tournament.endDate
			? new Date(tournament.endDate).toLocaleDateString("en-GB", { ...opts, year: "numeric" })
			: null;
		if (start && end) return `${start} - ${end}`;
		if (start) return start;
		return "TBD";
	})();

	const hasGroupStage = tournament.stages?.some((s) => s.type === "Group");
	const hasEliminationStage = tournament.stages?.some(
		(s) => s.type === "SingleElimination" || s.type === "DoubleElimination"
	);

	const tabs: ViewMode[] = ["overview"];
	if (hasGroupStage) tabs.push("groups");
	if (hasEliminationStage) tabs.push("bracket");
	tabs.push("matches", "teams");

	return (
		<div className="min-h-screen bg-base-100 text-foreground font-sans pb-20">
			{/* Organizer Toolbar */}
			{isOrganizer && (
				<div className="bg-accent/10 border-b border-accent/20 px-4 py-2 flex items-center justify-between">
					<div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
						<Settings size={14} /> Organizer Mode
					</div>
					<div className="flex gap-3">
						{tournament.status === TournamentStatus.Draft && (
							<button
								onClick={() => startTournament.mutate(tournament.id)}
								className="text-xs bg-accent text-white px-3 py-1 rounded hover:bg-accent/90"
								disabled={startTournament.isPending}
							>
								Start Tournament
							</button>
						)}
						{tournament.status === TournamentStatus.InProgress && (
							<button
								onClick={() => completeTournament.mutate(tournament.id)}
								className="text-xs bg-success text-white px-3 py-1 rounded hover:bg-success/90"
								disabled={completeTournament.isPending}
							>
								Complete
							</button>
						)}
						{tournament.status !== TournamentStatus.Completed &&
							tournament.status !== TournamentStatus.Cancelled && (
								<button
									onClick={() => cancelTournament.mutate(tournament.id)}
									className="text-xs text-error hover:text-error/80 font-medium"
									disabled={cancelTournament.isPending}
								>
									Cancel
								</button>
							)}
					</div>
				</div>
			)}

			{/* Hero Section */}
			<div className="relative bg-surface border-b border-border pt-8 pb-0">
				<div className="max-w-desktop mx-auto px-4 md:px-8">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<Badge variant="soft" color={statusBadge.color} size="sm">
									{statusBadge.label}
								</Badge>
								{tournament.defaultScoringFormat && (
									<span className="text-muted-foreground text-sm font-medium">
										{tournament.defaultScoringFormat}
									</span>
								)}
							</div>
							<h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
								{tournament.name}
							</h1>
							<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
								<span className="flex items-center gap-1">
									<Calendar size={14} /> {formattedDateRange}
								</span>
								<span className="flex items-center gap-1">
									<Users size={14} /> {tournament.filledSlots}/{tournament.maxTeams} Teams
								</span>
							</div>
						</div>

						<div className="flex gap-3 w-full md:w-auto">
							<button className="flex-1 md:flex-none btn bg-surface hover:bg-hover text-foreground border border-border gap-2">
								<Trophy size={18} /> Rules
							</button>
						</div>
					</div>

					{/* Navigation Tabs */}
					<div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar">
						{tabs.map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`
									pb-4 text-sm font-bold capitalize relative whitespace-nowrap transition-colors
									${activeTab === tab ? "text-accent" : "text-muted-foreground hover:text-foreground"}
								`}
							>
								{tab}
								{activeTab === tab && (
									<span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
								)}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-desktop mx-auto px-4 md:px-8 mt-8">
				{activeTab === "overview" && (
					<OverviewTab tournament={tournament} />
				)}
				{activeTab === "groups" && (
					<GroupsTab teams={tournament.teams} stages={tournament.stages} />
				)}
				{activeTab === "bracket" && (
					<BracketTab matches={matches || []} isOrganizer={isOrganizer} />
				)}
				{activeTab === "matches" && (
					<MatchesTab matches={matches || []} />
				)}
				{activeTab === "teams" && (
					<TeamsTab
						tournament={tournament}
						slots={slots || []}
						isOrganizer={isOrganizer}
					/>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({ tournament }: { tournament: any }) {
	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-2xl">
			{tournament.description && (
				<div className="bg-surface-elevated rounded-2xl border border-border p-6">
					<h3 className="font-bold text-foreground mb-2">About</h3>
					<p className="text-sm text-muted-foreground whitespace-pre-wrap">
						{tournament.description}
					</p>
				</div>
			)}

			<div className="bg-surface-elevated rounded-2xl border border-border p-6">
				<h3 className="font-bold text-foreground mb-4">Tournament Details</h3>
				<dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
					<div>
						<dt className="text-muted-foreground">Status</dt>
						<dd className="font-medium text-foreground">{tournament.status}</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Teams</dt>
						<dd className="font-medium text-foreground">
							{tournament.filledSlots} / {tournament.maxTeams}
						</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Scoring</dt>
						<dd className="font-medium text-foreground">{tournament.defaultScoringFormat}</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Registration</dt>
						<dd className="font-medium text-foreground">{tournament.registrationStatus}</dd>
					</div>
					{tournament.registrationFee != null && (
						<div>
							<dt className="text-muted-foreground">Entry Fee</dt>
							<dd className="font-medium text-foreground">
								${tournament.registrationFee.toFixed(2)}
							</dd>
						</div>
					)}
					{tournament.registrationDeadline && (
						<div>
							<dt className="text-muted-foreground">Registration Deadline</dt>
							<dd className="font-medium text-foreground">
								{new Date(tournament.registrationDeadline).toLocaleDateString("en-GB", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</dd>
						</div>
					)}
				</dl>
			</div>

			{tournament.stages?.length > 0 && (
				<div className="bg-surface-elevated rounded-2xl border border-border p-6">
					<h3 className="font-bold text-foreground mb-4">Stages</h3>
					<div className="space-y-3">
						{tournament.stages.map((stage: any, i: number) => (
							<div key={stage.id} className="flex items-center gap-3 text-sm">
								<span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
									{i + 1}
								</span>
								<span className="font-medium text-foreground">{stage.type}</span>
								<Badge variant="soft" color="neutral" size="xs">
									{stage.status}
								</Badge>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// GROUPS TAB
// =============================================================================

function GroupsTab({ teams, stages }: { teams: TournamentTeam[]; stages: any[] }) {
	const groupStage = stages?.find((s) => s.type === "Group");
	if (!groupStage) {
		return (
			<EmptyState
				icon={Users}
				title="No group stage"
				description="This tournament doesn't have a group stage."
			/>
		);
	}

	// Group teams by their groupAssignment
	const groups: Record<string, TournamentTeam[]> = {};
	teams.forEach((team) => {
		const group = team.groupAssignment || "Unassigned";
		if (!groups[group]) groups[group] = [];
		groups[group].push(team);
	});

	const groupNames = Object.keys(groups).filter((g) => g !== "Unassigned").sort();
	if (groupNames.length === 0) {
		return (
			<EmptyState
				icon={Users}
				title="No groups assigned"
				description="Teams have not been assigned to groups yet."
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{groupNames.map((groupName) => (
				<div
					key={groupName}
					className="bg-surface-elevated rounded-2xl border border-border overflow-hidden"
				>
					<div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
						<h3 className="font-bold text-foreground">Group {groupName}</h3>
					</div>
					<div className="p-2">
						<table className="w-full text-sm">
							<thead>
								<tr className="text-muted-foreground border-b border-border">
									<th className="font-medium text-left py-2 pl-2">Team</th>
									<th className="font-medium text-center py-2 w-10">Seed</th>
									<th className="font-medium text-center py-2 w-14">Status</th>
								</tr>
							</thead>
							<tbody>
								{groups[groupName].map((team, index) => (
									<tr
										key={team.id}
										className="border-b border-border last:border-0 hover:bg-hover transition-colors"
									>
										<td className="py-3 pl-2 flex items-center gap-3">
											<span className="text-xs w-4 text-muted-foreground">
												{index + 1}
											</span>
											<span className="text-foreground font-medium">
												{team.displayName}
											</span>
										</td>
										<td className="text-center text-muted-foreground">
											{team.seed ?? "-"}
										</td>
										<td className="text-center">
											<Badge
												variant="soft"
												color={team.status === "Active" ? "success" : "error"}
												size="xs"
											>
												{team.status}
											</Badge>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			))}
		</div>
	);
}

// =============================================================================
// BRACKET TAB
// =============================================================================

function BracketTab({ matches, isOrganizer }: { matches: TournamentMatch[]; isOrganizer: boolean }) {
	if (matches.length === 0) {
		return (
			<EmptyState
				icon={Trophy}
				title="No bracket matches yet"
				description="Matches will appear here once the bracket is generated."
			/>
		);
	}

	// Group matches by bracket round
	const rounds: Record<number, TournamentMatch[]> = {};
	matches
		.filter((m) => m.bracketRound != null)
		.forEach((m) => {
			const round = m.bracketRound!;
			if (!rounds[round]) rounds[round] = [];
			rounds[round].push(m);
		});

	const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);
	const maxRound = Math.max(...roundNumbers);

	const getRoundLabel = (round: number) => {
		if (round === maxRound) return "Final";
		if (round === maxRound - 1) return "Semi-Finals";
		if (round === maxRound - 2) return "Quarter-Finals";
		return `Round ${round}`;
	};

	return (
		<div className="overflow-x-auto pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="min-w-[800px] flex justify-around gap-8">
				{roundNumbers.map((round) => (
					<div key={round} className="flex flex-col justify-around flex-1 gap-8">
						<div className="text-center text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">
							{getRoundLabel(round)}
						</div>
						{rounds[round]
							.sort((a, b) => (a.matchOrder ?? 0) - (b.matchOrder ?? 0))
							.map((match) => (
								<BracketMatchCard
									key={match.id}
									match={match}
									isOrganizer={isOrganizer}
									isFinal={round === maxRound}
								/>
							))}
					</div>
				))}
			</div>
		</div>
	);
}

function BracketMatchCard({
	match,
	isOrganizer,
	isFinal,
}: {
	match: TournamentMatch;
	isOrganizer: boolean;
	isFinal?: boolean;
}) {
	const isLive = match.score?.status === "InProgress";
	const homeScore = match.score?.finalHomeScore ?? null;
	const awayScore = match.score?.finalAwayScore ?? null;

	return (
		<div
			className={`
				relative bg-surface-elevated rounded-xl border transition-all group
				${isFinal ? "border-accent/30 shadow-[0_0_30px_rgba(249,115,22,0.1)] scale-110" : "border-border hover:border-border"}
			`}
		>
			{isOrganizer && (
				<button className="absolute -top-2 -right-2 bg-placeholder text-foreground p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
					<Edit3 size={12} />
				</button>
			)}

			{isLive && (
				<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded flex items-center gap-1">
					<span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> Live
				</div>
			)}

			<div className="w-64">
				{/* Home Team */}
				<div
					className={`
						flex justify-between items-center p-3 border-b border-border
						${homeScore != null && awayScore != null && homeScore > awayScore ? "bg-linear-to-r from-success/10 to-transparent" : ""}
					`}
				>
					<span className={`font-bold text-sm ${homeScore != null && awayScore != null && homeScore > awayScore ? "text-foreground" : "text-muted-foreground"}`}>
						{match.homeTeam?.displayName ?? "TBD"}
					</span>
					<span className={`font-mono font-bold ${homeScore != null && awayScore != null && homeScore > awayScore ? "text-accent" : "text-muted-foreground"}`}>
						{homeScore ?? "-"}
					</span>
				</div>

				{/* Away Team */}
				<div
					className={`
						flex justify-between items-center p-3
						${homeScore != null && awayScore != null && awayScore > homeScore ? "bg-linear-to-r from-success/10 to-transparent" : ""}
					`}
				>
					<span className={`font-bold text-sm ${homeScore != null && awayScore != null && awayScore > homeScore ? "text-foreground" : "text-muted-foreground"}`}>
						{match.awayTeam?.displayName ?? "TBD"}
					</span>
					<span className={`font-mono font-bold ${homeScore != null && awayScore != null && awayScore > homeScore ? "text-accent" : "text-muted-foreground"}`}>
						{awayScore ?? "-"}
					</span>
				</div>
			</div>

			{!isLive && (
				<div className="px-3 py-1 bg-black/20 text-center text-[10px] text-muted-foreground font-medium uppercase rounded-b-xl">
					{match.score?.status === "Completed" ? "Finished" : "Scheduled"}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// MATCHES TAB
// =============================================================================

function MatchesTab({ matches }: { matches: TournamentMatch[] }) {
	if (matches.length === 0) {
		return (
			<EmptyState
				icon={PlayCircle}
				title="No matches yet"
				description="Matches will appear here once stages are generated."
			/>
		);
	}

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3 max-w-2xl">
			{matches.map((match) => {
				const homeScore = match.score?.finalHomeScore;
				const awayScore = match.score?.finalAwayScore;
				const status = match.score?.status ?? "NotStarted";

				return (
					<div
						key={match.id}
						className="bg-surface-elevated rounded-xl border border-border p-4 flex items-center gap-4"
					>
						<div className="flex-1 text-right">
							<span className="font-medium text-sm text-foreground">
								{match.homeTeam?.displayName ?? "TBD"}
							</span>
						</div>
						<div className="flex items-center gap-2 min-w-[60px] justify-center">
							<span className="font-mono font-bold text-lg text-foreground">
								{homeScore ?? "-"}
							</span>
							<span className="text-muted-foreground text-xs">:</span>
							<span className="font-mono font-bold text-lg text-foreground">
								{awayScore ?? "-"}
							</span>
						</div>
						<div className="flex-1">
							<span className="font-medium text-sm text-foreground">
								{match.awayTeam?.displayName ?? "TBD"}
							</span>
						</div>
						<Badge
							variant="soft"
							color={
								status === "Completed"
									? "success"
									: status === "InProgress"
										? "warning"
										: "neutral"
							}
							size="xs"
						>
							{status === "NotStarted" ? "Scheduled" : status}
						</Badge>
					</div>
				);
			})}
		</div>
	);
}

// =============================================================================
// TEAMS TAB
// =============================================================================

function TeamsTab({
	tournament,
	slots,
	isOrganizer,
}: {
	tournament: any;
	slots: any[];
	isOrganizer: boolean;
}) {
	if (tournament.teams.length === 0 && slots.length === 0) {
		return (
			<EmptyState
				icon={Users}
				title="No teams yet"
				description="Teams will appear once they are assigned to slots."
			/>
		);
	}

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
			{/* Slot Grid */}
			{slots.length > 0 && (
				<div className="bg-surface-elevated rounded-2xl border border-border overflow-hidden">
					<div className="p-4 border-b border-border bg-surface/50">
						<h3 className="font-bold text-foreground">
							Slots ({tournament.filledSlots}/{tournament.maxTeams})
						</h3>
					</div>
					<div className="divide-y divide-border">
						{slots.map((slot) => (
							<div
								key={slot.id}
								className="flex items-center justify-between px-4 py-3 hover:bg-hover transition-colors"
							>
								<div className="flex items-center gap-3">
									<span className="w-6 h-6 rounded-full bg-surface text-xs font-bold flex items-center justify-center text-muted-foreground border border-border">
										{slot.slotNumber}
									</span>
									<span
										className={`text-sm font-medium ${
											slot.status === "Filled"
												? "text-foreground"
												: "text-muted-foreground italic"
										}`}
									>
										{slot.teamName || "Empty Slot"}
									</span>
								</div>
								<Badge
									variant="soft"
									color={
										slot.status === "Filled"
											? "success"
											: slot.status === "Invited"
												? "info"
												: "neutral"
									}
									size="xs"
								>
									{slot.status}
								</Badge>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Teams List */}
			{tournament.teams.length > 0 && slots.length === 0 && (
				<div className="bg-surface-elevated rounded-2xl border border-border overflow-hidden">
					<div className="p-4 border-b border-border bg-surface/50">
						<h3 className="font-bold text-foreground">
							Teams ({tournament.teams.length})
						</h3>
					</div>
					<div className="divide-y divide-border">
						{tournament.teams.map((team: TournamentTeam) => (
							<div
								key={team.id}
								className="flex items-center justify-between px-4 py-3 hover:bg-hover transition-colors"
							>
								<div className="flex items-center gap-3">
									<span className="text-sm font-medium text-foreground">
										{team.displayName}
									</span>
									{team.groupAssignment && (
										<Badge variant="soft" color="neutral" size="xs">
											Group {team.groupAssignment}
										</Badge>
									)}
								</div>
								<Badge
									variant="soft"
									color={team.status === "Active" ? "success" : "error"}
									size="xs"
								>
									{team.status}
								</Badge>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
