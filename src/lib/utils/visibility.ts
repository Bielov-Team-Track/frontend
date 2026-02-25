import { ClubSettings, Group, Team, Visibility } from "@/lib/models/Club";

export function getTeamVisibility(team: Team, settings?: ClubSettings | null): Visibility {
	if (team.visibility) return team.visibility;
	return settings?.defaultTeamVisibility ?? "Public";
}

export function getGroupVisibility(group: Group, settings?: ClubSettings | null): Visibility {
	if (group.visibility) return group.visibility;
	return settings?.defaultGroupVisibility ?? "Private";
}
