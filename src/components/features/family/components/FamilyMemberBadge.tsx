"use client";

import { Badge } from "@/components/ui";
import { Baby } from "lucide-react";

interface FamilyMemberBadgeProps {
	memberName: string;
}

export default function FamilyMemberBadge({ memberName }: FamilyMemberBadgeProps) {
	return (
		<Badge
			color="accent"
			variant="soft"
			size="xs"
			icon={<Baby size={12} />}
			iconPosition="left"
		>
			{memberName}
		</Badge>
	);
}
