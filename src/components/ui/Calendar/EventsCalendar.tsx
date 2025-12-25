"use client";

import { Button } from "@/components";
import { Event } from "@/lib/models/Event";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RadioGroup from "../radio-button/RadioGroup";
import MonthView from "./views/MonthView";
import WeekView from "./views/WeekView";
import YearView from "./views/YearView";

interface EventsCalendarProps {
	events: Event[];
	defaultView?: "month" | "week" | "year";
}

const VIEWS = [
	{ value: "month", label: "Month", component: MonthView },
	{ value: "week", label: "Week", component: WeekView },
	{ value: "year", label: "Year", component: YearView },
] as const;

type ViewType = (typeof VIEWS)[number]["value"];

export function EventsCalendar({ events, defaultView }: EventsCalendarProps) {
	const router = useRouter();
	const [currentView, setCurrentView] = useState<ViewType>(defaultView ?? "week");
	const [date, setDate] = useState(new Date());
	const [scrollToNow, setScrollToNow] = useState(false);

	const CurrentViewComponent = VIEWS.find((v) => v.value === currentView)!.component;

	const handleEventClick = (eventId: string) => {
		router.push(`/events/${eventId}`);
	};

	const handleTodayClick = () => {
		setDate(new Date());
		setScrollToNow(true);
		setTimeout(() => setScrollToNow(false), 100);
	};

	const handleViewChange = (view: "month" | "week" | "year", newDate: Date) => {
		setCurrentView(view);
		setDate(newDate);
	};

	return (
		<div className="h-full flex flex-col p-4">
			<div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
				<Button onClick={handleTodayClick} variant="solid" color="accent" size="sm">
					Today
				</Button>

				<RadioGroup
					name="calendar-view"
					value={currentView}
					onChange={(value) => setCurrentView(value as ViewType)}
					options={VIEWS}
					mode="label"
					radioSize="sm"
					variant="neutral"
				/>
			</div>

			<div className="flex-1 min-h-0">
				<CurrentViewComponent events={events} date={date} onEventClick={handleEventClick} scrollToNow={scrollToNow} onViewChange={handleViewChange} />
			</div>
		</div>
	);
}
