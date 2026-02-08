import { HistoryDto, getClubRoleLabel, getVolleyballPositionLabel } from "@/lib/models/Profile";
import { History, Shield } from "lucide-react";
import Image from "next/image";

interface ProfileHistoryProps {
	historyEntries?: HistoryDto[];
}

const ProfileHistory = ({ historyEntries }: ProfileHistoryProps) => {
	if (!historyEntries || historyEntries.length === 0) {
		return (
			<div className="rounded-2xl p-12 text-center flex flex-col items-center gap-4">
				<div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-muted">
					<History size={32} />
				</div>
				<div>
					<span className="text-lg font-medium text-foreground block">No History</span>
					<span className="text-sm text-muted">This user hasn&apos;t added any history yet.</span>
				</div>
			</div>
		);
	}

	// Group history entries by year for timeline display
	const groupedByYear = historyEntries.reduce((acc, entry) => {
		const year = entry.year.toString();
		if (!acc[year]) {
			acc[year] = [];
		}
		acc[year].push(entry);
		return acc;
	}, {} as Record<string, HistoryDto[]>);

	// Sort years in descending order
	const sortedYears = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

	return (
		<div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
			<div className="relative pl-4 ml-2 border-l-2 border-border space-y-8 py-2">
				{sortedYears.map((year, idx) => (
					<div key={year} className="relative animate-in fade-in slide-in-from-left-4">
						{/* Dot on line */}
						<div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-surface" />

						<div className="flex flex-col gap-4">
							<span className="text-accent font-bold text-lg leading-none">{year}</span>

							<div className="flex flex-col gap-4 ml-1">
								{groupedByYear[year].map((entry) => (
									<div key={entry.id} className="bg-surface p-4 rounded-xl border border-border">
										<div className="flex items-start gap-3">
											{entry.clubLogoUrl ? (
												<Image
													src={entry.clubLogoUrl}
													alt={entry.clubName}
													width={40}
													height={40}
													className="rounded-lg object-cover"
												/>
											) : (
												<div className="w-10 h-10 rounded-lg bg-hover flex items-center justify-center text-muted shrink-0">
													<Shield size={20} />
												</div>
											)}
											<div className="flex-1">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="text-foreground font-semibold">{entry.clubName}</span>
													{entry.teamName && <span className="text-muted text-sm">- {entry.teamName}</span>}
												</div>
												<div className="mt-1">
													<span className="text-accent text-sm font-medium">{getClubRoleLabel(entry.role)}</span>
												</div>
												{entry.positions && entry.positions.length > 0 && (
													<div className="flex flex-wrap gap-1.5 mt-2">
														{entry.positions.map((pos, posIdx) => (
															<span key={posIdx} className="px-2 py-0.5 bg-hover rounded text-xs text-white/80">
																{getVolleyballPositionLabel(pos)}
															</span>
														))}
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProfileHistory;
