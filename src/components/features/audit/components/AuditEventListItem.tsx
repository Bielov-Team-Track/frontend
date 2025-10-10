import Link from "@/components/ui/link";
import { Event } from "@/lib/models/Event";
import { loadParticipants } from "@/lib/requests/events";
import { getFormattedDateWithDay } from "@/lib/utils/date";
import {
	FaCheck as CheckIcon,
	FaExclamation as ExclamationIcon,
} from "react-icons/fa";

type AuditEventItemProps = {
	event: Event;
};

const AuditEventItem = async ({ event }: AuditEventItemProps) => {
	if (!event || !event.id) {
		return null;
	}

	const participants = await loadParticipants(event.id);

	const isClosed =
		participants.filter((p) => p.payment?.status !== "completed").length == 0;

	return (
		<div className="p-4 /60 text-primary-content rounded-md flex gap-4 items-center justify-between">
			<div className="flex items-center">
				<div className="flex">
					{isClosed ? (
						<CheckIcon />
					) : (
						<ExclamationIcon className="text-warning" />
					)}
				</div>
				<Link href={`/dashboard/events/${event.id}`} className="px-0">
					{event.name}
				</Link>
				<div className="text-muted">
					{getFormattedDateWithDay(event.startTime)}
				</div>
			</div>

			<Link href={`/dashboard/audit/${event.id}`}>Details</Link>
		</div>
	);
};

export default AuditEventItem;
