import React from "react";
import Image from "next/image";
import { Shield, History } from "lucide-react";
import { HistoryDto, getClubRoleLabel, getVolleyballPositionLabel } from "@/lib/models/Profile";

interface ProfileHistoryProps {
    historyEntries?: HistoryDto[];
}

const ProfileHistory = ({ historyEntries }: ProfileHistoryProps) => {
    if (!historyEntries || historyEntries.length === 0) {
        return (
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted">
                    <History size={32} />
                </div>
                <div>
                    <span className="text-lg font-medium text-white block">No History</span>
                    <span className="text-sm text-muted">This user hasn't added any career history yet.</span>
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
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 md:p-8">
            <div className="relative pl-4 ml-2 border-l-2 border-white/10 space-y-8 py-2">
                {sortedYears.map((year, idx) => (
                    <div key={year} className="relative animate-in fade-in slide-in-from-left-4">
                        {/* Dot on line */}
                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-[#141414]" />

                        <div className="flex flex-col gap-4">
                            <span className="text-accent font-bold text-lg leading-none">{year}</span>

                            <div className="flex flex-col gap-4 ml-1">
                                {groupedByYear[year].map((entry) => (
                                    <div key={entry.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
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
                                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-muted flex-shrink-0">
                                                    <Shield size={20} />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-white font-semibold">{entry.clubName}</span>
                                                    {entry.teamName && (
                                                        <span className="text-muted text-sm">- {entry.teamName}</span>
                                                    )}
                                                </div>
                                                <div className="mt-1">
                                                    <span className="text-accent text-sm font-medium">
                                                        {getClubRoleLabel(entry.role)}
                                                    </span>
                                                </div>
                                                {entry.positions && entry.positions.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {entry.positions.map((pos, posIdx) => (
                                                            <span
                                                                key={posIdx}
                                                                className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/80"
                                                            >
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
