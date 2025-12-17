"use client";

import { Avatar, Loader } from "@/components/ui";
import { useWaitlist } from "@/hooks/useWaitlist";
import { Position } from "@/lib/models/Position";
import { Team } from "@/lib/models/Team";
import Link from "next/link";
import { X, Clock, UserPlus } from "lucide-react";

type PositionWaitlistProps = {
	position: Position;
	userId: string;
	team: Team;
	shouldLoad?: boolean;
};

const PositionWaitlist = ({
	userId,
	position,
	shouldLoad = true,
}: PositionWaitlistProps) => {
	const { waitlist, isLoading, joinWaitlist, leaveWaitlist } = useWaitlist(
		position.id,
		shouldLoad,
	);

    const isOnWaitlist = waitlist?.find((u) => u.userId === userId);
    const isOccupant = position.eventParticipant?.userProfile?.userId === userId;

	return (
		<div className="bg-white/5 rounded-xl p-3 border border-white/5 mt-2">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Clock size={14} className="text-accent" />
                    <span>Waitlist</span>
                    {waitlist && waitlist.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs text-muted">
                            {waitlist.length}
                        </span>
                    )}
                </div>

				{!isOccupant && !isOnWaitlist && (
                    <button 
                        onClick={joinWaitlist}
                        className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-white transition-colors"
                    >
                        <UserPlus size={14} /> Join
                    </button>
				)}
			</div>

			{isLoading ? (
				<div className="flex justify-center py-4">
                    <Loader className="w-5 h-5 opacity-50" />
                </div>
			) : (
				<div className="flex flex-col gap-2">
					{waitlist && waitlist.length > 0 ? (
						waitlist.map((waitlistEntry, i) => (
							<div
								key={`waitlist-${position.id}-${waitlistEntry.userId}`}
								className="flex w-full items-center justify-between gap-3 p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors group"
							>
								<div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs font-mono text-muted/50 w-4 text-center">{i + 1}</span>
									<Link
										href={`/profiles/${waitlistEntry.userId}`}
										className="flex gap-2 items-center"
									>
										<Avatar profile={waitlistEntry.user} className="w-6 h-6 border border-white/10" />
										<span className="text-sm text-gray-300 hover:text-white hover:underline truncate">
											{waitlistEntry.user.name} {waitlistEntry.user.surname}
										</span>
									</Link>
								</div>
                                
								{userId === waitlistEntry.userId && (
									<button 
                                        className="p-1 text-muted hover:text-error hover:bg-red-500/10 rounded transition-colors" 
                                        onClick={leaveWaitlist}
                                        title="Leave waitlist"
                                    >
										<X size={14} />
									</button>
								)}
							</div>
						))
					) : (
						<div className="text-center py-3 text-muted text-xs italic">
							No one is waiting for this spot yet.
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default PositionWaitlist;