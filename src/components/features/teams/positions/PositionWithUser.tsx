import React from "react";
import { FiX as CancelIcon } from "react-icons/fi";
import Avatar from "@/components/ui/avatar";
import Loader from "@/components/ui/loader";
import { useWaitlist } from "@/hooks/useWaitlist";
import { Position as PositionModel } from "@/lib/models/Position";
import { Team } from "@/lib/models/Team";
import { useAuth } from "@/lib/auth/authContext";
import { Button } from "@/components/ui";
import { FaSignOutAlt as LeaveIcon } from "react-icons/fa";

type PositionWithUserProps = {
  position: PositionModel;
  userId: string;
  team: Team;
  onPositionLeave: (positionId: string) => void;
};

function PositionWithUser({
  position,
  userId,
  team,
  onPositionLeave,
}: PositionWithUserProps) {
  const { waitlist, isLoading, loadWaitlist, joinWaitlist, leaveWaitlist } =
    useWaitlist(position.id, userId);

  const { userProfile } = useAuth();

  const handleLeavePosition = () => {
    onPositionLeave(position.id);
  };

  const hideOtherWaitlists = (positionId: string) => {
    const checkboxes = document.querySelectorAll(
      `input[type="checkbox"][name="${team.id}"]`
    );
    checkboxes.forEach((checkbox) => {
      if ((checkbox as HTMLInputElement).id !== positionId) {
        (checkbox as HTMLInputElement).checked = false;
      }
    });
    if (!waitlist) {
      loadWaitlist();
    }
  };

  const isCaptain = team.captain?.userId === userProfile?.userId;
  const isAdmin = !!team.event.admins?.find(
    (a) => a.userId === userProfile?.userId
  );

  return (
    <div
      tabIndex={0}
      className="collapse collapse-arrow bg-primary/90 text-primary-content rounded-md"
      onFocus={() => hideOtherWaitlists(position.id)}
    >
      <input
        className="peer"
        id={position.id}
        type="checkbox"
        name={team?.id!}
      />
      <div className="collapse-title p-4 h-14 rounded-md bg-primary w-full flex justify-between">
        <div className="flex items-center gap-2">
          <Avatar profile={position.userProfile!} />
          <div className="flex flex-col">
            <span>
              {position.userProfile?.name} {position.userProfile?.surname}
            </span>
            <span className="text-neutral/60 text-xs">{position.name}</span>
          </div>
        </div>
        <span className="place-self-center self-center font-bold mr-6"></span>
      </div>
      <div className="collapse-content relative">
        <div className="flex justify-between items-center p-4">
          <Button
            size={"sm"}
            variant={"icon"}
            className="text-error"
            leftIcon={<LeaveIcon></LeaveIcon>}
            onClick={handleLeavePosition}
          >
            Leave
          </Button>
        </div>
        {isLoading && <Loader className="absolute inset-0 bg-black/55 z-50" />}
        {waitlist && (
          <>
            <div className="py-2 w-full text-lg">Waitlist</div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-full items-center flex flex-col gap-2">
                {waitlist && waitlist.length > 0 ? (
                  waitlist.map((user) => (
                    <div
                      key={`waitlist-${position.id}-${user.userId}`}
                      className="flex w-full items-center justify-between gap-2"
                    >
                      <div className="flex gap-2 items-center">
                        <Avatar profile={user} />
                        <span>{user.name}</span>
                      </div>
                      {userId === user.userId && (
                        <button
                          className="link text-error"
                          onClick={leaveWaitlist}
                        >
                          <CancelIcon />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm">Waitlist is empty</span>
                )}
              </div>
              {position.userProfile?.userId !== userId &&
                (!waitlist || !waitlist.find((u) => u.userId === userId)) && (
                  <button
                    className="btn btn-sm text-primary-content bg-primary border-none"
                    onClick={joinWaitlist}
                  >
                    Join waitlist
                  </button>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PositionWithUser;
