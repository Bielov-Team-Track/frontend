import React from "react";
import { Clock, Award, ClipboardList, TrendingUp } from "lucide-react";
import { CoachProfileDto, getSkillLevelLabel } from "@/lib/models/Profile";

interface CoachStatsProps {
    coachProfile?: CoachProfileDto;
}

const CoachStats = ({ coachProfile }: CoachStatsProps) => {
    if (!coachProfile) {
         return (
             <div className="bg-[#141414] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted">
                    <ClipboardList size={32} />
                </div>
                <div>
                    <span className="text-lg font-medium text-white block">No Coach Profile</span>
                    <span className="text-sm text-muted">This user hasn't set up their coach profile yet.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Experience Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <span className="text-sm text-muted block">Experience</span>
                        <span className="text-xl font-bold text-white">
                            {coachProfile.yearsOfExperience ? `${coachProfile.yearsOfExperience} Years` : "Not specified"}
                        </span>
                    </div>
                </div>

                <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <span className="text-sm text-muted block">Highest Level Coached</span>
                        <span className="text-xl font-bold text-white">
                            {getSkillLevelLabel(coachProfile.highestLevelCoached)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Qualifications */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Award size={20} className="text-accent" />
                    Qualifications & Certifications
                </h3>

                {coachProfile.qualifications && coachProfile.qualifications.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {coachProfile.qualifications.map((qual) => (
                            <div key={qual.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                        <Award size={16} />
                                    </div>
                                    <span className="text-white font-medium">{qual.name}</span>
                                </div>
                                {qual.year > 0 && (
                                    <span className="text-muted text-sm">{qual.year}</span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted italic py-4">No qualifications listed</div>
                )}
            </div>
        </div>
    );
};

export default CoachStats;
