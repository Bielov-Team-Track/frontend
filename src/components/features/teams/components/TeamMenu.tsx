"use client";

import { Team } from "@/lib/models/Team";
import { useAuth } from "@/lib/auth/authContext";
import React from "react";
import { FaEllipsisH as MenuIcon } from "react-icons/fa";
import { Modal } from "@/components/ui";
import { UserSearch } from "@/components/features/users";
import {
  assignCaptain as assignCaptainRequest,
  removeCaptain as removeCaptainRequest,
} from "@/lib/requests/teams";
import useUser from "@/hooks/useUser";
import { UserProfile } from "@/lib/models/User";

type TeamMenuProps = {
  team: Team;
  onCaptainAssigned: (user: UserProfile) => void;
  onCaptainRemoved: () => void;
};

function TeamMenu({
  team,
  onCaptainAssigned,
  onCaptainRemoved,
}: TeamMenuProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { userProfile } = useUser();

  const isAdmin = !!team.event.admins?.find(
    (a) => a.userId == userProfile?.userId
  );

  if (!isAdmin) {
    return null;
  }

  if (!team) {
    return null;
  }

  const assignCaptain = (selectedUser: UserProfile) => {
    setIsLoading(true);
    assignCaptainRequest(team.id!, selectedUser?.userId!)
      .then(() => {
        setIsLoading(false);
        setIsModalOpen(false);
        onCaptainAssigned && onCaptainAssigned(selectedUser);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const removeCaptain = () => {
    setIsLoading(true);
    removeCaptainRequest(team.id!)
      .then(() => {
        setIsLoading(false);
        onCaptainRemoved && onCaptainRemoved();
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="dropdown dropdown-end z-50">
      <MenuIcon tabIndex={0} role="button" className="m-1" />
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow"
      >
        <li>
          <button onClick={() => setIsModalOpen(true)}>Assign a captain</button>
        </li>
        {team.captain && (
          <li>
            <button onClick={() => removeCaptain()}>Remove the captain</button>
          </li>
        )}
      </ul>
      <Modal
        isLoading={isLoading}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-12">
          <UserSearch onUserSelect={assignCaptain} />
        </div>
      </Modal>
    </div>
  );
}

export default TeamMenu;
