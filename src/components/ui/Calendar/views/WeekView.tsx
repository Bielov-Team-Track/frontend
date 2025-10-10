import {
	addWeeks,
	eachDayOfInterval,
	endOfWeek,
	format,
	getHours,
	getMinutes,
	isToday,
	startOfWeek,
	subWeeks,
	isSameDay,
	differenceInMinutes,
	parseISO,
} from "date-fns";
import { useState, useEffect, useRef } from "react";
import { ViewComponentProps } from "./ViewProps";
import { Button } from "@/components/ui";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Event } from "@/lib/models/Event";

const HOUR_HEIGHT = 40;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function WeekView({ events, date, scrollToNow }: ViewComponentProps) {
	const [currentDate, setCurrentDate] = useState(date);
	const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
		null,
	);
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
		if (slideDirection === null && shouldScroll && scrollContainerRef.current) {
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
				const startMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
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
		<div className="w-full h-full flex flex-col">
			<WeekNavigation
				start={weekStart}
				end={weekEnd}
				onPrev={handlePrevWeek}
				onNext={handleNextWeek}
			/>

			<div className="flex-1 flex flex-col overflow-hidden">
				<AnimatePresence
					mode="wait"
					initial={false}
					custom={slideDirection}
					onExitComplete={() => setSlideDirection(null)}
				>
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
						className="flex-1 flex flex-col min-h-0"
					>
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
		<div className="flex items-center mb-4">
			<Button
				size="sm"
				variant="ghost"
				color="neutral"
				onClick={onPrev}
				className="px-3 py-1"
			>
				<FaChevronLeft />
			</Button>
			<Button onClick={onNext} variant="ghost" color="neutral" size="sm">
				<FaChevronRight />
			</Button>
			<span className="text-foreground-content font-semibold">
				{start.getMonth() != end.getMonth()
					? format(start, "MMMM") + " - " + format(end, "MMMM yyyy")
					: format(end, "MMMM yyyy")}
			</span>
		</div>
	);
}

function DaysHeader({ days }: { days: Date[] }) {
	return (
		<div className="flex mb-2 pr-4">
			<div className="w-16 flex-shrink-0" />
			<div className="flex-1 grid grid-cols-7">
				{days.map((day) => (
					<div
						key={day.toISOString()}
						className={`text-foreground-content text-center p-2  rounded ${
							isToday(day) && "border border-accent bg-accent/10"
						}`}
					>
						<div className="text-sm">{format(day, "d")}</div>
						<div className="font-semibold">{format(day, "EEE")}</div>
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
}: {
	days: Date[];
	hours: number[];
	hourHeight: number;
	currentTime: { hour: number; minutes: number; position: number };
	events: Event[];
	scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
	return (
		<div className="flex-1 flex overflow-hidden">
			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground-content/20 scrollbar-track-transparent"
			>
				<div className="flex">
					<HoursColumn hours={hours} hourHeight={hourHeight} />
					<DaysGrid
						days={days}
						hours={hours}
						hourHeight={hourHeight}
						currentTime={currentTime}
						events={events}
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
		<div className="w-16 flex-shrink-0">
			{hours.map((hour) => (
				<div
					key={hour}
					style={{ height: hourHeight }}
					className="flex items-start justify-end pr-2 text-foreground-content/60 text-xs border-b border-muted/20"
				>
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
}: {
	days: Date[];
	hours: number[];
	hourHeight: number;
	currentTime: { hour: number; minutes: number; position: number };
	events: Event[];
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
				const startMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
				const durationMinutes = differenceInMinutes(eventEnd, eventStart);

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
					<div key={day.toISOString()} className="flex flex-col relative">
						{hours.map((hour) => (
							<div
								key={`${day.toISOString()}-${hour}`}
								style={{ height: hourHeight }}
								className="border border-t-0 border-muted/20 hover:-content/5 cursor-pointer"
							/>
						))}

						{/* Render events for this day */}
						{dayEvents.map(({ event, top, height }) => (
							<div
								key={event.id}
								className="absolute left-1 right-1 bg-primary text-primary-content rounded px-1 py-0.5 text-xs overflow-hidden z-20 cursor-pointer hover:brightness-110"
								style={{ top: `${top}px`, height: `${Math.max(height, 20)}px` }}
							>
								<div className="font-semibold truncate">{event.name}</div>
								<div className="text-[10px] opacity-80">
									{format(new Date(event.startTime), "h:mm a")}
								</div>
							</div>
						))}

						{/* Current time indicator */}
						{isToday(day) && (
							<div
								className="absolute left-0 right-0 h-0.5 bg-accent z-10"
								style={{ top: `${currentTime.position}px` }}
							>
								<span className="text-accent absolute -top-4 right-1 text-xs">
									{currentTime.hour}:
									{currentTime.minutes.toString().padStart(2, "0")}
								</span>
								<div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-accent" />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

export default WeekView;
