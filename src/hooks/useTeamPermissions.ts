import { ClubRole, TeamRole, Visibility } from "@/lib/models/Club";
import { useMemo } from "react";

export interface TeamPermissions {
	canViewFullContent: boolean;
	canCreatePost: boolean;
	canPinPost: boolean;
	canHidePost: boolean;
	canAcceptInvitations: boolean;
	canEditTeam: boolean;
	canManageMembers: boolean;
	canAssignRoles: boolean;
	canDeleteTeam: boolean;
	canChangeVisibility: boolean;
	isTeamAdminOrAbove: boolean;
}

export function useTeamPermissions(
	teamRoles: TeamRole[],
	clubRoles: ClubRole[],
	isTeamMember: boolean,
	teamVisibility: Visibility
): TeamPermissions {
	return useMemo(() => {
		const isClubOwner = clubRoles.includes(ClubRole.Owner);
		const isClubAdmin = clubRoles.includes(ClubRole.Admin);
		const isClubHeadCoach = clubRoles.includes(ClubRole.HeadCoach);
		const isClubAdminOrAbove = isClubOwner || isClubAdmin;
		const isClubHeadCoachOrAbove = isClubAdminOrAbove || isClubHeadCoach;

		const isTeamAdmin = teamRoles.includes(TeamRole.Admin);
		const isTeamCoach = teamRoles.includes(TeamRole.Coach);
		const isTeamCaptain = teamRoles.includes(TeamRole.Captain);
		const isTeamManager = teamRoles.includes(TeamRole.Manager);
		const isTeamAdminOrCoach = isTeamAdmin || isTeamCoach;

		const canViewFullContent = isTeamMember || teamVisibility === "Public" || isClubHeadCoachOrAbove;
		const canCreatePost = isTeamMember || isClubHeadCoachOrAbove;
		const canPinPost = isTeamAdminOrCoach || isClubHeadCoachOrAbove;
		const canHidePost = canPinPost;
		const canAcceptInvitations = isTeamCaptain || isTeamManager || isTeamAdminOrCoach || isClubHeadCoachOrAbove;
		const canEditTeam = isTeamAdminOrCoach || isClubHeadCoachOrAbove;
		const canManageMembers = isTeamAdminOrCoach || isClubHeadCoachOrAbove;
		const canAssignRoles = canManageMembers;
		const canDeleteTeam = isClubHeadCoachOrAbove;
		const canChangeVisibility = isClubAdminOrAbove;

		return {
			canViewFullContent,
			canCreatePost,
			canPinPost,
			canHidePost,
			canAcceptInvitations,
			canEditTeam,
			canManageMembers,
			canAssignRoles,
			canDeleteTeam,
			canChangeVisibility,
			isTeamAdminOrAbove: isTeamAdminOrCoach || isClubHeadCoachOrAbove,
		};
	}, [teamRoles, clubRoles, isTeamMember, teamVisibility]);
}
