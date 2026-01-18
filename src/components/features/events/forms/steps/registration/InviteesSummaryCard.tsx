"use client";

import { AvatarStack, Button } from "@/components";
import { UserProfile } from "@/lib/models/User";
import { Pencil, UserPlus } from "lucide-react";

export interface InviteesSummaryCardProps {
	selectedUsers: UserProfile[];
	onEdit: () => void;
	disabled?: boolean;
	maxAvatars?: number;
}

export default function InviteesSummaryCard({
	selectedUsers,
	onEdit,
	disabled = false,
	maxAvatars = 5,
}: InviteesSummaryCardProps) {
	const avatarItems = selectedUsers.map((user) => ({
		id: user.userId,
		name: `${user.name || ""} ${user.surname || ""}`.trim() || "Unknown",
		imageUrl: user.imageUrl,
	}));

	return (
		<div className="p-4 border border-white/10 rounded-xl bg-white/5">
			<div className="flex items-center justify-between gap-4">
				<AvatarStack
					items={avatarItems}
					max={maxAvatars}
					size="sm"
					emptyText="No invitees selected"
				/>
				<Button
					variant="ghost"
					size="sm"
					onClick={onEdit}
					disabled={disabled}
					leftIcon={selectedUsers.length > 0 ? <Pencil size={14} /> : <UserPlus size={14} />}
					className="shrink-0 text-accent hover:text-accent/80 hover:bg-accent/10">
					{selectedUsers.length > 0 ? "Edit" : "Add People"}
				</Button>
			</div>
		</div>
	);
}

export { InviteesSummaryCard };
