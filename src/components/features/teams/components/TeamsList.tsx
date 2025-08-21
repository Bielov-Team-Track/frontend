"use client";

import { Team } from "@/lib/models/Team";
import React from "react";
import { default as TeamComponent } from "./Team";

function TeamsList({ teams }: { teams: Team[] }) {
  return (
    teams &&
    teams.length > 0 && (
      <div className="flex gap-4 justify-center flex-wrap">
        {teams.map((t) => (
          <TeamComponent key={t.id} team={t} />
        ))}
      </div>
    )
  );
}

export default TeamsList;
