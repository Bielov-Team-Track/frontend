"use client";

import { RadioGroup } from "@/components";
import { EventsList } from "@/components/features/events";
import { EventsCalendar } from "@/components/ui/calendar/EventsCalendar";
import { Event } from "@/lib/models/Event";
import { useState } from "react";
import { FaCalendar, FaList, FaTh } from "react-icons/fa";

const VIEWS = [
	{ value: "list", label: "List", icon: FaList },
	{ value: "calendar", label: "Calendar", icon: FaCalendar },
	{ value: "grid", label: "Grid", icon: FaTh },
] as const;

type ViewType = (typeof VIEWS)[number]["value"];

interface EventsPageClientProps {
	events: Event[];
}

function EventsPageClient({ events }: EventsPageClientProps) {
	const [currentView, setCurrentView] = useState<ViewType>("list");

	return (
		<div className="absolute inset-0 p-4 sm:px-8 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Events</h1>

				<RadioGroup
					name="view-toggle"
					value={currentView}
					onChange={(value) => setCurrentView(value as ViewType)}
					options={VIEWS}
					mode="icon"
					radioSize="md"
					variant="neutral"
				/>
			</div>

			<div className="h-[calc(100%-5rem)]">
				{currentView === "calendar" && (
					<div className="h-full">
						<EventsCalendar events={events} />
					</div>
				)}

				{currentView === "list" && (
					<div>
						<EventsList
							events={events}
							variant="inline"
							cardVariant="horizontal"
						/>
					</div>
				)}

				{currentView === "grid" && (
					<div>
						<EventsList
							events={events}
							variant="grid"
							cardVariant="vertical"
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default EventsPageClient;
