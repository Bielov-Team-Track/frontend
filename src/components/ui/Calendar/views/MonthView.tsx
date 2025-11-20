import { Button } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	isToday,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ViewComponentProps } from "./ViewProps";

function MonthView({
	events,
	date,
	onEventClick,
	onViewChange,
}: ViewComponentProps) {
	const [currentDate, setCurrentDate] = useState(date);

	useEffect(() => {
		setCurrentDate(date);
	}, [date]);

	const monthStart = startOfMonth(currentDate);
	const monthEnd = endOfMonth(currentDate);
	const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
	const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

	// Always show 6 weeks (42 days)
	const days = eachDayOfInterval({
		start: calendarStart,
		end: calendarStart,
	});
	const allDays = [] as Date[];
	for (let i = 0; i < 42; i++) {
		const day = new Date(calendarStart);
		day.setDate(calendarStart.getDate() + i);
		allDays.push(day);
	}

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const getEventsForDay = (day: Date) => {
		return events.filter((event) => {
			const eventStart = new Date(event.startTime);
			return isSameDay(eventStart, day);
		});
	};

	const handlePrevMonth = () => {
		setCurrentDate(subMonths(currentDate, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(addMonths(currentDate, 1));
	};

	return (
		<div className="w-full h-full flex flex-col">
			<MonthNavigation
				date={currentDate}
				onPrev={handlePrevMonth}
				onNext={handleNextMonth}
			/>

			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Weekday headers */}
				<div className="grid grid-cols-7 gap-2 mb-2">
					{weekDays.map((day) => (
						<div
							key={day}
							className="text-center font-semibold text-foreground-content py-2">
							{day}
						</div>
					))}
				</div>

				{/* Calendar grid - always 6 rows */}
				<div className="flex-1 grid grid-rows-6">
					{[0, 1, 2, 3, 4, 5].map((week) => (
						<div key={week} className="grid grid-cols-7">
							{allDays
								.slice(week * 7, (week + 1) * 7)
								.map((day, dayIndex) => {
									const dayEvents = getEventsForDay(day);
									const isCurrentMonth = isSameMonth(
										day,
										currentDate
									);
									const isTodayDate = isToday(day);

									return (
										<DayCell
											key={day.toISOString()}
											day={day}
											events={dayEvents}
											isCurrentMonth={isCurrentMonth}
											isToday={isTodayDate}
											onEventClick={onEventClick}
											onViewChange={onViewChange}
											isFirstCol={dayIndex === 0}
											isFirstRow={week === 0}
										/>
									);
								})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function MonthNavigation({
	date,
	onPrev,
	onNext,
}: {
	date: Date;
	onPrev: () => void;
	onNext: () => void;
}) {
	return (
		<div className="flex gap-2 items-center mb-4">
			<div>
				<Button
					size="sm"
					variant="ghost"
					color="neutral"
					onClick={onPrev}
					className="px-3 py-1">
					<FaChevronLeft />
				</Button>
				<Button
					onClick={onNext}
					variant="ghost"
					color="neutral"
					size="sm">
					<FaChevronRight />
				</Button>
			</div>
			<span className="text-foreground-content font-semibold text-xl">
				{format(date, "MMMM yyyy")}
			</span>
		</div>
	);
}

function DayCell({
	day,
	events,
	isCurrentMonth,
	isToday,
	onEventClick,
	onViewChange,
	isFirstCol,
	isFirstRow,
}: {
	day: Date;
	events: Event[];
	isCurrentMonth: boolean;
	isToday: boolean;
	onEventClick: (eventId: string) => void;
	onViewChange?: (view: "month" | "week" | "year", date: Date) => void;
	isFirstCol: boolean;
	isFirstRow: boolean;
}) {
	const handleDayClick = (e: React.MouseEvent) => {
		// Don't trigger if clicking on an event
		if ((e.target as HTMLElement).closest("[data-event]")) {
			return;
		}
		if (onViewChange) {
			onViewChange("week", day);
		}
	};

	return (
		<div
			onClick={handleDayClick}
			className={`
        p-2 flex flex-col cursor-pointer
        ${isFirstCol ? "border-l" : ""}
        ${isFirstRow ? "border-t" : ""}
        border-r border-b
        ${
			isCurrentMonth
				? "bg-background border-muted/20"
				: "bg-background-dark border-muted/10"
		}
        ${isToday ? "bg-accent/5 ring-2 ring-accent ring-inset" : ""}
        hover:bg-background-light transition-colors
      `}>
			<div
				className={`
          text-sm font-semibold mb-1
          ${
				isCurrentMonth
					? "text-foreground-content"
					: "text-foreground-content/40"
			}
          ${isToday ? "text-accent font-bold" : ""}
        `}>
				{format(day, "d")}
			</div>

			<div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-foreground-content/20 scrollbar-track-transparent">
				{events.slice(0, 3).map((event) => (
					<div
						key={event.id}
						data-event
						onClick={(e) => {
							e.stopPropagation();
							onEventClick(event.id);
						}}
						className="text-xs bg-primary text-primary-content rounded px-2 py-1 truncate cursor-pointer hover:brightness-110 transition-all">
						{event.name}
					</div>
				))}
				{events.length > 3 && (
					<div className="text-xs text-foreground-content/60 px-2">
						+{events.length - 3} more
					</div>
				)}
			</div>
		</div>
	);
}

export default MonthView;
