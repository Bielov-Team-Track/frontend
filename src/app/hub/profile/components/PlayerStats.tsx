import React from "react";
import { Ruler, ArrowUp, Crosshair, Zap, Activity, TrendingUp } from "lucide-react";
import { PlayerProfileDto, getDominantHandLabel, getVolleyballPositionLabel, getSkillLevelLabel } from "@/lib/models/Profile";

interface PlayerStatsProps {
    playerProfile?: PlayerProfileDto;
}

const PlayerStats = ({ playerProfile }: PlayerStatsProps) => {
    if (!playerProfile) {
        return (
             <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-muted">
                    <Activity size={32} />
                </div>
                <div>
                    <span className="text-lg font-medium text-foreground block">No Player Profile</span>
                    <span className="text-sm text-muted">This user hasn't set up their player profile yet.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Physical Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Ruler size={24} />
                    </div>
                    <div>
                        <span className="text-sm text-muted block">Height</span>
                        <span className="text-xl font-bold text-foreground">
                            {playerProfile.heightCm ? `${playerProfile.heightCm} cm` : "-"}
                        </span>
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <ArrowUp size={24} />
                    </div>
                    <div>
                        <span className="text-sm text-muted block">Vertical Jump</span>
                        <span className="text-xl font-bold text-foreground">
                            {playerProfile.verticalJumpCm ? `${playerProfile.verticalJumpCm} cm` : "-"}
                        </span>
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Zap size={24} />
                    </div>
                    <div>
                        <span className="text-sm text-muted block">Dominant Hand</span>
                        <span className="text-xl font-bold text-foreground">
                            {getDominantHandLabel(playerProfile.dominantHand)}
                        </span>
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <span className="text-sm text-muted block">Highest Level</span>
                        <span className="text-xl font-bold text-foreground">
                            {getSkillLevelLabel(playerProfile.highestLevelPlayed)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Positions */}
            <div className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Crosshair size={20} className="text-accent" />
                    Positions
                </h3>
                <div className="flex flex-wrap gap-2">
                    {playerProfile.preferredPosition !== undefined && (
                        <div className="px-4 py-2 bg-accent/20 border border-accent/30 rounded-lg text-accent font-medium">
                            {getVolleyballPositionLabel(playerProfile.preferredPosition)}
                            <span className="ml-2 text-xs opacity-70">(Preferred)</span>
                        </div>
                    )}
                    {playerProfile.secondaryPositions?.map((pos, idx) => (
                        <div key={idx} className="px-4 py-2 bg-surface border border-border rounded-lg text-foreground">
                            {getVolleyballPositionLabel(pos)}
                        </div>
                    ))}
                    {playerProfile.preferredPosition === undefined && (!playerProfile.secondaryPositions || playerProfile.secondaryPositions.length === 0) && (
                        <span className="text-muted italic">No positions listed</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerStats;
