"use client";

import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Grid3x3,
	LayoutGrid,
	List,
	MapPin,
	Plus,
	Users,
} from "lucide-react";
import { useState } from "react";

// --- Types & Mock Data ---
type ViewMode = "month" | "week" | "year";
type EventType = "match" | "training" | "tournament" | "social";

interface CalendarEvent {
	id: number;
	title: string;
	type: EventType;
	date: number; // Day of month
	month: number; // 0-11
	startHour: number; // 0-23
	durationHours: number;
	location: string;
	attendees?: number;
}

// Mock Events for October (Month 9)
const EVENTS: CalendarEvent[] = [
	{
		id: 1,
		title: "League Match vs Durham",
		type: "match",
		date: 14,
		month: 9,
		startHour: 20,
		durationHours: 2,
		location: "Home Arena",
		attendees: 12,
	},
	{
		id: 2,
		title: "Team Practice",
		type: "training",
		date: 14,
		month: 9,
		startHour: 18,
		durationHours: 1.5,
		location: "Training Hall B",
		attendees: 14,
	},
	{
		id: 3,
		title: "Winter Cup Day 1",
		type: "tournament",
		date: 24,
		month: 9,
		startHour: 9,
		durationHours: 8,
		location: "Sport Central",
	},
	{
		id: 4,
		title: "Winter Cup Day 2",
		type: "tournament",
		date: 25,
		month: 9,
		startHour: 9,
		durationHours: 8,
		location: "Sport Central",
	},
	{
		id: 5,
		title: "Team Dinner",
		type: "social",
		date: 28,
		month: 9,
		startHour: 19.5,
		durationHours: 2,
		location: "Nandos",
	},
	{
		id: 6,
		title: "S&C Session",
		type: "training",
		date: 16,
		month: 9,
		startHour: 17,
		durationHours: 1,
		location: "Club Gym",
		attendees: 8,
	},
	// A few events for other views logic
	{
		id: 7,
		title: "Morning Run",
		type: "training",
		date: 15,
		month: 9,
		startHour: 7,
		durationHours: 1,
		location: "Park",
	},
];

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 to 22:00

export default function PlannerPage() {
	const [view, setView] = useState<ViewMode>("month");
	const [selectedDate, setSelectedDate] = useState<number>(14);
	const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // October
	const [currentYear, setCurrentYear] = useState(2025);

	// Filter events for the selected day (Right Panel)
	const selectedDayEvents = EVENTS.filter(
		(e) => e.date === selectedDate && e.month === currentMonthIndex
	).sort((a, b) => a.startHour - b.startHour);

	return (
		<div className="h-screen bg-base-100 text-gray-100 font-sans flex overflow-hidden">
			{/* --- LEFT: MAIN CALENDAR AREA --- */}
			<div className="flex-1 flex flex-col p-6 pr-0 overflow-hidden">
				{/* Header Control Bar */}
				<div className="flex justify-between items-center mb-6 pr-6">
					<div className="flex items-center gap-4">
						<h1 className="text-3xl font-bold text-white tracking-tight">
							{view === "year"
								? currentYear
								: `${MONTHS[currentMonthIndex]} ${currentYear}`}
						</h1>

						{/* Date Navigation */}
						<div className="flex items-center bg-[#1E1E1E] rounded-lg border border-white/5 p-1">
							<button
								onClick={() =>
									setCurrentMonthIndex((prev) =>
										prev === 0 ? 11 : prev - 1
									)
								}
								className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white">
								<ChevronLeft size={20} />
							</button>
							<button
								onClick={() =>
									setCurrentMonthIndex((prev) =>
										prev === 11 ? 0 : prev + 1
									)
								}
								className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white">
								<ChevronRight size={20} />
							</button>
						</div>
					</div>

					<div className="flex items-center gap-3">
						{/* View Switcher */}
						<div className="flex bg-[#1E1E1E] rounded-lg border border-white/5 p-1">
							<ViewBtn
								icon={Grid3x3}
								active={view === "year"}
								onClick={() => setView("year")}
							/>
							<ViewBtn
								icon={LayoutGrid}
								active={view === "month"}
								onClick={() => setView("month")}
							/>
							<ViewBtn
								icon={List}
								active={view === "week"}
								onClick={() => setView("week")}
							/>
						</div>

						<div className="h-6 w-[1px] bg-white/10 mx-2"></div>

						<button className="btn btn-sm bg-accent text-white border-none gap-2 hover:bg-accent/90 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
							<Plus size={16} />{" "}
							<span className="hidden md:inline">Add Event</span>
						</button>
					</div>
				</div>

				{/* --- VIEW CONTENT --- */}
				<div className="flex-1 overflow-hidden pr-6 pb-2 relative">
					{/* 1. MONTH VIEW */}
					{view === "month" && (
						<div className="h-full flex flex-col">
							<div className="grid grid-cols-7 mb-2">
								{WEEKDAYS.map((day) => (
									<div
										key={day}
										className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center py-2">
										{day}
									</div>
								))}
							</div>
							<div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2">
								{Array.from({ length: 35 }).map((_, i) => {
									const dayNum = i - 1;
									const isCurrentMonth =
										dayNum > 0 && dayNum <= 31;
									const hasEvents = isCurrentMonth
										? EVENTS.filter(
												(e) =>
													e.date === dayNum &&
													e.month ===
														currentMonthIndex
										  )
										: [];
									const isSelected = dayNum === selectedDate;

									return (
										<div
											key={i}
											onClick={() =>
												isCurrentMonth &&
												setSelectedDate(dayNum)
											}
											className={`
                          relative rounded-xl border p-2 flex flex-col justify-between transition-all group
                          ${
								!isCurrentMonth
									? "border-transparent opacity-20 cursor-default"
									: "cursor-pointer"
							}
                          ${
								isSelected
									? "bg-white/5 border-accent/50 ring-1 ring-accent/50"
									: "bg-[#161616] border-white/5 hover:border-white/20 hover:bg-[#1E1E1E]"
							}
                        `}>
											{isCurrentMonth && (
												<>
													<span
														className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
															dayNum === 14
																? "bg-primary text-white"
																: "text-gray-400"
														}`}>
														{dayNum}
													</span>
													<div className="space-y-1 mt-1">
														{hasEvents
															.slice(0, 3)
															.map((evt) => (
																<div
																	key={evt.id}
																	className={`h-1.5 rounded-full w-full ${getEventColor(
																		evt.type
																	)}`}></div>
															))}
													</div>
												</>
											)}
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* 2. WEEK VIEW */}
					{view === "week" && (
						<div className="h-full flex flex-col overflow-y-auto no-scrollbar bg-[#161616] rounded-xl border border-white/5">
							{/* Week Header */}
							<div className="grid grid-cols-8 sticky top-0 bg-[#1A1A1A] z-10 border-b border-white/10">
								<div className="p-4 text-xs text-gray-500 font-bold border-r border-white/5">
									TIME
								</div>
								{WEEKDAYS.map((day, i) => (
									<div
										key={day}
										className={`p-3 text-center border-r border-white/5 ${
											selectedDate === 14 + i
												? "bg-white/5"
												: ""
										}`}>
										<div className="text-xs text-gray-500 font-bold uppercase">
											{day}
										</div>
										<div className="text-lg font-bold text-white">
											{14 + i}
										</div>
									</div>
								))}
							</div>

							{/* Week Grid */}
							<div className="grid grid-cols-8 relative">
								{/* Horizontal Hour Lines (Background) */}
								{HOURS.map((hour) => (
									<div
										key={hour}
										className="col-span-8 grid grid-cols-8 h-20 border-b border-white/5">
										<div className="border-r border-white/5 text-xs text-gray-500 p-2 text-right relative -top-3">
											{hour}:00
										</div>
										{/* 7 Day Columns */}
										{Array.from({ length: 7 }).map(
											(_, i) => (
												<div
													key={i}
													className="border-r border-white/5 h-full hover:bg-white/[0.02]"></div>
											)
										)}
									</div>
								))}

								{/* Events Overlay (Absolute Positioning within Grid) */}
								{EVENTS.filter(
									(e) =>
										e.month === currentMonthIndex &&
										e.date >= 14 &&
										e.date <= 20
								).map((evt) => {
									// Simple logic to map date to column 1-7
									const colIndex = evt.date - 14 + 2; // +1 because grid starts at 1, +1 because time is col 1
									const topOffset = (evt.startHour - 6) * 80; // 80px per hour
									const height = evt.durationHours * 80;

									return (
										<div
											key={evt.id}
											onClick={() =>
												setSelectedDate(evt.date)
											}
											className={`absolute rounded-lg p-2 text-xs font-bold border-l-4 cursor-pointer hover:brightness-110 transition-all z-10 overflow-hidden ${getEventBlockStyle(
												evt.type
											)}`}
											style={{
												gridColumn: colIndex,
												top: `${topOffset}px`,
												height: `${height}px`,
												width: "94%", // slightly smaller than cell
												left: "3%",
											}}>
											<div className="truncate">
												{evt.title}
											</div>
											<div className="opacity-70 font-medium">
												{evt.startHour}:00 -{" "}
												{evt.startHour +
													evt.durationHours}
												:00
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* 3. YEAR VIEW */}
					{view === "year" && (
						<div className="h-full overflow-y-auto pr-2">
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{MONTHS.map((m, mIdx) => (
									<div
										key={m}
										onClick={() => {
											setCurrentMonthIndex(mIdx);
											setView("month");
										}}
										className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-white/20 hover:scale-[1.02] ${
											mIdx === currentMonthIndex
												? "bg-white/5 border-accent/50"
												: "bg-[#161616] border-white/5"
										}`}>
										<h3 className="text-white font-bold mb-3">
											{m}
										</h3>
										<div className="grid grid-cols-7 gap-1">
											{Array.from({ length: 31 }).map(
												(_, d) => {
													// Mock randomization for heatmap visual
													const activityLevel =
														Math.random() > 0.8
															? Math.random() >
															  0.5
																? "match"
																: "training"
															: null;
													return (
														<div
															key={d}
															className={`w-2 h-2 rounded-full ${
																activityLevel
																	? getEventColor(
																			activityLevel
																	  )
																	: "bg-gray-800"
															}`}></div>
													);
												}
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* --- RIGHT: DAILY BRIEFING (Persists across views) --- */}
			<div className="w-80 lg:w-96 bg-[#1E1E1E] border-l border-white/5 flex flex-col shadow-2xl z-20">
				{/* Header */}
				<div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
					<h2 className="text-3xl font-bold text-white mb-1">
						{selectedDate} {MONTHS[currentMonthIndex]}
					</h2>
					<p className="text-gray-400 font-medium">Daily Agenda</p>
				</div>

				{/* Timeline */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{selectedDayEvents.length === 0 ? (
						<div className="h-full flex flex-col items-center justify-center text-gray-500">
							<CalendarIcon
								size={48}
								className="mb-4 opacity-20"
							/>
							<p>No events scheduled.</p>
							<button className="mt-4 text-accent text-sm font-bold hover:underline">
								+ Add Event
							</button>
						</div>
					) : (
						selectedDayEvents.map((evt, idx) => (
							<div key={evt.id} className="relative pl-4">
								{/* Timeline Line */}
								{idx !== selectedDayEvents.length - 1 && (
									<div className="absolute left-[23px] top-8 bottom-[-16px] w-0.5 bg-white/5"></div>
								)}

								{/* Event Card */}
								<div className="flex gap-4 group">
									{/* Time Column */}
									<div className="flex flex-col items-center pt-1 min-w-[45px]">
										<span className="text-sm font-bold text-white">
											{evt.startHour}:00
										</span>
										<span className="text-[10px] text-gray-500">
											{evt.durationHours}h
										</span>
									</div>

									{/* Card Body */}
									<div
										className={`
                    flex-1 p-4 rounded-xl border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg
                    ${getCardStyle(evt.type)}
                  `}>
										<div className="flex justify-between items-start mb-2">
											<span
												className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getBadgeStyle(
													evt.type
												)}`}>
												{evt.type}
											</span>
										</div>

										<h3 className="font-bold text-white text-lg leading-tight mb-2">
											{evt.title}
										</h3>

										<div className="space-y-1.5">
											<div className="flex items-center gap-2 text-xs text-gray-300">
												<MapPin
													size={14}
													className="opacity-70"
												/>{" "}
												{evt.location}
											</div>
											{evt.attendees && (
												<div className="flex items-center gap-2 text-xs text-gray-300">
													<Users
														size={14}
														className="opacity-70"
													/>{" "}
													{evt.attendees} Going
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

// --- HELPERS ---

function ViewBtn({ icon: Icon, active, onClick }: any) {
	return (
		<button
			onClick={onClick}
			className={`p-1.5 rounded-md transition-all ${
				active
					? "bg-white/10 text-white shadow-sm"
					: "text-gray-500 hover:text-gray-300"
			}`}>
			<Icon size={18} />
		</button>
	);
}

function getEventColor(type: EventType) {
	switch (type) {
		case "match":
			return "bg-accent";
		case "training":
			return "bg-primary";
		case "tournament":
			return "bg-purple-500";
		case "social":
			return "bg-gray-500";
		default:
			return "bg-gray-700";
	}
}

function getEventBlockStyle(type: EventType) {
	switch (type) {
		case "match":
			return "bg-accent/20 border-accent text-accent";
		case "training":
			return "bg-primary/20 border-primary text-primary";
		case "tournament":
			return "bg-purple-500/20 border-purple-500 text-purple-400";
		default:
			return "bg-gray-700/50 border-gray-500 text-gray-300";
	}
}

function getCardStyle(type: EventType) {
	switch (type) {
		case "match":
			return "bg-[#1E1E1E] border-accent/50 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]";
		case "tournament":
			return "bg-gradient-to-br from-purple-900/20 to-[#1E1E1E] border-purple-500/30";
		case "training":
			return "bg-[#1E1E1E] border-primary/30";
		default:
			return "bg-[#1E1E1E] border-white/5";
	}
}

function getBadgeStyle(type: EventType) {
	switch (type) {
		case "match":
			return "bg-accent/20 text-accent";
		case "tournament":
			return "bg-purple-500/20 text-purple-400";
		case "training":
			return "bg-primary/20 text-primary";
		default:
			return "bg-gray-700/50 text-gray-400";
	}
}
