import { ClubRole } from "@/lib/models/Club";
import { useMemo } from "react";

const ROLE_HIERARCHY: Record<ClubRole, number> = {
	[ClubRole.Member]: 0,
	[ClubRole.WelfareOfficer]: 1,
	[ClubRole.Treasurer]: 2,
	[ClubRole.HeadCoach]: 3,
	[ClubRole.Admin]: 4,
	[ClubRole.Owner]: 5,
};

export interface ClubPermissions {
	canCreatePost: boolean;
	canPinPost: boolean;
	canHidePost: boolean;
	canCreateEvent: boolean;
	canManageTeams: boolean;
	canManageGroups: boolean;
	canInviteMembers: boolean;
	canEditMembers: boolean;
	canManageRegistrations: boolean;
	canAccessSettings: boolean;
	canAccessDangerZone: boolean;
	isAdminOrAbove: boolean;
	canAssignRole: (targetRole: ClubRole) => boolean;
}

export function useClubPermissions(myRoles: ClubRole[]): ClubPermissions {
	return useMemo(() => {
		const isOwner = myRoles.includes(ClubRole.Owner);
		const isAdmin = myRoles.includes(ClubRole.Admin);
		const isHeadCoach = myRoles.includes(ClubRole.HeadCoach);
		const isAdminOrAbove = isOwner || isAdmin;
		const isHeadCoachOrAbove = isAdminOrAbove || isHeadCoach;

		const highestRoleLevel = myRoles.length > 0
			? Math.max(...myRoles.map((r) => ROLE_HIERARCHY[r]))
			: -1;

		return {
			canCreatePost: true,
			canPinPost: isAdminOrAbove,
			canHidePost: isAdminOrAbove,
			canCreateEvent: isAdminOrAbove,
			canManageTeams: isHeadCoachOrAbove,
			canManageGroups: isHeadCoachOrAbove,
			canInviteMembers: isHeadCoachOrAbove,
			canEditMembers: isAdminOrAbove,
			canManageRegistrations: isAdminOrAbove,
			canAccessSettings: isAdminOrAbove,
			canAccessDangerZone: isOwner,
			isAdminOrAbove,
			canAssignRole: (targetRole: ClubRole) => highestRoleLevel >= ROLE_HIERARCHY[targetRole],
		};
	}, [myRoles]);
}
