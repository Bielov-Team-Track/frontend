"use client";

import { UserProfile } from "@/lib/models/User";
import { WizardStepProps } from "../../core/types";
import { InvitePeopleStep } from "../../steps/InviteStep";
import { ClubFormData } from "../types";

export function InviteStep({ form }: WizardStepProps<ClubFormData>) {
	const { watch, setValue } = form;
	const invitees = watch("invitees") || [];

	const handleUserAdd = (user: UserProfile) => {
		setValue("invitees", [...invitees, user]);
	};

	const handleUserRemove = (userId: string) => {
		setValue(
			"invitees",
			invitees.filter((u: UserProfile) => u.id !== userId),
		);
	};

	return (
		<InvitePeopleStep
			selectedUsers={invitees}
			onUserAdd={handleUserAdd}
			onUserRemove={handleUserRemove}
			title="Invite Members"
			subtitle="Invite people to join your club."
		/>
	);
}
