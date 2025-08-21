import { Event } from "@/lib/models/Event";
import AuditEventItem from "./AuditEventListItem";

type AuditEventsListProps = {
  events: Event[];
};

const AuditEventsList = ({ events }: AuditEventsListProps) => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Your Events</h1>
      {events && events.length > 0 ? (
        events.map((event) => <AuditEventItem key={event.id} event={event} />)
      ) : (
        <div className="text-center text-gray-500">No audit events found.</div>
      )}
    </div>
  );
};

export default AuditEventsList;
