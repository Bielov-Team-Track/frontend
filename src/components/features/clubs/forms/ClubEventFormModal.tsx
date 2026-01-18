"use client";

import { CreateEventForm } from "@/components";
import Modal from "@/components/ui/modal";
import { Club, Group, Team } from "@/lib/models/Club";

export interface ClubEvent {
	id: string;
	name: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	location?: string;
	targetType: "all" | "teams" | "groups" | "custom";
	targetTeamIds?: string[];
	targetGroupIds?: string[];
	createdAt: Date;
}

interface ClubEventFormModalProps {
	isOpen: boolean;
	context: Club | Group | Team | undefined;
	onClose: () => void;
	onSubmit: (event: Omit<ClubEvent, "id" | "createdAt">) => void;
}

export default function ClubEventFormModal({ isOpen, context, onClose, onSubmit }: ClubEventFormModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Create Event" size="lg">
			<CreateEventForm variant="embedded" context={context} />
		</Modal>
	);
}
