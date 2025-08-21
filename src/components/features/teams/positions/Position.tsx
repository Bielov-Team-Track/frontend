"use client";

import React, { useState } from "react";
import { FiPlus as PlusIcon } from "react-icons/fi";
import { Loader } from "@/components/ui";
import { usePosition } from "@/hooks/usePosition";
import { useAuth } from "@/lib/auth/authContext";
import PositionWithUser from "./PositionWithUser";
import { Position as PositionModel } from "@/lib/models/Position";
import { Team } from "@/lib/models/Team";
import { Modal } from "@/components/ui";
import { UserSearch } from "@/components/features/users";

type PositionProps = {
  position: PositionModel;
  team: Team;
  isCaptain: boolean;
};

function Position({ position: defaultPosition, team }: PositionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userProfile } = useAuth();
  const {
    position,
    isLoading,
    isConfirming,
    confirmPosition,
    cancel,
    assignPosition,
    takePosition,
    leavePosition,
  } = usePosition(defaultPosition, userProfile);

  return (
    <div className="relative cursor-pointer">
      {isLoading && (
        <Loader className="absolute inset-0 bg-black/55 rounded-md z-50" />
      )}
      {position.userProfile ? (
        <PositionWithUser
          onPositionLeave={leavePosition}
          position={position}
          userId={userProfile?.userId!}
          team={team}
        />
      ) : (
        <div
          className="p-4 h-14 rounded-md bg-black/20 w-full flex justify-between items-center"
          onClick={() => !isConfirming && confirmPosition()}
        >
          <span className="text-neutral/40 text-sm">{position.name}</span>
          {isConfirming ? (
            <div className="flex justify-between gap-2">
              <button className="text-error z-40" onClick={cancel}>
                Cancel
              </button>
              <button className="text-success" onClick={takePosition}>
                Take position
              </button>
              {team.captain && team.captain.userId === userProfile?.userId && (
                <button
                  className="text-warning"
                  onClick={() => setIsModalOpen(true)}
                >
                  Assign
                </button>
              )}
            </div>
          ) : (
            <button>
              <PlusIcon />
            </button>
          )}
        </div>
      )}

      <Modal
        isLoading={isLoading}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <UserSearch onUserSelect={assignPosition} />
      </Modal>
    </div>
  );
}

export default Position;
