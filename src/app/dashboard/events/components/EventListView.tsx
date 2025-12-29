"use client";

import { Event } from "@/lib/models/Event";
import { endOfWeek, format, getMonth, getWeek, getYear, isPast, isThisWeek, isToday, startOfWeek } from "date-fns";
import { ChevronDown, ChevronRight, ChevronUp, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import EventsListEmptyState from "./EmptyState";

interface EventListViewProps {
	events: Event[];
}

interface GroupedEvents {
	year: number;
	months: {
		month: number;
		monthName: string;
		weeks: {
			weekNumber: number;
			weekStart: Date;
			weekEnd: Date;
			events: Event[];
		}[];
	}[];
}

function groupEventsByTime(events: Event[]): GroupedEvents[] {
	const sorted = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

	const grouped: Map<number, Map<number, Map<number, Event[]>>> = new Map();

	sorted.forEach((event) => {
		const date = new Date(event.startTime);
		const year = getYear(date);
		const month = getMonth(date);
		const week = getWeek(date, { weekStartsOn: 1 });

		if (!grouped.has(year)) grouped.set(year, new Map());
		if (!grouped.get(year)!.has(month)) grouped.get(year)!.set(month, new Map());
		if (!grouped.get(year)!.get(month)!.has(week)) grouped.get(year)!.get(month)!.set(week, []);

		grouped.get(year)!.get(month)!.get(week)!.push(event);
	});

	const result: GroupedEvents[] = [];

	grouped.forEach((months, year) => {
		const yearData: GroupedEvents = { year, months: [] };

		months.forEach((weeks, month) => {
			const monthData = {
				month,
				monthName: format(new Date(year, month, 1), "MMMM"),
				weeks: [] as GroupedEvents["months"][0]["weeks"],
			};

			weeks.forEach((events, weekNumber) => {
				const firstEventDate = new Date(events[0].startTime);
				const weekStart = startOfWeek(firstEventDate, {
					weekStartsOn: 1,
				});
				const weekEnd = endOfWeek(firstEventDate, { weekStartsOn: 1 });

				monthData.weeks.push({
					weekNumber,
					weekStart,
					weekEnd,
					events,
				});
			});

			monthData.weeks.sort((a, b) => a.weekNumber - b.weekNumber);
			yearData.months.push(monthData);
		});

		yearData.months.sort((a, b) => a.month - b.month);
		result.push(yearData);
	});

	return result.sort((a, b) => a.year - b.year);
}

export function EventListView({ events }: EventListViewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeSection, setActiveSection] = useState<string>("");
	const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

	const groupedEvents = useMemo(() => groupEventsByTime(events), [events]);

	// Initialize with current year expanded
	useEffect(() => {
		const currentYear = new Date().getFullYear();
		setExpandedYears(new Set([currentYear]));

		// Find and scroll to current/next upcoming week
		const now = new Date();
		for (const yearGroup of groupedEvents) {
			for (const monthGroup of yearGroup.months) {
				for (const weekGroup of monthGroup.weeks) {
					if (weekGroup.weekEnd >= now) {
						const sectionId = `week-${yearGroup.year}-${monthGroup.month}-${weekGroup.weekNumber}`;
						setActiveSection(sectionId);
						setTimeout(() => {
							document.getElementById(sectionId)?.scrollIntoView({
								behavior: "smooth",
								block: "start",
							});
						}, 100);
						return;
					}
				}
			}
		}
	}, [groupedEvents]);

	const scrollToSection = (sectionId: string) => {
		setActiveSection(sectionId);
		document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const toggleYear = (year: number) => {
		setExpandedYears((prev) => {
			const next = new Set(prev);
			if (next.has(year)) {
				next.delete(year);
			} else {
				next.add(year);
			}
			return next;
		});
	};

	if (events.length === 0) {
		return <EventsListEmptyState />;
	}

	return (
		<div className="flex gap-6 p-4 h-[calc(100vh-14rem)]">
			{/* Events List */}
			<div ref={containerRef} className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
				{groupedEvents.map((yearGroup) => (
					<div key={yearGroup.year}>
						{/* Year Header */}
						<div id={`year-${yearGroup.year}`} className="sticky top-0 z-20 backdrop-blur-xs py-2">
							<h2 className="text-2xl font-bold text-white">{yearGroup.year}</h2>
						</div>

						{yearGroup.months.map((monthGroup) => (
							<div key={monthGroup.month} className="mb-8">
								{/* Month Header */}
								<div id={`month-${yearGroup.year}-${monthGroup.month}`} className="sticky top-12 z-10 backdrop-blur-xs py-2">
									<h3 className="text-lg font-semibold">{monthGroup.monthName}</h3>
								</div>

								{monthGroup.weeks.map((weekGroup) => {
									const isCurrentWeek = isThisWeek(weekGroup.weekStart, {
										weekStartsOn: 1,
									});

									return (
										<div
											key={weekGroup.weekNumber}
											id={`week-${yearGroup.year}-${monthGroup.month}-${weekGroup.weekNumber}`}
											className="mb-6">
											{/* Week Header */}
											<div className="flex items-center gap-4 mb-3">
												<div className="flex-1 h-px bg-white/10" />
												<span className={`text-xs ${isCurrentWeek ? "text-accent font-medium" : "text-muted"}`}>
													Week {weekGroup.weekNumber} · {format(weekGroup.weekStart, "MMM d")} - {format(weekGroup.weekEnd, "MMM d")}
													{isCurrentWeek && " · Now"}
												</span>
												<div className="flex-1 h-px bg-white/10" />
											</div>

											{/* Events */}
											<div className="space-y-2 ml-1">
												{weekGroup.events.map((event) => (
													<EventListItem key={event.id} event={event} />
												))}
											</div>
										</div>
									);
								})}
							</div>
						))}
					</div>
				))}
			</div>

			{/* Timeline Navigation Sidebar */}
			<div className="w-48 shrink-0 hidden lg:block">
				<div className="sticky top-0 space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2 scrollbar-thin">
					{groupedEvents.map((yearGroup) => (
						<div key={yearGroup.year}>
							{/* Year Header */}
							<button
								onClick={() => toggleYear(yearGroup.year)}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
									expandedYears.has(yearGroup.year) ? "text-white bg-white/5" : "text-muted hover:text-white hover:bg-white/5"
								}`}>
								<span>{yearGroup.year}</span>
								{expandedYears.has(yearGroup.year) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
							</button>

							{/* Months & Weeks */}
							{expandedYears.has(yearGroup.year) && (
								<div className="ml-2 border-l border-white/10 pl-2 mt-1 space-y-1">
									{yearGroup.months.map((monthGroup) => (
										<div key={monthGroup.month}>
											{/* Month */}
											<button
												onClick={() => scrollToSection(`month-${yearGroup.year}-${monthGroup.month}`)}
												className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
													activeSection.includes(`${yearGroup.year}-${monthGroup.month}`)
														? "text-accent"
														: "text-muted hover:text-white"
												}`}>
												{monthGroup.monthName}
											</button>

											{/* Weeks */}
											<div className="ml-2 space-y-0.5">
												{monthGroup.weeks.map((weekGroup) => {
													const sectionId = `week-${yearGroup.year}-${monthGroup.month}-${weekGroup.weekNumber}`;
													const isCurrentWeek = isThisWeek(weekGroup.weekStart, {
														weekStartsOn: 1,
													});

													return (
														<button
															key={weekGroup.weekNumber}
															onClick={() => scrollToSection(sectionId)}
															className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors flex items-center gap-1.5 ${
																activeSection === sectionId
																	? "text-accent bg-accent/10"
																	: isCurrentWeek
																	? "text-white bg-white/5"
																	: "text-muted/70 hover:text-white"
															}`}>
															{isCurrentWeek && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
															<span>Week {weekGroup.weekNumber}</span>
															<span className="text-muted/50 ml-auto">{weekGroup.events.length}</span>
														</button>
													);
												})}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function EventListItem({ event }: { event: Event }) {
	const date = new Date(event.startTime);
	const isPastEvent = isPast(date) && !isToday(date);
	const isTodayEvent = isToday(date);

	return (
		<Link href={`/dashboard/events/${event.id}`} className="group block">
			<div
				className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
					isPastEvent
						? "bg-white/2 border-white/5 opacity-60 hover:opacity-100"
						: isTodayEvent
						? "bg-accent/5 border-accent/20 hover:border-accent/40"
						: "bg-white/5 border-white/5 hover:border-accent/30 hover:bg-white/[0.07]"
				}`}>
				{/* Date Badge */}
				<div
					className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border shrink-0 transition-colors ${
						isTodayEvent ? "bg-accent/20 border-accent/30" : "bg-background border-white/10 group-hover:border-white/20"
					}`}>
					<span className={`text-lg font-bold leading-none ${isTodayEvent ? "text-accent" : "text-white"}`}>{date.getDate()}</span>
					<span className="text-[10px] font-bold text-muted uppercase mt-0.5">{date.toLocaleString("default", { month: "short" })}</span>
				</div>

				{/* Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="text-base font-bold text-white truncate group-hover:text-accent transition-colors">{event.name}</h3>
						{isTodayEvent && <span className="px-1.5 py-0.5 rounded bg-accent text-white text-[10px] font-bold shrink-0">TODAY</span>}
					</div>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
						<span className="flex items-center gap-1.5">
							<Clock size={12} />
							{date.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
						{event.location && (
							<span className="flex items-center gap-1.5">
								<MapPin size={12} />
								{event.location.name}
							</span>
						)}
						<span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{event.type}</span>
					</div>
				</div>

				{/* Right Side */}
				<div className="hidden sm:flex items-center gap-4">
					<ChevronRight size={18} className="text-muted group-hover:text-white transition-colors" />
				</div>
			</div>
		</Link>
	);
}

export default EventListView;
