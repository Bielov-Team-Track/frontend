import { Avatar } from "@/components/ui";
import { SelectOption } from "@/components/ui/select/index";
import { Club, Group, Team } from "@/lib/models/Club";

export const renderTeamOption = ({ data: team }: SelectOption<Team>) => {
	return (
		<div className="flex items-center gap-2">
			<Avatar src={team?.logoUrl} name={team?.name} color={team?.color} variant="team" size="xs" />
			<span className="text-xs text-white/70">{team?.name}</span>
		</div>
	);
};

export const renderClubOption = ({ data: club }: SelectOption<Club>) => {
	return (
		<div className="flex items-center gap-2">
			<Avatar src={club?.logoUrl} variant="club" size="xs" />
			<span className="text-xs text-white/70">{club?.name}</span>
		</div>
	);
};

export const renderGroupOption = ({ data: group }: SelectOption<Group>) => {
	return (
		<div className="flex items-center gap-2">
			<Avatar color={group?.color} variant="group" name={group?.name} size="xs" />
			<span className="text-xs text-white/70">{group?.name}</span>
		</div>
	);
};
