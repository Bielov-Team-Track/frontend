import React from "react";
import { Trophy, Medal, Star, Flame } from "lucide-react";

interface ProfileOverviewProps {
    badges?: any[]; // Replace with proper type
    stats?: any;    // Replace with proper type
}

const ProfileOverview = ({ badges = [], stats }: ProfileOverviewProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-muted mb-2">
                        <Flame size={20} className="text-orange-500" />
                        <span className="font-medium text-sm">Matches Played</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{stats?.gamesPlayed || 0}</span>
                </div>
                 <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-muted mb-2">
                        <Trophy size={20} className="text-yellow-500" />
                        <span className="font-medium text-sm">Tournaments Won</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{stats?.tournamentsWon || 0}</span>
                </div>
                 <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-muted mb-2">
                        <Star size={20} className="text-purple-500" />
                        <span className="font-medium text-sm">MVP Awards</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{stats?.mvpAwards || 0}</span>
                </div>
                 <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-muted mb-2">
                        <Medal size={20} className="text-blue-500" />
                        <span className="font-medium text-sm">Years Active</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{stats?.yearsActive || 0}</span>
                </div>
            </div>

            {/* Badges / Achievements */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Medal size={18} className="text-accent" />
                    Achievements
                </h3>
                
                {badges.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                        {badges.map((badge, index) => (
                            <div key={index} className="aspect-square rounded-xl bg-white/5 flex flex-col items-center justify-center gap-2 p-2 hover:bg-white/10 transition-colors cursor-pointer group" title={badge.name}>
                                <div className="text-2xl">{badge.icon || "🏆"}</div>
                                <span className="text-[10px] text-center text-muted group-hover:text-white truncate w-full">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-muted text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center opacity-50">
                            <Medal size={24} />
                        </div>
                        <span className="text-sm">No achievements yet</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileOverview;
