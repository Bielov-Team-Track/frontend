import { EventParticipant } from "@/lib/models/EventParticipant";
import AuditParticipantListItem from "./AuditParticipantListItem";
import { Event } from "@/lib/models/Event";

type AuditParticipantListProps = {
  participants: EventParticipant[];
  event: Event;
};

const AuditParticipantList = ({
  participants,
  event,
}: AuditParticipantListProps) => {
  return (
    <div className="flex flex-col gap-4">
      {participants.map((participant) => (
        <AuditParticipantListItem
          key={participant.id}
          participant={participant}
          event={event}
        />
      ))}
    </div>
  );
};

export default AuditParticipantList;
