import { Button } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import {
	addYears,
	getDay,
	getDaysInMonth,
	getYear,
	isToday,
	startOfMonth,
	subYears,
} from "date-fns";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ViewComponentProps } from "./ViewProps";

function YearView({
	events,
	date,
	onEventClick,
	onViewChange,
}: ViewComponentProps) {
	const [currentDate, setCurrentDate] = useState(date);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

	useEffect(() => {
		setCurrentDate(date);
	}, [date]);

	const handlePrevYear = () => {
		setCurrentDate(subYears(currentDate, 1));
	};

	const handleNextYear = () => {
		setCurrentDate(addYears(currentDate, 1));
	};

	const formatDateKey = (year: number, month: number, day: number) => {
		return `${year}-${String(month + 1).padStart(2, "0")}-${String(
			day
		).padStart(2, "0")}`;
	};

	const getEventsForDate = (dateKey: string) => {
		return events.filter((event) => {
			const eventStart = new Date(event.startTime);
			const eventDateKey = formatDateKey(
				eventStart.getFullYear(),
				eventStart.getMonth(),
				eventStart.getDate()
			);
			return eventDateKey === dateKey;
		});
	};

	const getDaysInMonthArray = (year: number, monthIndex: number) => {
		const daysInMonth = getDaysInMonth(new Date(year, monthIndex));
		const firstDayOfMonth = getDay(
			startOfMonth(new Date(year, monthIndex))
		);
		const days = [];

		// Empty cells for days before month starts
		for (let i = 0; i < firstDayOfMonth; i++) {
			days.push(null);
		}

		// Days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			days.push(day);
		}

		return days;
	};

	const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
	const year = getYear(currentDate);

	return (
		<div className="w-full h-full flex flex-col">
			<YearNavigation
				year={year}
				onPrev={handlePrevYear}
				onNext={handleNextYear}
			/>

			<div className="flex-1 flex gap-6 overflow-hidden">
				{/* Calendar Grid */}
				<div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground-content/20 scrollbar-track-transparent">
					<div className="flex flex-wrap gap-4 justify-center">
						{months.map((monthName, monthIndex) => (
							<MonthCalendar
								key={monthIndex}
								monthName={monthName}
								monthIndex={monthIndex}
								year={year}
								days={getDaysInMonthArray(year, monthIndex)}
								dayLabels={dayLabels}
								formatDateKey={formatDateKey}
								getEventsForDate={getEventsForDate}
								selectedDate={selectedDate}
								setSelectedDate={setSelectedDate}
								onViewChange={onViewChange}
							/>
						))}
					</div>
				</div>

				{/* Event Sidebar */}
				<EventSidebar
					selectedEvents={selectedEvents}
					allEvents={events}
					formatDateKey={formatDateKey}
					setSelectedDate={setSelectedDate}
					onEventClick={onEventClick}
				/>
			</div>
		</div>
	);
}

function YearNavigation({
	year,
	onPrev,
	onNext,
}: {
	year: number;
	onPrev: () => void;
	onNext: () => void;
}) {
	return (
		<div className="flex items-center mb-4">
			<Button
				size="sm"
				variant="ghost"
				color="neutral"
				onClick={onPrev}
				className="px-3 py-1">
				<FaChevronLeft />
			</Button>
			<Button onClick={onNext} variant="ghost" color="neutral" size="sm">
				<FaChevronRight />
			</Button>
			<span className="text-foreground-content font-semibold text-xl ml-2">
				{year}
			</span>
		</div>
	);
}

function MonthCalendar({
	monthName,
	monthIndex,
	year,
	days,
	dayLabels,
	formatDateKey,
	getEventsForDate,
	selectedDate,
	setSelectedDate,
	onViewChange,
}: {
	monthName: string;
	monthIndex: number;
	year: number;
	days: (number | null)[];
	dayLabels: string[];
	formatDateKey: (year: number, month: number, day: number) => string;
	getEventsForDate: (dateKey: string) => Event[];
	selectedDate: string | null;
	setSelectedDate: (date: string) => void;
	onViewChange?: (view: "month" | "week" | "year", date: Date) => void;
}) {
	const handleMonthClick = () => {
		if (onViewChange) {
			onViewChange("month", new Date(year, monthIndex, 1));
		}
	};

	return (
		<div className="rounded-lg p-3 min-w-44 shadow-sm">
			<div
				className="font-semibold text-sm text-foreground-content mb-2 text-center cursor-pointer hover:text-primary transition-colors"
				onClick={handleMonthClick}>
				{monthName}
			</div>
			<div className="grid grid-cols-7 gap-1 mb-1">
				{dayLabels.map((label) => (
					<div
						key={label}
						className="text-xs text-foreground-content/60 font-medium text-center h-5 flex items-center justify-center">
						{label}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-1 text-muted">
				{days.map((day, index) => {
					if (day === null) {
						return <div key={`empty-${index}`} className="h-7" />;
					}

					const dateKey = formatDateKey(year, monthIndex, day);
					const dayEvents = getEventsForDate(dateKey);
					const isTodayDate = isToday(
						new Date(year, monthIndex, day)
					);
					const isSelected = selectedDate === dateKey;

					const handleDayClick = () => {
						if (onViewChange) {
							onViewChange(
								"week",
								new Date(year, monthIndex, day)
							);
						}
					};

					return (
						<div
							key={day}
							onClick={handleDayClick}
							className={`h-7 flex items-center justify-center text-xs cursor-pointer relative rounded transition-all
                ${
					isTodayDate
						? "bg-accent/20 font-bold text-accent"
						: "hover:-content/10 text-foreground-content"
				}
                ${isSelected ? "ring-2 ring-primary" : ""}
              `}>
							<span className="relative z-10">{day}</span>
							{dayEvents.length > 0 && (
								<div className="absolute bottom-0.5 flex gap-0.5">
									{dayEvents.slice(0, 3).map((event, idx) => (
										<div
											key={idx}
											className="w-1 h-1 rounded-full bg-primary"
										/>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function EventSidebar({
	allEvents,
	formatDateKey,
	setSelectedDate,
	onEventClick,
}: {
	selectedEvents: Event[];
	allEvents: Event[];
	formatDateKey: (year: number, month: number, day: number) => string;
	setSelectedDate: (date: string) => void;
	onEventClick: (eventId: string) => void;
}) {
	// Group events by date
	const eventsByDate: Record<string, Event[]> = {};
	allEvents.forEach((event) => {
		const eventStart = new Date(event.startTime);
		const dateKey = formatDateKey(
			eventStart.getFullYear(),
			eventStart.getMonth(),
			eventStart.getDate()
		);
		if (!eventsByDate[dateKey]) {
			eventsByDate[dateKey] = [];
		}
		eventsByDate[dateKey].push(event);
	});

	return (
		<div className="w-80 bg-background-light rounded-lg shadow-lg p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground-content/20 scrollbar-track-transparent">
			<h2 className="text-xl font-bold text-foreground-content mb-2">
				Events
			</h2>

			<div>
				<div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground-content/20 scrollbar-track-transparent">
					{Object.entries(eventsByDate)
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([dateKey, eventList]) => (
							<div
								key={dateKey}
								onClick={() => setSelectedDate(dateKey)}
								className="cursor-pointer hover:bg-background-light p-2 rounded-lg transition-colors">
								<div className="text-xs text-foreground-content/60">
									{new Date(
										dateKey + "T00:00:00"
									).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									})}
								</div>
								{eventList.map((event) => (
									<div
										key={event.id}
										className="flex items-center gap-2 mt-1"
										onClick={(e) => {
											e.stopPropagation();
											onEventClick(event.id);
										}}>
										<div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
										<span className="text-sm text-foreground-content truncate">
											{event.name}
										</span>
									</div>
								))}
							</div>
						))}
				</div>
			</div>
		</div>
	);
}

export default YearView;
