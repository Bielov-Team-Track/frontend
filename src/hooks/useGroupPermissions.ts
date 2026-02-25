import { ClubRole, GroupRole, Visibility } from "@/lib/models/Club";
import { useMemo } from "react";

export interface GroupPermissions {
	canViewGroup: boolean;
	canCreatePost: boolean;
	canPinPost: boolean;
	canHidePost: boolean;
	canEditGroup: boolean;
	canManageMembers: boolean;
	canAssignRoles: boolean;
	canDeleteGroup: boolean;
	canChangeVisibility: boolean;
	isGroupAdmin: boolean;
}

export function useGroupPermissions(
	groupRoles: GroupRole[],
	clubRoles: ClubRole[],
	isGroupMember: boolean,
	groupVisibility: Visibility
): GroupPermissions {
	return useMemo(() => {
		const isClubOwner = clubRoles.includes(ClubRole.Owner);
		const isClubAdmin = clubRoles.includes(ClubRole.Admin);
		const isClubHeadCoach = clubRoles.includes(ClubRole.HeadCoach);
		const isClubAdminOrAbove = isClubOwner || isClubAdmin;
		const isClubHeadCoachOrAbove = isClubAdminOrAbove || isClubHeadCoach;

		const isGroupAdmin = groupRoles.includes(GroupRole.Admin);
		const isGroupCoach = groupRoles.includes(GroupRole.Coach);
		const isGroupAdminOrCoach = isGroupAdmin || isGroupCoach;

		const canViewGroup = isGroupMember || groupVisibility === "Public" || isClubHeadCoachOrAbove;
		const canCreatePost = isGroupMember || isClubHeadCoachOrAbove;
		const canPinPost = isGroupAdminOrCoach || isClubHeadCoachOrAbove;
		const canHidePost = canPinPost;
		const canEditGroup = isGroupAdminOrCoach || isClubHeadCoachOrAbove;
		const canManageMembers = isGroupAdminOrCoach || isClubHeadCoachOrAbove;
		const canAssignRoles = canManageMembers;
		const canDeleteGroup = isClubHeadCoachOrAbove;
		const canChangeVisibility = isClubAdminOrAbove;

		return {
			canViewGroup,
			canCreatePost,
			canPinPost,
			canHidePost,
			canEditGroup,
			canManageMembers,
			canAssignRoles,
			canDeleteGroup,
			canChangeVisibility,
			isGroupAdmin: isGroupAdminOrCoach || isClubHeadCoachOrAbove,
		};
	}, [groupRoles, clubRoles, isGroupMember, groupVisibility]);
}
