"use client";

import { Button } from "@/components";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/ui/loader";
import { Event } from "@/lib/models/Event";
import { useCreateModals } from "@/providers/CreateModalsProvider";
import { Calendar as CalendarIcon, Clock, Grid, List, MapPin, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Lazy load calendar - only loaded when calendar tab is selected
const EventsCalendar = dynamic(
	() => import("@/components/ui/calendar/EventsCalendar").then((mod) => mod.EventsCalendar),
	{
		ssr: false,
		loading: () => (
			<div className="h-full flex items-center justify-center">
				<Loader size="lg" />
			</div>
		),
	}
);
import EventsListEmptyState from "./components/EmptyState";
import { EventListView } from "./components/EventListView";

// Event type filter options
const EVENT_TYPES = ["Casual Play", "Tournament", "Practice", "Training"] as const;
type EventType = (typeof EVENT_TYPES)[number];

// Time filter options
const TIME_FILTERS = [
	{ value: "all", label: "All Time" },
	{ value: "today", label: "Today" },
	{ value: "week", label: "This Week" },
	{ value: "month", label: "This Month" },
	{ value: "upcoming", label: "Upcoming" },
] as const;
type TimeFilterValue = (typeof TIME_FILTERS)[number]["value"];

interface EventsPageClientProps {
	events: Event[];
	title?: string;
}

function EventsPageClient({ events, title = "Events" }: EventsPageClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
	const [timeFilter, setTimeFilter] = useState<TimeFilterValue>("all");
	const { openCreateEvent } = useCreateModals();

	// Filter logic - always sort by date ascending (soonest first)
	const filteredEvents = events
		.filter((e) => {
			// Search filter
			if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) {
				return false;
			}
			// Type filter
			if (selectedTypes.length > 0 && !selectedTypes.includes(e.type as EventType)) {
				return false;
			}
			// Time filter
			if (timeFilter !== "all") {
				const eventDate = new Date(e.startTime);
				const now = new Date();
				const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				const endOfWeek = new Date(today);
				endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
				const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

				switch (timeFilter) {
					case "today":
						if (eventDate.toDateString() !== today.toDateString()) return false;
						break;
					case "week":
						if (eventDate < today || eventDate > endOfWeek) return false;
						break;
					case "month":
						if (eventDate < today || eventDate > endOfMonth) return false;
						break;
					case "upcoming":
						if (eventDate < now) return false;
						break;
				}
			}
			return true;
		})
		.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

	const activeFilterCount = selectedTypes.length + (timeFilter !== "all" ? 1 : 0);

	const clearFilters = () => {
		setSelectedTypes([]);
		setTimeFilter("all");
	};

	const toggleType = (type: EventType) => {
		setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
	};

	// Filter content for ListToolbar
	const filterContent = (
		<div className="space-y-4">
			{/* Time Filter */}
			<div className="space-y-2">
				<p className="text-xs font-medium text-muted-foreground">Time Period</p>
				<div className="flex flex-wrap gap-2">
					{TIME_FILTERS.map((filter) => (
						<button
							key={filter.value}
							type="button"
							onClick={() => setTimeFilter(filter.value)}
							className={cn(
								"px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
								timeFilter === filter.value
									? "bg-foreground/10 text-foreground border-foreground/30"
									: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground hover:border-foreground/20"
							)}>
							{filter.label}
						</button>
					))}
				</div>
			</div>

			{/* Event Type Filter */}
			<div className="space-y-2">
				<p className="text-xs font-medium text-muted-foreground">Event Type</p>
				<div className="flex flex-wrap gap-2">
					{EVENT_TYPES.map((type) => (
						<button
							key={type}
							type="button"
							onClick={() => toggleType(type)}
							className={cn(
								"px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
								selectedTypes.includes(type)
									? "bg-foreground/10 text-foreground border-foreground/30"
									: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground hover:border-foreground/20"
							)}>
							{type}
						</button>
					))}
				</div>
			</div>
		</div>
	);

	return (
		<Tabs defaultValue="list" className="h-[calc(100vh-8rem)] flex flex-col gap-4 overflow-hidden">
			{/* Header Row: Title + Create Button */}
			<div className="flex items-center justify-between shrink-0">
				<h2 className="text-lg font-semibold text-foreground">{title}</h2>
				<Button variant="outline" leftIcon={<Plus size={16} />} onClick={() => openCreateEvent({ source: "events" })}>
					Create Event
				</Button>
			</div>

			{/* Toolbar Row */}
			<div className="flex items-center gap-3 shrink-0">
				<div className="flex-1">
					<ListToolbar
						search={searchQuery}
						onSearchChange={setSearchQuery}
						searchPlaceholder="Search events..."
						filterContent={filterContent}
						activeFilterCount={activeFilterCount}
						onClearFilters={clearFilters}
						count={filteredEvents.length}
						itemLabel="event"
						showViewToggle={false}
					/>
				</div>

				{/* View Switch */}
				<TabsList size="sm" className="border rounded-xl shrink-0">
					<TabsTrigger value="list">
						<List size={16} />
					</TabsTrigger>
					<TabsTrigger value="calendar">
						<CalendarIcon size={16} />
					</TabsTrigger>
					<TabsTrigger value="grid">
						<Grid size={16} />
					</TabsTrigger>
				</TabsList>
			</div>

			{/* --- Content Area --- */}
			<div className="flex-1 min-h-0 overflow-hidden">
				<TabsContent value="calendar" className="h-full">
					<EventsCalendar events={filteredEvents} />
				</TabsContent>

				<TabsContent value="list" className="h-full">
					<EventListView events={filteredEvents} />
				</TabsContent>

				<TabsContent value="grid" className="h-full overflow-y-auto scrollbar-thin pr-2">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
						{filteredEvents.map((event) => (
							<EventGridCard key={event.id} event={event} />
						))}
						{filteredEvents.length === 0 && (
							<div className="col-span-full">
								<EventsListEmptyState />
							</div>
						)}
					</div>
				</TabsContent>
			</div>
		</Tabs>
	);
}

// --- Helper Components ---

function EventGridCard({ event }: { event: Event }) {
	const date = new Date(event.startTime);

	return (
		<Link href={`/dashboard/events/${event.id}`} className="group block h-full">
			<div className="flex flex-col h-full rounded-2xl bg-white/5 border border-white/5 hover:border-accent/40 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-xl">
				{/* Image / Header Placeholder */}
				<div className="h-32 bg-surface relative overflow-hidden rounded-t-2xl">
					<div className="absolute top-3 right-3 z-10">
						<span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
							{event.type}
						</span>
					</div>
					{/* Gradient Overlay */} <div className="absolute inset-0 bg-linear-to-t from-background-dark/80 to-transparent" />
				</div>

				{/* Content */}
				<div className="p-5 flex-1 flex flex-col">
					<div className="flex gap-3 mb-2">
						<div className="flex flex-col items-center justify-center w-10 h-12 rounded-lg bg-white/5 border border-white/10 shrink-0">
							<span className="text-sm font-bold text-white leading-none">{date.getDate()}</span>
							<span className="text-[9px] font-bold text-muted uppercase">
								{date.toLocaleString("default", {
									month: "short",
								})}
							</span>
						</div>
						<div className="min-w-0">
							<h3 className="font-bold text-white leading-tight mb-1 truncate group-hover:text-accent transition-colors">{event.name}</h3>
							<div className="text-xs text-muted flex items-center gap-1">
								<Clock size={10} />{" "}
								{date.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
					</div>

					{event.location && (
						<div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-muted">
							<MapPin size={12} className="shrink-0" />
							<span className="truncate">{event.location.name}</span>
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}

export default EventsPageClient;
