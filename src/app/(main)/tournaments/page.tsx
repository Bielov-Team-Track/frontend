"use client";

import { Badge, Button, EmptyState, Input } from "@/components";
import { Card, CardContent } from "@/components/ui/card";
import { useTournaments } from "@/hooks/useTournaments";
import { Tournament, TournamentStatus } from "@/lib/models/Tournament";
import { useAuth } from "@/providers/AuthProvider";
import {
	Calendar,
	Plus,
	Search,
	Trophy,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import CreateTournamentModal from "@/components/features/tournaments/CreateTournamentModal";

const STATUS_CONFIG: Record<TournamentStatus, { color: "neutral" | "info" | "success" | "warning" | "error"; label: string }> = {
	[TournamentStatus.Draft]: { color: "neutral", label: "Draft" },
	[TournamentStatus.Registration]: { color: "info", label: "Registration Open" },
	[TournamentStatus.InProgress]: { color: "warning", label: "In Progress" },
	[TournamentStatus.Completed]: { color: "success", label: "Completed" },
	[TournamentStatus.Cancelled]: { color: "error", label: "Cancelled" },
};

function TournamentCard({ tournament }: { tournament: Tournament }) {
	const statusConfig = STATUS_CONFIG[tournament.status];

	const formattedDate = tournament.startDate
		? new Date(tournament.startDate).toLocaleDateString("en-GB", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: "TBD";

	return (
		<Link href={`/tournament/${tournament.id}`}>
			<Card className="hover:border-accent/40 transition-all cursor-pointer h-full">
				<CardContent className="p-5 flex flex-col gap-3 h-full">
					<div className="flex items-start justify-between gap-2">
						<h3 className="text-lg font-bold text-foreground line-clamp-2">
							{tournament.name}
						</h3>
						<Badge variant="soft" color={statusConfig.color} size="xs">
							{statusConfig.label}
						</Badge>
					</div>

					{tournament.description && (
						<p className="text-sm text-muted-foreground line-clamp-2">
							{tournament.description}
						</p>
					)}

					<div className="mt-auto flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
						<span className="flex items-center gap-1">
							<Calendar size={13} /> {formattedDate}
						</span>
						<span className="flex items-center gap-1">
							<Users size={13} /> {tournament.filledSlots}/{tournament.maxTeams} teams
						</span>
						{tournament.defaultScoringFormat && (
							<span className="flex items-center gap-1">
								<Trophy size={13} /> {tournament.defaultScoringFormat}
							</span>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

export default function TournamentsPage() {
	const { data: tournaments, isLoading, error } = useTournaments();
	const { isAuthenticated } = useAuth();
	const [search, setSearch] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);

	const filtered = useMemo(() => {
		if (!tournaments) return [];
		if (!search.trim()) return tournaments;
		const q = search.toLowerCase();
		return tournaments.filter(
			(t) =>
				t.name.toLowerCase().includes(q) ||
				t.description?.toLowerCase().includes(q)
		);
	}, [tournaments, search]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<span className="loading loading-spinner loading-lg text-primary"></span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="alert alert-error max-w-md">
					<span>Error loading tournaments. Please try again.</span>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-4 md:p-8 pb-20">
			{/* Header */}
			<div className="max-w-7xl mx-auto mb-10">
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
						<p className="text-muted-foreground text-sm mt-1">
							Compete, track standings, and climb the bracket.
						</p>
					</div>
					{isAuthenticated && (
						<Button
							onClick={() => setShowCreateModal(true)}
							leftIcon={<Plus size={16} />}
						>
							Create Tournament
						</Button>
					)}
				</div>

				{/* Search */}
				<div className="mb-6">
					<Input
						placeholder="Search tournaments..."
						leftIcon={<Search size={18} />}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			{/* Grid */}
			<div className="max-w-7xl mx-auto">
				{filtered.length === 0 ? (
					<EmptyState
						icon={Trophy}
						title="No tournaments found"
						description={
							search
								? "Try a different search term."
								: "Be the first to create a tournament."
						}
						action={
							isAuthenticated && !search
								? {
										label: "Create Tournament",
										onClick: () => setShowCreateModal(true),
										icon: Plus,
									}
								: undefined
						}
					/>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filtered.map((tournament) => (
							<TournamentCard key={tournament.id} tournament={tournament} />
						))}
					</div>
				)}
			</div>

			{/* Create Modal */}
			<CreateTournamentModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
			/>
		</div>
	);
}
