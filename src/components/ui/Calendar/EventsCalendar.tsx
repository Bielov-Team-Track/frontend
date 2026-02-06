"use client";

import { Button } from "@/components";
import { Event } from "@/lib/models/Event";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import MonthView from "./views/MonthView";
import WeekView from "./views/WeekView";
import YearView from "./views/YearView";

interface EventsCalendarProps {
	events: Event[];
	defaultView?: "month" | "week" | "year";
}

const VIEWS = [
	{ value: "week", label: "Week", component: WeekView },
	{ value: "month", label: "Month", component: MonthView },
	{ value: "year", label: "Year", component: YearView },
] as const;

export function EventsCalendar({ events }: EventsCalendarProps) {
	const router = useRouter();
	const [date, setDate] = useState(new Date());
	const [scrollToNow, setScrollToNow] = useState(false);

	const handleEventClick = useCallback(
		(eventId: string) => {
			router.push(`/events/${eventId}`);
		},
		[router]
	);

	const handleTodayClick = useCallback(() => {
		setDate(new Date());
		setScrollToNow(true);
		setTimeout(() => setScrollToNow(false), 100);
	}, []);

	return (
		<Tabs className="h-full flex flex-col p-4 bg-surface rounded-2xl border border-border">
			<div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
				<Button onClick={handleTodayClick} variant="outline">
					Today
				</Button>

				<TabsList>
					{VIEWS.map((v) => (
						<TabsTrigger key={v.value} value={v.value}>
							<span className="p-2">{v.label}</span>
						</TabsTrigger>
					))}
				</TabsList>
			</div>

			<div className="flex-1 min-h-0">
				{VIEWS.map((v) => (
					<TabsContent key={v.value} value={v.value} className={"h-full"}>
						<v.component events={events} date={date} onEventClick={handleEventClick} scrollToNow={scrollToNow} />
					</TabsContent>
				))}
			</div>
		</Tabs>
	);
}
