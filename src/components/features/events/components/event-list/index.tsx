"use client";

import React from "react";
import { Event } from "@/lib/models/Event";
import EventCard from "../event-card";

type EventListProps = {
	events: Event[];
	variant?: "grid" | "inline";
	cardVariant?: "vertical" | "horizontal";
	className?: string;
};

function EventList({
	events,
	variant = "grid",
	className,
	cardVariant = "horizontal",
}: EventListProps) {
	const variantClasses = {
		grid: "flex gap-4 flex-wrap justify-center",
		inline: "flex gap-4",
	};
	const baseClasses = "h-full";
	const classes = [variantClasses[variant], className, baseClasses]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={classes}>
			{events && events.length > 0 ? (
				events.map((e) => (
					<EventCard key={e.id} event={e} variant={cardVariant} />
				))
			) : (
				<div className="col-span-full self-center text-muted text-center /60">
					No events available
				</div>
			)}
		</div>
	);
}

export default EventList;
