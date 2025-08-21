import { EventParticipant } from "@/lib/models/EventParticipant";
import { markParticipantAsPaid } from "@/lib/requests/events";
import {
  FaCheck as CheckIcon,
  FaExclamation as ExclamationIcon,
} from "react-icons/fa";
import { Avatar, Button } from "@/components";
import { Event } from "@/lib/models/Event";

type AuditParticipantListItemProps = {
  participant: EventParticipant;
  event: Event;
};

const AuditParticipantListItem = ({
  participant,
  event,
}: AuditParticipantListItemProps) => {
  const handleUserPaid = async (participantId: string) => {
    try {
      await markParticipantAsPaid(participantId);
    } catch (error) {
      console.error("Error marking user as paid:", error);
    }
  };

  return participant.hasPaid ? (
    <PaidParticipantListItem participant={participant} event={event} />
  ) : (
    <UnpaidParticipantListItem
      participant={participant}
      handleUserPaid={handleUserPaid}
      event={event}
    />
  );
};

const PaidParticipantListItem = ({
  participant,
}: AuditParticipantListItemProps) => {
  return (
    <div className="flex justify-between items-center bg-foreground/60 rounded-lg p-4">
      <div className="flex gap-2 items-center">
        <CheckIcon className="text-green-500" />
        <Avatar profile={participant.profile} />
        <div>
          {participant.profile.name} {participant.profile.surname}
        </div>
      </div>
      <div className="text-neutral/60">Paid</div>
    </div>
  );
};

const UnpaidParticipantListItem = ({
  participant,
  handleUserPaid,
}: AuditParticipantListItemProps & { handleUserPaid: Function }) => {
  return (
    <div className="flex justify-between items-center bg-secondary/30 rounded-lg p-4">
      <div className="flex gap-2 items-center">
        <ExclamationIcon className="text-yellow-500" />
        <Avatar profile={participant.profile} />
        <div>
          {participant.profile.name} {participant.profile.surname}
        </div>
      </div>
      <div>
        <Button
          onClick={() => handleUserPaid(participant.id)}
          disabled={participant.hasPaid}
        >
          {participant.hasPaid ? "Paid ✓" : "Mark as Paid"}
        </Button>
      </div>
    </div>
  );
};

export default AuditParticipantListItem;
