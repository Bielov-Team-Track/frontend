"use client";

import { CreateEventForm } from "@/components";
import Modal from "@/components/ui/modal";
import { ContextSelection } from "@/components/features/events/forms/components/ContextSelector";

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
	contextSelection?: ContextSelection;
	onClose: () => void;
	onSubmit: (event: Omit<ClubEvent, "id" | "createdAt">) => void;
}

export default function ClubEventFormModal({ isOpen, contextSelection, onClose, onSubmit }: ClubEventFormModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Create Event" size="lg">
			<CreateEventForm variant="embedded" contextSelection={contextSelection} />
		</Modal>
	);
}
