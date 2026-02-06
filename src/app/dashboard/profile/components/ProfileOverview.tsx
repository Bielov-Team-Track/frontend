import React from "react";
import { Trophy, Medal, Star, Flame } from "lucide-react";
import { BadgeDisplay, type BadgeType } from "@/components/features/feedback/BadgeDisplay";
import Link from "next/link";

interface ProfileOverviewProps {
    badges?: BadgeType[]; // Array of badge types
    stats?: any;    // Replace with proper type
}

const ProfileOverview = ({ badges = [], stats }: ProfileOverviewProps) => {
    // Show only the first 6 badges
    const displayBadges = badges.slice(0, 6);
    const hasMoreBadges = badges.length > 6;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-muted mb-2">
                        <Flame size={20} className="text-orange-500" />
                        <span className="font-medium text-sm">Matches Played</span>
                    </div>
                    <span className="text-3xl font-bold text-foreground">{stats?.gamesPlayed || 0}</span>
                </div>
                 <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-muted mb-2">
                        <Trophy size={20} className="text-yellow-500" />
                        <span className="font-medium text-sm">Tournaments Won</span>
                    </div>
                    <span className="text-3xl font-bold text-foreground">{stats?.tournamentsWon || 0}</span>
                </div>
                 <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-muted mb-2">
                        <Star size={20} className="text-purple-500" />
                        <span className="font-medium text-sm">MVP Awards</span>
                    </div>
                    <span className="text-3xl font-bold text-foreground">{stats?.mvpAwards || 0}</span>
                </div>
                 <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-muted mb-2">
                        <Medal size={20} className="text-blue-500" />
                        <span className="font-medium text-sm">Years Active</span>
                    </div>
                    <span className="text-3xl font-bold text-foreground">{stats?.yearsActive || 0}</span>
                </div>
            </div>

            {/* Badges / Achievements */}
            <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Medal size={18} className="text-accent" />
                        Achievements
                    </h3>
                    {badges.length > 0 && (
                        <Link
                            href="/dashboard/badges"
                            className="text-xs text-accent hover:underline"
                        >
                            View All
                        </Link>
                    )}
                </div>

                {displayBadges.length > 0 ? (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            {displayBadges.map((badgeType, index) => (
                                <div key={index} className="flex justify-center">
                                    <BadgeDisplay badgeType={badgeType} size="md" />
                                </div>
                            ))}
                        </div>
                        {hasMoreBadges && (
                            <div className="mt-4 text-center">
                                <Link
                                    href="/dashboard/badges"
                                    className="text-sm text-muted hover:text-accent transition-colors"
                                >
                                    +{badges.length - 6} more badges
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-muted text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center opacity-50">
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
