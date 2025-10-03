import { Avatar, Button, Loader } from "@/components/ui";
import { useWaitlist } from "@/hooks/useWaitlist";
import { Position } from "@/lib/models/Position";
import { Team } from "@/lib/models/Team";
import Link from "next/link";
import { FaTimes as CancelIcon } from "react-icons/fa";

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
    shouldLoad
  );

  return (
    <div>
      <div className="py-4 w-full flex items-center justify-between border-b h-16 border-neutral/20 mb-4">
        <span className="text-lg">Waitlist</span>

        {position.eventParticipant?.userProfile?.userId !== userId &&
          (!waitlist || !waitlist.find((u) => u.userId === userId)) && (
            <Button size="sm" onClick={joinWaitlist}>
              Join waitlist
            </Button>
          )}
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full flex flex-col gap-2">
            {waitlist && waitlist.length > 0 ? (
              waitlist.map((waitlistEntry, i) => (
                <div
                  key={`waitlist-${position.id}-${waitlistEntry.userId}`}
                  className="flex w-full items-center justify-between gap-2"
                >
                  <Link
                    href={`/profiles/${waitlistEntry.userId}`}
                    className="flex gap-2 items-center z-50"
                  >
                    <span>{i + 1}.</span>
                    <Avatar profile={waitlistEntry.user} />
                    <Link
                      href={`/profiles/${waitlistEntry.userId}`}
                      className="hover:underline"
                    >
                      {waitlistEntry.user.name} {waitlistEntry.user.surname}
                    </Link>
                  </Link>
                  {userId === waitlistEntry.userId && (
                    <button className="link text-error" onClick={leaveWaitlist}>
                      <CancelIcon />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-center text-neutral/60">Waitlist is empty</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionWaitlist;
