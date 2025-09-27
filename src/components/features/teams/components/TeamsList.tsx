"use client";

import { Team } from "@/lib/models/Team";
import React from "react";
import { default as TeamComponent } from "./Team";
import { Unit } from "@/lib/models/EventBudget";

type TeamsListProps = {
  teams: Team[];
  userId: string;
  isAdmin: boolean;
  registrationType: Unit;
};

function TeamsList({
  teams,
  isAdmin,
  registrationType,
  userId,
}: TeamsListProps) {
  console.log("Rendering TeamsList with teams", isAdmin);
  return (
    teams &&
    teams.length > 0 && (
      <div className="flex flex-col sm:flex-row gap-4 overflow-x-visible pb-4 snap-x snap-mandatory">
        {teams.map((t) => (
          <div key={t.id} className="flex-shrink-0 snap-start">
            <TeamComponent
              team={t}
              open={registrationType == Unit.Individual && !t.captain}
              editable={(t.captain && t.captain?.userId == userId) || isAdmin}
            />
          </div>
        ))}
      </div>
    )
  );
}

export default TeamsList;
