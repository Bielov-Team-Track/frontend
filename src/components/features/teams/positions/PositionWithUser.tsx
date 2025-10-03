"use client";

import Avatar from "@/components/ui/avatar";
import { Position as PositionModel } from "@/lib/models/Position";
import { Team } from "@/lib/models/Team";
import { Button } from "@/components/ui";
import {
  FaSignOutAlt as LeaveIcon,
  FaUserAlt as PersonIcon,
} from "react-icons/fa";
import Link from "next/link";
import { loadWaitlist } from "@/lib/requests/waitlist";
import { useState } from "react";
import PositionWaitlist from "./PositionWaitlist";

type PositionWithUserProps = {
  position: PositionModel;
  userId: string;
  team: Team;
  onPositionLeave?: (positionId: string) => void;
  open?: boolean;
  editable?: boolean;
};

function PositionWithUser({
  position,
  userId,
  team,
  onPositionLeave,
  open = false,
  editable = false,
}: PositionWithUserProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLeavePosition = () => {
    if (onPositionLeave) {
      onPositionLeave(position.id);
      loadWaitlist(position.id);
    }
  };

  const collapseOtherPositions = (positionId: string) => {
    const checkboxes = document.querySelectorAll(
      `input[type="checkbox"][name="${team.id}"]`
    );
    checkboxes.forEach((checkbox) => {
      if ((checkbox as HTMLInputElement).id !== positionId) {
        (checkbox as HTMLInputElement).checked = false;
      }
    });
  };

  const collapsable =
    open ||
    editable ||
    position.eventParticipant?.userProfile?.userId === userId;

  if (!collapsable) {
    return (
      <div className="p-4 h-14 rounded-md bg-primary w-full flex justify-between items-center">
        <Link
          href={`/profiles/${position.eventParticipant?.userProfile!.userId}`}
          className="flex gap-2 items-center z-50"
        >
          <Avatar profile={position.eventParticipant?.userProfile!} />
          <div className="flex flex-col">
            <span className="whitespace-nowrap font-bold text-sm  hover:underline">
              {position.eventParticipant?.userProfile?.name}{" "}
              {position.eventParticipant?.userProfile?.surname}
            </span>
            <span className="text-neutral/60 text-xs">{position.name}</span>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="collapse collapse-arrow bg-primary/30 text-primary-content rounded-md">
      <input
        id={position.id}
        type="checkbox"
        name={team?.id!}
        checked={isExpanded}
        onChange={(e) => {
          setIsExpanded(e.target.checked);
          collapseOtherPositions(position.id);
        }}
      />
      <div className="collapse-title p-4 h-14 rounded-md bg-primary w-full flex justify-between items-center">
        <Link
          href={`/profiles/${position.eventParticipant?.userProfile!.userId}`}
          className="flex gap-2 items-center z-50"
        >
          <Avatar profile={position.eventParticipant?.userProfile!} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="whitespace-nowrap font-bold text-sm hover:underline">
                {position.eventParticipant?.userProfile?.name}{" "}
                {position.eventParticipant?.userProfile?.surname}
              </span>
              {team.captain?.userId ===
                position.eventParticipant?.userProfile?.userId && (
                <span className="text-sm pb-1"> 👑</span>
              )}
            </div>
            <span className="text-neutral/60 text-xs">{position.name}</span>
          </div>
        </Link>
      </div>
      <div className="collapse-content relative">
        {(position.eventParticipant?.userProfile?.userId === userId ||
          editable) && (
          <div className="flex justify-end pt-4">
            <Button
              fullWidth={true}
              variant="solid"
              color="secondary"
              leftIcon={<LeaveIcon />}
              className="text-error !min-h-0"
              onClick={(e) => {
                e.stopPropagation();
                handleLeavePosition();
              }}
            >
              Free position
            </Button>
          </div>
        )}
        {open && (
          <PositionWaitlist
            position={position}
            team={team}
            userId={userId}
            shouldLoad={isExpanded}
          />
        )}
      </div>
    </div>
  );
}

export default PositionWithUser;
