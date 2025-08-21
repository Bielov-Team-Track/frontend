import { Button } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import {
  getDuration,
  getFormattedDateWithDay,
  getFormattedTime,
} from "@/lib/utils/date";
import Image from "next/image";
import Link from "next/link";
import { FaCalendar as CalendarIcon } from "react-icons/fa";
import { FaMapPin as MapPinIcon } from "react-icons/fa";
import { FaClock as ClockIcon } from "react-icons/fa";
import { FaVolleyballBall as VolleyballIcon } from "react-icons/fa";

type EventCardProps = {
  event: Event;
  style: "card" | "inline" | null;
};

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link href={`/dashboard/events/${event.id}`} className="flex flex-col">
      <div className="bg-foreground rounded-lg p-4 max-w-96 h-36 flex flex-grow flex-row gap-4 relative">
        {
          <div className="aspect-square h-full bg-secondary rounded-md self-stretch grid place-items-center">
            {event.image ? (
              <Image
                src="/images/event-placeholder.png"
                alt="Event Image"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <VolleyballIcon className="text-8xl text-accent" />
            )}
          </div>
        }
        <div className="flex flex-col justify-between gap-2 min-w-0 flex-1 text-neutral/60">
          <h2 className="text-xl font-semibold text-neutral text-ellipsis overflow-hidden whitespace-nowrap text-nowrap">
            {event.name}
          </h2>
          <div className="flex flex-col text-sm gap-1">
            <div className="flex flex-row items-center gap-2 text-ellipsis overflow-hidden whitespace-nowrap">
              <MapPinIcon />
              {event.location?.name || "TBD"}
            </div>
            <div className="flex flex-row items-center gap-2">
              <CalendarIcon />
              <span>{getFormattedDateWithDay(event.startTime)}</span>
            </div>
            <div className="flex flex-row items-center gap-2">
              <ClockIcon />
              <span>{getFormattedTime(event.startTime)},</span>
              {getDuration(event.startTime, event.endTime)}
            </div>
            <div className="flex flex-row items-center gap-2"></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
