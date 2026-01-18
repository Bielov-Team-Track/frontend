"use client";

import { Unit } from "@/lib/models/EventBudget";
import { Team } from "@/lib/models/Team";
import { default as TeamComponent } from "./Team";

type TeamsListProps = {
	teams: Team[];
	userId: string;
	isAdmin: boolean;
	registrationType: Unit;
};

function TeamsList({ teams, isAdmin, registrationType, userId }: TeamsListProps) {
	return (
		teams &&
		teams.length > 0 && (
			<div className="flex flex-col sm:flex-row gap-4">
				{teams.map((t) => (
					<div key={t.id} className="shrink-0 flex-1 items-center">
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
