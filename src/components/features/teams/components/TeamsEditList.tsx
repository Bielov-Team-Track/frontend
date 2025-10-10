"use client";

import { Team } from "@/lib/models/Team";
import { Event } from "@/lib/models/Event";
import React from "react";
import TeamEdit from "./TeamEdit";

function TeamsEditList({
	teams,
	onTeamDelete,
}: {
	teams: Team[];
	event: Event;
	onTeamDelete: Function;
}) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-4">
				{teams ? (
					teams.map((t) => (
						<TeamEdit onTeamDelete={onTeamDelete} key={t.id} team={t} />
					))
				) : (
					<span>No teams yet...</span>
				)}
			</div>
		</div>
	);
}

export default TeamsEditList;
