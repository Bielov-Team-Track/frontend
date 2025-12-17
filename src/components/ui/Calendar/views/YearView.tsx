import { Button } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import {
	addYears,
	eachDayOfInterval,
	endOfMonth,
	endOfYear,
	format,
	getDay,
	getYear,
	isBefore,
	isSameDay,
	isToday,
	startOfDay,
	startOfMonth,
	startOfYear,
	subYears,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ViewComponentProps } from "./ViewProps";

const MONTHS = [
	"January", "February", "March", "April",
	"May", "June", "July", "August",
	"September", "October", "November", "December",
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function YearView({
	events,
	date,
	onEventClick,
	onViewChange,
}: ViewComponentProps) {
	const [currentDate, setCurrentDate] = useState(date);

	useEffect(() => {
		setCurrentDate(date);
	}, [date]);

	const handlePrevYear = () => setCurrentDate(subYears(currentDate, 1));
	const handleNextYear = () => setCurrentDate(addYears(currentDate, 1));

	const getEventsForDate = (dateToCheck: Date) => {
		return events.filter((event) => isSameDay(new Date(event.startTime), dateToCheck));
	};

	const year = getYear(currentDate);

	// Filter and sort events for the current year
	const yearEvents = useMemo(() => {
		const yearStart = startOfYear(new Date(year, 0, 1));
		const yearEnd = endOfYear(new Date(year, 0, 1));

		return events
			.filter((event) => {
				const eventDate = new Date(event.startTime);
				return eventDate >= yearStart && eventDate <= yearEnd;
			})
			.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
	}, [events, year]);

	return (
		<div className="w-full h-full flex flex-col border border-white/5 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
			{/* Header - consistent with MonthView/WeekView */}
			<div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
				<h2 className="text-2xl font-bold text-white tracking-tight">
					{year}
				</h2>
				<div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
					<Button
						size="sm"
						variant="ghost"
						color="neutral"
						onClick={handlePrevYear}
						className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white rounded-md">
						<ChevronLeft size={16} />
					</Button>
					<div className="w-[1px] h-4 bg-white/10 mx-1" />
					<Button
						size="sm"
						variant="ghost"
						color="neutral"
						onClick={handleNextYear}
						className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white rounded-md">
						<ChevronRight size={16} />
					</Button>
				</div>
			</div>

			{/* Main content area */}
			<div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
				{/* Year Grid */}
				<div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
						{MONTHS.map((monthName, monthIndex) => (
							<MonthCard
								key={monthIndex}
								monthName={monthName}
								monthIndex={monthIndex}
								year={year}
								getEventsForDate={getEventsForDate}
								onViewChange={onViewChange}
							/>
						))}
					</div>
				</div>

				{/* Agenda Sidebar */}
				<div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col bg-white/[0.02]">
					<YearAgendaSidebar
						events={yearEvents}
						year={year}
						onEventClick={onEventClick}
						onViewChange={onViewChange}
					/>
				</div>
			</div>
		</div>
	);
}

function MonthCard({
	monthName,
	monthIndex,
	year,
	getEventsForDate,
	onViewChange,
}: {
	monthName: string;
	monthIndex: number;
	year: number;
	getEventsForDate: (date: Date) => Event[];
	onViewChange?: (view: "month" | "week" | "year", date: Date) => void;
}) {
	const start = startOfMonth(new Date(year, monthIndex));
	const end = endOfMonth(start);
	const daysInMonth = eachDayOfInterval({ start, end });
	const startDayOfWeek = getDay(start);

	const days = Array.from({ length: startDayOfWeek })
		.fill(null)
		.concat(daysInMonth);

	const handleMonthClick = () => {
		onViewChange?.("month", new Date(year, monthIndex, 1));
	};

	// Check if this month has any events
	const monthHasEvents = daysInMonth.some(day => getEventsForDate(day).length > 0);

	return (
		<div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200">
			{/* Month Header */}
			<button
				onClick={handleMonthClick}
				className="w-full flex items-center justify-between mb-3 group">
				<span className="text-sm font-bold text-white group-hover:text-accent transition-colors">
					{monthName}
				</span>
				{monthHasEvents && (
					<span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
				)}
			</button>

			{/* Day Labels */}
			<div className="grid grid-cols-7 gap-0.5 mb-1">
				{DAY_LABELS.map((label, i) => (
					<div
						key={i}
						className="text-[9px] text-muted/50 font-medium text-center py-1">
						{label}
					</div>
				))}
			</div>

			{/* Days Grid */}
			<div className="grid grid-cols-7 gap-0.5">
				{days.map((day, index) => {
					if (!day) {
						return <div key={`empty-${index}`} className="aspect-square" />;
					}

					const date = day as Date;
					const dayEvents = getEventsForDate(date);
					const isTodayDate = isToday(date);
					const hasEvents = dayEvents.length > 0;

					return (
						<button
							key={date.toISOString()}
							onClick={() => onViewChange?.("week", date)}
							className={`
								aspect-square flex items-center justify-center text-[11px] font-medium
								rounded-md transition-all duration-150 relative
								${isTodayDate
									? "bg-accent/20 text-accent ring-1 ring-accent/30"
									: "text-white/60 hover:bg-white/10 hover:text-white"
								}
							`}>
							{format(date, "d")}

							{/* Event indicator */}
							{hasEvents && (
								<span className={`
									absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full
									${isTodayDate ? "bg-accent" : "bg-white/40"}
								`} />
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

interface EventGroup {
	date: Date;
	dateKey: string;
	events: Event[];
	isPast: boolean;
	isToday: boolean;
}

function YearAgendaSidebar({
	events,
	year,
	onEventClick,
	onViewChange,
}: {
	events: Event[];
	year: number;
	onEventClick: (eventId: string) => void;
	onViewChange?: (view: "month" | "week" | "year", date: Date) => void;
}) {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const todayMarkerRef = useRef<HTMLDivElement>(null);

	// Group events by date
	const eventGroups = useMemo(() => {
		const groups: Map<string, EventGroup> = new Map();
		const today = startOfDay(new Date());

		events.forEach((event) => {
			const eventDate = startOfDay(new Date(event.startTime));
			const dateKey = format(eventDate, "yyyy-MM-dd");

			if (!groups.has(dateKey)) {
				groups.set(dateKey, {
					date: eventDate,
					dateKey,
					events: [],
					isPast: isBefore(eventDate, today),
					isToday: isToday(eventDate),
				});
			}
			groups.get(dateKey)!.events.push(event);
		});

		return Array.from(groups.values()).sort(
			(a, b) => a.date.getTime() - b.date.getTime()
		);
	}, [events]);

	// Find the first non-past group index for scroll target
	const firstUpcomingIndex = useMemo(() => {
		const idx = eventGroups.findIndex((g) => !g.isPast);
		return idx >= 0 ? idx : eventGroups.length;
	}, [eventGroups]);

	const pastCount = firstUpcomingIndex;
	const upcomingCount = eventGroups.length - firstUpcomingIndex;

	// Auto-scroll to today/upcoming on mount
	useEffect(() => {
		if (todayMarkerRef.current && scrollContainerRef.current) {
			const container = scrollContainerRef.current;
			const marker = todayMarkerRef.current;

			// Small delay to ensure DOM is ready
			requestAnimationFrame(() => {
				const markerTop = marker.offsetTop;
				container.scrollTo({
					top: Math.max(0, markerTop - 16),
					behavior: "smooth",
				});
			});
		}
	}, [eventGroups, year]);

	return (
		<>
			{/* Sidebar Header */}
			<div className="p-5 border-b border-white/5">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
						<CalendarDays size={18} className="text-accent" />
					</div>
					<div className="flex-1">
						<h3 className="text-base font-bold text-white">
							{year} Events
						</h3>
						<p className="text-sm text-muted">
							{events.length} {events.length === 1 ? "event" : "events"} total
						</p>
					</div>
				</div>

				{/* Stats pills */}
				{events.length > 0 && (
					<div className="flex gap-2 mt-4">
						<span className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-muted">
							{pastCount} past
						</span>
						<span className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
							{upcomingCount} upcoming
						</span>
					</div>
				)}
			</div>

			{/* Events List */}
			<div
				ref={scrollContainerRef}
				className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
				{eventGroups.length > 0 ? (
					<div className="p-4 space-y-2">
						{eventGroups.map((group, index) => (
							<div key={group.dateKey}>
								{/* Today marker - scroll target */}
								{index === firstUpcomingIndex && (
									<div
										ref={todayMarkerRef}
										className="sticky top-0 z-10 py-3 -mx-4 px-4 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a] to-transparent">
										<div className="flex items-center gap-3">
											<div className="h-px flex-1 bg-accent/30" />
											<span className="text-xs font-bold text-accent uppercase tracking-wider">
												{pastCount > 0 ? "Upcoming" : "Events"}
											</span>
											<div className="h-px flex-1 bg-accent/30" />
										</div>
									</div>
								)}

								<DateGroup
									group={group}
									onEventClick={onEventClick}
									onViewChange={onViewChange}
								/>
							</div>
						))}

						{/* End padding */}
						<div className="h-4" />
					</div>
				) : (
					<EmptyYearState year={year} />
				)}
			</div>
		</>
	);
}

function DateGroup({
	group,
	onEventClick,
	onViewChange,
}: {
	group: EventGroup;
	onEventClick: (eventId: string) => void;
	onViewChange?: (view: "month" | "week" | "year", date: Date) => void;
}) {
	return (
		<div className={`transition-all duration-200 ${group.isPast ? "opacity-50" : ""}`}>
			{/* Date Header */}
			<button
				onClick={() => onViewChange?.("week", group.date)}
				className="w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors group">
				{/* Date badge */}
				<div className={`
					w-12 h-12 flex flex-col items-center justify-center
					${group.isToday
						? "bg-accent text-white"
						: group.isPast
							? "bg-white/5 text-muted"
							: "bg-white/8 text-white group-hover:bg-white/10"
					}
				`}>
					<span className="text-[11px] font-semibold uppercase leading-none">
						{format(group.date, "MMM")}
					</span>
					<span className="text-lg font-bold leading-tight">
						{format(group.date, "d")}
					</span>
				</div>

				{/* Date info */}
				<div className="flex-1 text-left">
					<p className={`text-sm font-semibold ${group.isToday ? "text-accent" : "text-white"}`}>
						{group.isToday ? "Today" : format(group.date, "EEEE")}
					</p>
					<p className="text-xs text-muted mt-0.5">
						{group.events.length} {group.events.length === 1 ? "event" : "events"}
					</p>
				</div>
			</button>

			{/* Events for this date */}
			<div className="ml-14 space-y-1.5 pb-3 pr-2">
				{group.events.map((event) => (
					<CompactEventCard
						key={event.id}
						event={event}
						isPast={group.isPast}
						onClick={() => onEventClick(event.id)}
					/>
				))}
			</div>
		</div>
	);
}

function CompactEventCard({
	event,
	isPast,
	onClick,
}: {
	event: Event;
	isPast: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className={`
				w-full text-left p-2.5 border-b transition-all duration-150 group
				${isPast
					? "border-white/5 hover:bg-white/5"
					: "border-white/5 hover:bg-white/8"
				}
			`}>
			<div className="flex items-start gap-3">
				{/* Time */}
				<span className={`text-xs font-medium min-w-[3rem] ${isPast ? "text-muted/60" : "text-white/50"}`}>
					{format(new Date(event.startTime), "HH:mm")}
				</span>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<h4 className={`
						text-sm font-medium truncate transition-colors
						${isPast
							? "text-muted/80 group-hover:text-muted"
							: "text-white group-hover:text-accent"
						}
					`}>
						{event.name}
					</h4>

					{event.location && (
						<span className="inline-flex items-center gap-1.5 text-xs text-muted/60 mt-1">
							<MapPin size={12} />
							<span className="truncate max-w-[140px]">{event.location.name}</span>
						</span>
					)}
				</div>
			</div>
		</button>
	);
}

function EmptyYearState({ year }: { year: number }) {
	return (
		<div className="h-full flex flex-col items-center justify-center text-center p-6">
			<div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
				<Clock size={20} className="text-muted/50" />
			</div>
			<p className="text-sm text-muted mb-1">No events in {year}</p>
			<p className="text-xs text-muted/60">
				Events will appear here as they are scheduled
			</p>
		</div>
	);
}

export default YearView;
