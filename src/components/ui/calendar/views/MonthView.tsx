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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
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

	// Always show 6 weeks (42 days) - memoized
	const allDays = useMemo(() => {
		const days = [] as Date[];
		for (let i = 0; i < 42; i++) {
			const day = new Date(calendarStart);
			day.setDate(calendarStart.getDate() + i);
			days.push(day);
		}
		return days;
	}, [calendarStart]);

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const getEventsForDay = useCallback(
		(day: Date) => {
			return events.filter((event) => {
				const eventStart = new Date(event.startTime);
				return isSameDay(eventStart, day);
			});
		},
		[events]
	);

	const handlePrevMonth = () => {
		setCurrentDate(subMonths(currentDate, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(addMonths(currentDate, 1));
	};

	return (
		<div className="w-full h-full flex flex-col border border-border rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
			{/* Header */}
			<div className="p-4 flex items-center justify-between border-b border-border bg-surface">
				<h2 className="text-2xl font-bold text-foreground tracking-tight">
					{format(currentDate, "MMMM yyyy")}
				</h2>
				<div className="flex items-center bg-hover rounded-lg p-1 border border-border">
					<Button
						size="sm"
						variant="ghost"
						color="neutral"
						onClick={handlePrevMonth}
						className="h-8 w-8 p-0 hover:bg-hover hover:text-foreground rounded-md">
						<ChevronLeft size={16} />
					</Button>
					<div className="w-px h-4 bg-hover mx-1"></div>
					<Button
						onClick={handleNextMonth}
						variant="ghost"
						color="neutral"
						size="sm"
						className="h-8 w-8 p-0 hover:bg-hover hover:text-foreground rounded-md">
						<ChevronRight size={16} />
					</Button>
				</div>
			</div>

			<div className="flex-1 flex flex-col min-h-0">
				{/* Weekday headers */}
				<div className="grid grid-cols-7 border-b border-border bg-surface">
					{weekDays.map((day) => (
						<div
							key={day}
							className="text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest py-3">
							{day}
						</div>
					))}
				</div>

				{/* Calendar grid */}
				<div className="flex-1 grid grid-rows-6">
					{[0, 1, 2, 3, 4, 5].map((week) => (
						<div
							key={week}
							className="grid grid-cols-7 border-b border-border last:border-b-0">
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

const DayCell = memo(function DayCell({
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
                p-2 flex flex-col cursor-pointer border-r border-border last:border-r-0 relative transition-all duration-200 group
                ${!isCurrentMonth ? "bg-surface/50" : "bg-transparent"}
                ${isToday ? "bg-accent/8" : "hover:bg-hover"}
            `}>
			{/* Top Bar for Today */}
			{isToday && (
				<div className="absolute top-0 left-0 w-full h-[2px] bg-accent shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
			)}

			<div className="flex justify-between items-start mb-1">
				<span
					className={`
                    text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors
                    ${
						isToday
							? "bg-accent text-white shadow-md shadow-accent/20"
							: isCurrentMonth
							? "text-white group-hover:bg-hover"
							: "text-muted-foreground/30"
					}
                `}>
					{format(day, "d")}
				</span>
			</div>

			<div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-none min-h-0">
				{events.slice(0, 3).map((event) => (
					<div
						key={event.id}
						data-event
						onClick={(e) => {
							e.stopPropagation();
							onEventClick(event.id);
						}}
						className={`
                            px-2 py-1 rounded text-[10px] font-medium truncate transition-all cursor-pointer border-l-2
                            ${
								isToday
									? "bg-hover text-white border-accent hover:bg-surface0"
									: "bg-surface text-muted-foreground/80 border-border hover:text-foreground hover:bg-hover hover:border-border/80"
							}
                        `}>
						{event.name}
					</div>
				))}
				{events.length > 3 && (
					<div className="text-[9px] text-muted-foreground pl-1 font-medium group-hover:text-foreground transition-colors">
						+{events.length - 3} more
					</div>
				)}
			</div>
		</div>
	);
});

export default MonthView;
