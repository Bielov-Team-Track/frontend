"use client";

import { Button, Input } from "@/components";
import { EventsCalendar } from "@/components/ui/calendar/EventsCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event } from "@/lib/models/Event";
import { Calendar as CalendarIcon, Clock, Filter, Grid, List, MapPin, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import EventsListEmptyState from "./components/EmptyState";
import { EventListView } from "./components/EventListView";

const VIEWS = [
	{ value: "list", label: "List", icon: List },
	{ value: "grid", label: "Grid", icon: Grid },
	{ value: "calendar", label: "Calendar", icon: CalendarIcon },
] as const;

type ViewType = (typeof VIEWS)[number]["value"];

interface EventsPageClientProps {
	events: Event[];
}

function EventsPageClient({ events }: EventsPageClientProps) {
	const searchParams = useSearchParams();
	const initialView = searchParams.get("view") as ViewType | null;
	const [searchQuery, setSearchQuery] = useState("");

	// Filter logic placeholder
	const filteredEvents = events.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()));

	return (
		<Tabs className="h-full flex flex-col space-y-4">
			{/* --- Toolbar --- */}
			<div className="flex flex-col bg-neutral-900 sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-md p-4 rounded-2xl border border-white/5">
				{/* Search & Filter */}
				<div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
					<div className="relative flex-1 group">
						<Input
							type="text"
							placeholder="Find events..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							leftIcon={<Search size={18} />}
						/>
					</div>
					<Button leftIcon={<Filter size={18} />} variant="outline">
						<span className="hidden sm:inline">Filters</span>
					</Button>
				</div>

				{/* View Toggles & Action */}
				<div className="flex items-center gap-3 w-full sm:w-auto justify-end">
					{/* View Switcher */}
					<TabsList className="border rounded-xl">
						<TabsTrigger value="list">
							<List size={18} />
						</TabsTrigger>
						<TabsTrigger value="calendar">
							<CalendarIcon size={18} />
						</TabsTrigger>
						<TabsTrigger value="grid">
							<Grid size={18} />
						</TabsTrigger>
					</TabsList>

					<Button asChild variant="default" size={"lg"}>
						<Plus />
						<Link href="/dashboard/events/create">
							<span className="hidden sm:inline">Create Event</span>
						</Link>
					</Button>
				</div>
			</div>

			{/* --- Content Area --- */}
			<div className="flex-1 bg-neutral-900 rounded-2xl">
				<TabsContent value={"calendar"} className="h-[calc(100vh-12rem)]">
					<EventsCalendar events={filteredEvents} />
				</TabsContent>

				<TabsContent value={"list"}>
					<EventListView events={filteredEvents} />
				</TabsContent>

				<TabsContent value={"grid"} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredEvents.map((event) => (
						<EventGridCard key={event.id} event={event} />
					))}
					{filteredEvents.length === 0 && (
						<div className="col-span-full">
							<EventsListEmptyState />
						</div>
					)}
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
				<div className="h-32 bg-background-light relative overflow-hidden rounded-t-2xl">
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
