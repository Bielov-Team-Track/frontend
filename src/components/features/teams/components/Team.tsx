"use client";

import { Team as TeamModel } from "@/lib/models/Team";
import React, { useEffect, useState } from "react";
import { Position as PositionComponent } from "@/components/features/teams/";
import { useAuth } from "@/lib/auth/authContext";
import { BlockOverlay } from "@/components/ui";
import TeamMenu from "./TeamMenu";
import { usePositionStore } from "@/lib/realtime/positionStore";
import { useRealtimePositions } from "@/hooks/useRealtimePositions";
import signalr from "@/lib/realtime/signalrClient";

function Team({ team: defaultTeam }: { team: TeamModel }) {
  const [team, setTeam] = useState(defaultTeam);
  const [positions, setPositions] = useState(team.positions);
  const { userProfile } = useAuth();
  const captain = team.captain;

  useRealtimePositions();

  const positionStore = usePositionStore((s) => s.positions);

  // Join event group for position updates
  useEffect(() => {
    const connection = signalr.getConnection();
    if (connection && team.event?.id) {
      const joinGroup = async () => {
        try {
          await connection.invoke("JoinEventGroup", team.event.id);
          console.log(`Joined event group: ${team.event.id}`);
        } catch (error) {
          console.error("Failed to join event group:", error);
        }
      };

      const leaveGroup = async () => {
        try {
          await connection.invoke("LeaveEventGroup", team.event.id);
          console.log(`Left event group: ${team.event.id}`);
        } catch (error) {
          console.error("Failed to leave event group:", error);
        }
      };

      joinGroup();

      return () => {
        leaveGroup();
      };
    }
  }, [team.event?.id]);

  useEffect(() => {
    // If store has entries for this team's positions, reflect them
    setPositions((prev) => {
      if (!prev) return prev;
      return prev.map((p) =>
        positionStore[p.id] ? { ...p, ...positionStore[p.id] } : p
      );
    });
  }, [positionStore]);

  const handleCaptainAssigned = (newCaptain?: { id: string; name: string }) => {
    setTeam({ ...team, captain: newCaptain as any });
  };

  const isAdmin =
    userProfile &&
    team.event.admins &&
    team.event.admins.find((a) => a.userId === userProfile.userId);
  const isCaptain =
    captain && userProfile && captain.userId === userProfile.userId;
  const isTeamFull = !positions?.find((p) => !p.userProfile);

  return (
    <div className="collapse collapse-arrow bg-background relative max-w-96">
      <input type="checkbox" defaultChecked={!isTeamFull} />
      <div className="collapse-title">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              <span className="text-lg font-bold">{team.name}</span>
              <TeamMenu team={team} onCaptainAssigned={handleCaptainAssigned} />
            </div>
            {positions && positions.length > 0 ? (
              positions?.every((p) => p.userProfile) ? (
                <span className="text-success text-sm">Full</span>
              ) : (
                <span className="text-accent text-sm">Spots available</span>
              )
            ) : (
              <></>
            )}
          </div>
          {captain && (
            <div className="flex gap-2 items-center">
              <span className="text-sm">👑 Captain:</span>
              <span className="text-sm font-bold">{captain.name}</span>
            </div>
          )}
        </div>
      </div>
      <div className="collapse-content">
        <div className="flex flex-col gap-2 relative">
          {team.captain && !isCaptain && !isAdmin && (
            <BlockOverlay
              reason={<div>Only captain or admin can assign players</div>}
              className="rounded-lg m-[-5px]"
            />
          )}
          {positions && positions.length != 0 ? (
            positions.map((p) => (
              <PositionComponent
                isCaptain={
                  !!(p.userProfile && p.userProfile.userId === captain?.userId)
                }
                team={team}
                position={p}
                key={p.id + p.userProfile?.userId}
              />
            ))
          ) : (
            <span>No positions yet...</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Team;
