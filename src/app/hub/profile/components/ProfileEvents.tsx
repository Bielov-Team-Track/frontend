import React from "react";
import { Event } from "@/lib/models/Event";
import { getFormattedDateWithDay } from "@/lib/utils/date";
import { Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";

interface ProfileEventsProps {
    events?: Event[];
    title: string;
}

const ProfileEvents = ({ events, title }: ProfileEventsProps) => {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            
            {events && events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                        <Link 
                            key={event.id} 
                            href={`/hub/events/${event.id}`}
                            className="bg-surface border border-border rounded-xl p-4 hover:border-accent/50 transition-colors group flex flex-col gap-3"
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                                    {event.name}
                                </h4>
                                {/* Status Badge could go here */}
                            </div>
                            
                            <div className="flex flex-col gap-2 text-sm text-muted">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>{getFormattedDateWithDay(event.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} />
                                    <span>
                                        {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} />
                                    <span className="truncate">{event.location?.name || "TBD"}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-xl p-8 text-center text-muted">
                    No events found.
                </div>
            )}
        </div>
    );
};

export default ProfileEvents;
