import { ClubRole, TeamRole, GroupRole } from "@/lib/models/Club";

export interface RoleOption<T extends string> {
	value: T;
	label: string;
	description: string;
}

// Note: Owner role is NOT included - it can only be transferred via club settings
export const CLUB_ROLE_OPTIONS: RoleOption<ClubRole>[] = [
	{
		value: ClubRole.HeadCoach,
		label: "Head Coach",
		description: "Oversees all teams/groups, full coaching access",
	},
	{
		value: ClubRole.Admin,
		label: "Admin",
		description: "Manages posts, comments, registrations",
	},
	{
		value: ClubRole.Treasurer,
		label: "Treasurer",
		description: "Finance, dues, payments",
	},
	{
		value: ClubRole.WelfareOfficer,
		label: "Welfare Officer",
		description: "Attendance tracking",
	},
];

export const TEAM_ROLE_OPTIONS: RoleOption<TeamRole>[] = [
	{
		value: TeamRole.Coach,
		label: "Coach",
		description: "Training, lineup, team strategy",
	},
	{
		value: TeamRole.AssistantCoach,
		label: "Assistant Coach",
		description: "Supports coach",
	},
	{
		value: TeamRole.Manager,
		label: "Manager",
		description: "Logistics, scheduling, communication",
	},
	{
		value: TeamRole.Captain,
		label: "Captain",
		description: "Player leadership, on-court decisions",
	},
	{
		value: TeamRole.Admin,
		label: "Admin",
		description: "Team settings, roster management",
	},
];

export const GROUP_ROLE_OPTIONS: RoleOption<GroupRole>[] = [
	{
		value: GroupRole.Leader,
		label: "Leader",
		description: "Primary group organizer",
	},
	{
		value: GroupRole.Coach,
		label: "Coach",
		description: "Runs training sessions",
	},
	{
		value: GroupRole.AssistantCoach,
		label: "Assistant Coach",
		description: "Supports coach",
	},
	{
		value: GroupRole.Admin,
		label: "Admin",
		description: "Manages group membership",
	},
	{
		value: GroupRole.Helper,
		label: "Helper",
		description: "Advanced player assisting beginners",
	},
	{
		value: GroupRole.Captain,
		label: "Captain",
		description: "Group leadership role",
	},
];
