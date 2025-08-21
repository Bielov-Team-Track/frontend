"use client";

import React from "react";
import { Event } from "@/lib/models/Event";
import EventCard from "../event-card";

type EventListProps = {
  events: Event[];
  variant?: "grid" | "inline";
  className?: string;
};

function EventList({ events, variant = "grid", className }: EventListProps) {
  const variantClasses = {
    grid: "flex gap-4 flex-wrap justify-center",
    inline: "flex gap-4",
  };
  const baseClasses = "h-full p-4";
  const classes = [variantClasses[variant], className, baseClasses]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {events && events.length > 0 ? (
        events.map((e) => <EventCard key={e.id} event={e} style="card" />)
      ) : (
        <div className="col-span-full self-center text-neutral/60 text-center text-base-content/60">
          No events available
        </div>
      )}
    </div>
  );
}

export default EventList;
