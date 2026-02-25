import { EventParticipant } from "@/lib/models/EventParticipant";

const rolePriority: Record<string, number> = { Owner: 1, Organizer: 2, Admin: 3 };

export function getMainOrganizer(participants: EventParticipant[]): EventParticipant | undefined {
	return participants
		.filter((p) => p.role === "Owner" || p.role === "Organizer" || p.role === "Admin")
		.sort((a, b) => (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99))[0];
}
