import { Button } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import {
	addWeeks,
	differenceInMinutes,
	eachDayOfInterval,
	endOfWeek,
	format,
	getHours,
	getMinutes,
	isSameDay,
	isToday,
	startOfWeek,
	subWeeks,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ViewComponentProps } from "./ViewProps";

const HOUR_HEIGHT = 40;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function WeekView({ events, date, scrollToNow, onEventClick }: ViewComponentProps) {
	const [currentDate, setCurrentDate] = useState(date);
	const [slideDirection, setSlideDirection] = useState<
		"left" | "right" | null
	>(null);
	const [shouldScroll, setShouldScroll] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const now = new Date();

	const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
	const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
	const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

	const currentHour = getHours(now);
	const currentMinutes = getMinutes(now);
	const timeIndicatorPosition =
		currentHour * HOUR_HEIGHT + (currentMinutes / 60) * HOUR_HEIGHT;

	useEffect(() => {
		setCurrentDate(date);
	}, [date]);

	// Trigger scroll after animation completes (for week navigation only)
	useEffect(() => {
		if (
			slideDirection === null &&
			shouldScroll &&
			scrollContainerRef.current
		) {
			setShouldScroll(false);

			// Calculate scroll position based on week's events
			const weekEvents = events.filter((event) => {
				const eventStart = new Date(event.startTime);
				return eventStart >= weekStart && eventStart <= weekEnd;
			});

			let scrollPosition = 0;

			if (weekEvents.length > 0) {
				// Find earliest event start time
				const earliestEvent = weekEvents.reduce((earliest, event) => {
					const eventStart = new Date(event.startTime);
					const earliestStart = new Date(earliest.startTime);
					return eventStart < earliestStart ? event : earliest;
				});

				const eventStart = new Date(earliestEvent.startTime);
				const startMinutes =
					getHours(eventStart) * 60 + getMinutes(eventStart);
				const eventPosition = (startMinutes / 60) * HOUR_HEIGHT;

				// Scroll to show the earliest event with some padding
				scrollPosition = Math.max(0, eventPosition - 50);
			} else {
				// Default to 8 AM if no events
				scrollPosition = 8 * HOUR_HEIGHT;
			}

			scrollContainerRef.current.scrollTo({
				top: scrollPosition,
				behavior: "smooth",
			});
		}
	}, [slideDirection, shouldScroll, weekStart, weekEnd, events]);

	const handlePrevWeek = () => {
		setSlideDirection("right");
		setShouldScroll(true);
		setCurrentDate(subWeeks(currentDate, 1));
	};

	const handleNextWeek = () => {
		setSlideDirection("left");
		setShouldScroll(true);
		setCurrentDate(addWeeks(currentDate, 1));
	};

	return (
		<div className="w-full h-full flex flex-col border border-white/5 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
			<WeekNavigation
				start={weekStart}
				end={weekEnd}
				onPrev={handlePrevWeek}
				onNext={handleNextWeek}
			/>

			<div className="flex-1 flex flex-col overflow-hidden border border-white/5 rounded-xl">
				<AnimatePresence
					mode="wait"
					initial={false}
					custom={slideDirection}
					onExitComplete={() => setSlideDirection(null)}>
					<motion.div
						key={weekStart.toISOString()}
						custom={slideDirection}
						variants={{
							enter: (direction: string) => ({
								x:
									direction === "left"
										? "5%"
										: direction === "right"
										? "-5%"
										: 0,
								opacity: 0.3,
							}),
							center: {
								x: 0,
								opacity: 1,
							},
							exit: (direction: string) => ({
								x:
									direction === "left"
										? "-5%"
										: direction === "right"
										? "5%"
										: 0,
								opacity: 0.3,
							}),
						}}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{
							duration: 0.15,
							ease: "easeInOut",
						}}
						className="flex-1 flex flex-col min-h-0">
						<DaysHeader days={weekDays} />

						<TimeGrid
							days={weekDays}
							hours={HOURS}
							hourHeight={HOUR_HEIGHT}
							currentTime={{
								hour: currentHour,
								minutes: currentMinutes,
								position: timeIndicatorPosition,
							}}
							events={events}
							scrollRef={scrollContainerRef}
							onEventClick={onEventClick}
						/>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}

function WeekNavigation({
	start,
	end,
	onPrev,
	onNext,
}: {
	start: Date;
	end: Date;
	onPrev: () => void;
	onNext: () => void;
}) {
	return (
		<div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/2">
			<h2 className="text-2xl font-bold text-white tracking-tight">
				{start.getMonth() != end.getMonth()
					? format(start, "MMMM") + " - " + format(end, "MMMM yyyy")
					: format(end, "MMMM yyyy")}
			</h2>
			<div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
				<Button
					size="sm"
					variant="ghost"
					color="neutral"
					onClick={onPrev}
					className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white rounded-md">
					<ChevronLeft size={16} />
				</Button>

				<div className="w-px h-4 bg-white/10 mx-1"></div>
				<Button
					onClick={onNext}
					variant="ghost"
					color="neutral"
					size="sm"
					className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white rounded-md">
					<ChevronRight size={16} />
				</Button>
			</div>
		</div>
	);
}

function DaysHeader({ days }: { days: Date[] }) {
	return (
		<div className="flex mb-2 pr-4 border-b border-white/5 pb-2 pt-2 bg-white/5">
			<div className="w-16 shrink-0" />
			<div className="flex-1 grid grid-cols-7">
				{days.map((day) => (
					<div
						key={day.toISOString()}
						className={`text-center p-2 rounded-lg mx-1 transition-colors ${
							isToday(day) ? "bg-accent/10" : ""
						}`}>
						<div
							className={`text-xs font-bold uppercase tracking-wider mb-1 ${
								isToday(day) ? "text-accent" : "text-muted"
							}`}>
							{format(day, "EEE")}
						</div>
						<div
							className={`text-sm font-bold ${
								isToday(day) ? "text-white" : "text-white/80"
							}`}>
							{format(day, "d")}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function TimeGrid({
	days,
	hours,
	hourHeight,
	currentTime,
	events,
	scrollRef,
	onEventClick,
}: {
	days: Date[];
	hours: number[];
	hourHeight: number;
	currentTime: { hour: number; minutes: number; position: number };
	events: Event[];
	scrollRef: React.RefObject<HTMLDivElement | null>;
	onEventClick: (eventId: string) => void;
}) {
	return (
		<div className="flex-1 flex overflow-hidden">
			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
				<div className="flex">
					<HoursColumn hours={hours} hourHeight={hourHeight} />
					<DaysGrid
						days={days}
						hours={hours}
						hourHeight={hourHeight}
						currentTime={currentTime}
						events={events}
						onEventClick={onEventClick}
					/>
				</div>
			</div>
		</div>
	);
}

function HoursColumn({
	hours,
	hourHeight,
}: {
	hours: number[];
	hourHeight: number;
}) {
	return (
		<div className="w-16 shrink-0 border-r border-white/5 bg-white/2">
			{hours.map((hour) => (
				<div
					key={hour}
					style={{ height: hourHeight }}
					className="flex items-start justify-end pr-3 text-muted/60 text-[10px] font-medium pt-1">
					{format(new Date().setHours(hour, 0, 0, 0), "ha")}
				</div>
			))}
		</div>
	);
}

function DaysGrid({
	days,
	hours,
	hourHeight,
	currentTime,
	events,
	onEventClick,
}: {
	days: Date[];
	hours: number[];
	hourHeight: number;
	currentTime: { hour: number; minutes: number; position: number };
	events: Event[];
	onEventClick: (eventId: string) => void;
}) {
	// Filter events for each day and calculate positions
	const getEventsForDay = (day: Date) => {
		return events
			.filter((event) => {
				const eventStart = new Date(event.startTime);
				return isSameDay(eventStart, day);
			})
			.map((event) => {
				const eventStart = new Date(event.startTime);
				const eventEnd = new Date(event.endTime);
				const startMinutes =
					getHours(eventStart) * 60 + getMinutes(eventStart);
				const durationMinutes = differenceInMinutes(
					eventEnd,
					eventStart
				);

				return {
					event,
					top: (startMinutes / 60) * hourHeight,
					height: (durationMinutes / 60) * hourHeight,
				};
			});
	};

	return (
		<div className="flex-1 grid grid-cols-7 relative">
			{days.map((day) => {
				const dayEvents = getEventsForDay(day);

				return (
					<div
						key={day.toISOString()}
						className="flex flex-col relative border-r border-white/5 last:border-r-0">
						{hours.map((hour) => (
							<div
								key={`${day.toISOString()}-${hour}`}
								style={{ height: hourHeight }}
								className="border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer"
							/>
						))}

						{/* Render events for this day */}
						{dayEvents.map(({ event, top, height }) => (
							<EventBlock
								key={event.id}
								event={event}
								top={top}
								height={height}
								onClick={() => onEventClick(event.id)}
							/>
						))}

						{/* Current time indicator */}
						{isToday(day) && (
							<div
								className="absolute left-0 right-0 z-10 pointer-events-none"
								style={{ top: `${currentTime.position}px` }}>
								<div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-background shadow-xs" />
								<div className="h-[2px] bg-accent w-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

// Size thresholds for adaptive content
const SIZE = {
	COMPACT: 28,    // Just show time + name inline
	SMALL: 42,      // Show name only
	MEDIUM: 60,     // Show name + time
	LARGE: 85,      // Show name + time + location
} as const;

function EventBlock({
	event,
	top,
	height,
	onClick,
}: {
	event: Event;
	top: number;
	height: number;
	onClick: () => void;
}) {
	const actualHeight = Math.max(height, 22);
	const isCompact = actualHeight < SIZE.COMPACT;
	const isSmall = actualHeight < SIZE.SMALL;
	const isMedium = actualHeight < SIZE.MEDIUM;
	const isLarge = actualHeight >= SIZE.LARGE;

	return (
		<motion.div
			initial={{ opacity: 0, x: -8, scale: 0.98 }}
			animate={{ opacity: 1, x: 0, scale: 1 }}
			whileHover={{ backgroundColor: "rgba(60, 60, 70, 1)" }}
			transition={{
				duration: 0.25,
				ease: [0.25, 0.46, 0.45, 0.94],
				delay: 0.02
			}}
			onClick={onClick}
			style={{
				top: `${top}px`,
				height: `${actualHeight}px`,
			}}
			className="
				absolute left-0.5 right-0.5 z-20 cursor-pointer
				overflow-hidden
				bg-[#2a2a32]
				border-b border-white/5
				group
			">
			{/* Content container */}
			<div className={`
				h-full flex flex-col justify-center
				px-2
				${isCompact ? "py-0" : "py-1"}
			`}>
				{/* Compact: time + name inline */}
				{isCompact ? (
					<div className="flex items-center gap-2">
						<span className="text-[11px] font-medium text-white/50 shrink-0">
							{format(new Date(event.startTime), "H:mm")}
						</span>
						<span className="text-[11px] font-medium text-white truncate">
							{event.name}
						</span>
					</div>
				) : (
					<>
						{/* Event name */}
						<div className={`
							font-medium text-white truncate leading-tight
							${isSmall ? "text-xs" : "text-[13px]"}
						`}>
							{event.name}
						</div>

						{/* Time row */}
						{!isSmall && (
							<div className="flex items-center gap-2 mt-0.5">
								<span className={`font-normal text-white/50 ${isMedium ? "text-[11px]" : "text-xs"}`}>
									{format(new Date(event.startTime), "H:mm")}
									{!isMedium && (
										<span className="text-white/30"> – {format(new Date(event.endTime), "H:mm")}</span>
									)}
								</span>
							</div>
						)}

						{/* Location - only on large sizes */}
						{isLarge && event.location && (
							<div className="flex items-center gap-1.5 mt-1">
								<MapPin size={11} className="text-white/40 shrink-0" />
								<span className="text-[11px] text-white/40 truncate">
									{event.location.name}
								</span>
							</div>
						)}
					</>
				)}
			</div>

			{/* Accent indicator on hover */}
			<div className="
				absolute left-0 top-0 bottom-0 w-[2px]
				bg-accent opacity-0 group-hover:opacity-100
				transition-opacity duration-150
			" />
		</motion.div>
	);
}

export default WeekView;
