"use client";

import { Team as TeamModel } from "@/lib/models/Team";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Position as PositionComponent } from "@/components/features/teams/";
import { Button, Input, Loader } from "@/components/ui";
import TeamMenu from "./TeamMenu";
import { usePositionStore } from "@/lib/realtime/positionStore";
import { useRealtimePositions } from "@/hooks/useRealtimePositions";
import signalr from "@/lib/realtime/signalrClient";
import { UserProfile } from "@/lib/models/User";
import {
  FaUser as PersonIcon,
  FaTimes as CancelIcon,
  FaPlus as AddIcon,
} from "react-icons/fa";
import { addPosition } from "@/lib/requests/positions";
import { Position } from "@/lib/models/Position";

type TeamProps = {
  open?: boolean;
  editable?: boolean;
  team: TeamModel;
};

function Team({
  team: defaultTeam,
  open = false,
  editable = false,
}: TeamProps) {
  const [team, setTeam] = useState(defaultTeam);
  const [positions, setLocalPositions] = useState(team.positions);
  const captain = team.captain;
  useRealtimePositions();

  const filteredPositions = useMemo(() => {
    return positions?.filter((p) => p.userProfile || open || editable);
  }, [positions, open, editable]);

  const positionStore = usePositionStore((s) => s.positions);
  const upsertPosition = usePositionStore((s) => s.upsert);
  const connectionStatus = usePositionStore((s) => s.connectionStatus);

  // Initialize position store with team positions (upsert each position individually)
  useEffect(() => {
    if (team.positions) {
      team.positions.forEach((position) => {
        upsertPosition(position);
      });
    }
  }, [team.positions, upsertPosition]);

  // Join event group for position updates
  useEffect(() => {
    const connection = signalr.getConnection();
    if (connection && team.event?.id && connectionStatus === "connected") {
      const joinGroup = async () => {
        try {
          await connection.invoke("JoinEventGroup", team.event.id);
        } catch (error) {
          console.error("Failed to join event group:", error);
        }
      };

      const leaveGroup = async () => {
        try {
          if (connection && connectionStatus === "connected") {
            await connection.invoke("LeaveEventGroup", team.event.id);
          }
        } catch (error) {
          console.error("Failed to leave event group:", error);
        }
      };

      joinGroup();

      return () => {
        leaveGroup();
      };
    }
  }, [team.event?.id, connectionStatus]);

  const updatePositions = useCallback(() => {
    setLocalPositions((prev) => {
      if (!prev) return prev;
      return prev.map((p) =>
        positionStore[p.id] ? { ...p, ...positionStore[p.id] } : p
      );
    });
  }, [positionStore]);

  useEffect(() => {
    // If store has entries for this team's positions, reflect them
    updatePositions();
  }, [positionStore, updatePositions]);

  const handleCaptainAssigned = (newCaptain: UserProfile) => {
    // Update local state
    setTeam((prevTeam) => ({ ...prevTeam, captain: newCaptain }));
  };

  const handleCaptainRemoved = () => {
    // Update local state
    setTeam((prevTeam) => ({ ...prevTeam, captain: undefined }));
  };

  const isTeamFull = !positions?.find((p) => !p.userProfile);

  return (
    <div className="bg-stone-900 relative max-w-96 flex-1 flex flex-col p-4 gap-4 rounded-lg w-80">
      <div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2 justify-between w-full">
              <span className="text-lg font-bold">{team.name}</span>
              {/* TODO: team menu is not visible when tam is collapsed */}
              <div className="flex items-center gap-2">
                {open &&
                  positions &&
                  positions.length > 0 &&
                  (isTeamFull ? (
                    <span className="text-success text-sm">Full</span>
                  ) : (
                    <span className="text-accent text-sm">Spots available</span>
                  ))}
                <TeamMenu
                  team={team}
                  onCaptainAssigned={handleCaptainAssigned}
                  onCaptainRemoved={handleCaptainRemoved}
                />
              </div>
            </div>
          </div>
          {captain && (
            <div className="flex gap-2 items-center">
              <span className="text-sm">Captain:</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">
                  {captain.name} {captain.surname}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex flex-col gap-2 relative">
          {filteredPositions && filteredPositions.length != 0 ? (
            filteredPositions.map((p) => (
              <PositionComponent
                open={open}
                editable={editable}
                payToJoin={team.event.budget?.payToJoin}
                team={team}
                position={p}
                onPositionRemoved={(id) => {
                  setLocalPositions((prev) =>
                    prev ? prev.filter((pos) => pos.id !== id) : prev
                  );
                }}
                key={p.id + p.userProfile?.userId}
              />
            ))
          ) : (
            <span className="text-neutral/40">No players yet...</span>
          )}
          {editable && (
            <AddNewPosition
              teamId={team.id!}
              onPositionAdded={(p) => {
                upsertPosition(p);
                setLocalPositions((prev) => [...(prev || []), p]);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

type AddNewPositionProps = {
  teamId: string;
  onPositionAdded: (position: Position) => void;
};

const AddNewPosition = ({ teamId, onPositionAdded }: AddNewPositionProps) => {
  const [addingNewPosition, setAddingNewPosition] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPositionName, setNewPositionName] = useState("");
  const [error, setError] = useState<string | null>("");

  const handleAddNewPosition = () => {
    if (newPositionName.trim()) {
      setIsLoading(true);
      addPosition(teamId, newPositionName.trim())
        .then((createdPosition) => {
          onPositionAdded && onPositionAdded(createdPosition);
          setNewPositionName("");
          setAddingNewPosition(false);
          setIsLoading(false);
          setError(null);
        })
        .catch((err) => {
          setError("Failed to add position. Please try again.");
          setIsLoading(false);
        });
    } else {
      setError("Position name cannot be empty");
    }
  };

  return addingNewPosition ? (
    <div className="flex flex-col relative mt-4">
      {isLoading && <Loader className="inset-0 absolute bg-black/40" />}
      <div className="flex items-center w-full">
        <Input
          type="text"
          placeholder="Position name"
          className="input input-bordered w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddNewPosition();
            }
          }}
          value={newPositionName}
          onChange={(e) => setNewPositionName(e.target.value)}
          autoFocus
        />
        <Button
          variant="icon"
          className="mt-1"
          onClick={() => handleAddNewPosition()}
        >
          <AddIcon />
        </Button>
        <Button
          variant="icon"
          className="mt-1 text-error"
          onClick={() => {
            setAddingNewPosition(false);
            setNewPositionName("");
            setError(null);
          }}
        >
          <CancelIcon />
        </Button>
      </div>
      <div className="text-sm text-error mt-2">{error}</div>
    </div>
  ) : (
    <Button
      variant="outline"
      className="mt-4"
      size="sm"
      leftIcon={<PersonIcon />}
      onClick={() => setAddingNewPosition(true)}
    >
      Add new position
    </Button>
  );
};

export default Team;
