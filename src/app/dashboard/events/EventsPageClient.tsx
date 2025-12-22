"use client";

import { EventsCalendar } from "@/components/ui/calendar/EventsCalendar";
import { Event } from "@/lib/models/Event";
import { Calendar as CalendarIcon, Clock, Filter, Grid, List, MapPin, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
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
	const [currentView, setCurrentView] = useState<ViewType>(initialView ?? "list");
	const [searchQuery, setSearchQuery] = useState("");

	// Filter logic placeholder
	const filteredEvents = events.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()));

	return (
		<div className="h-full flex flex-col space-y-6">
			{/* --- Toolbar --- */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/50 backdrop-blur-md p-4 rounded-2xl border border-white/5">
				{/* Search & Filter */}
				<div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
					<div className="relative flex-1 group">
						<Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-hover:text-white transition-colors" />
						<input
							type="text"
							placeholder="Find events..."
							className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-muted hover:text-white hover:bg-white/10 transition-colors">
						<Filter size={18} />
						<span className="hidden sm:inline">Filters</span>
					</button>
				</div>

				{/* View Toggles & Action */}
				<div className="flex items-center gap-3 w-full sm:w-auto justify-end">
					{/* View Switcher */}
					<div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
						{VIEWS.map((view) => (
							<button
								key={view.value}
								onClick={() => setCurrentView(view.value as ViewType)}
								className={`
                                    p-2 rounded-lg transition-all
                                    ${currentView === view.value ? "bg-white/10 text-white shadow-sm" : "text-muted hover:text-white hover:bg-white/5"}
                                `}
								title={view.label}>
								<view.icon size={18} />
							</button>
						))}
					</div>

					<Link
						href="/dashboard/events/create"
						className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95">
						<Plus size={18} />
						<span className="hidden sm:inline">Create Event</span>
					</Link>
				</div>
			</div>

			{/* --- Content Area --- */}
			<div className="flex-1 min-h-0">
				{currentView === "calendar" && (
					<div className="h-[calc(100vh-12rem)] bg-background/50 rounded-2xl border border-white/5 overflow-hidden">
						<EventsCalendar events={filteredEvents} />
					</div>
				)}

				{currentView === "list" && <EventListView events={filteredEvents} />}

				{currentView === "grid" && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredEvents.map((event) => (
							<EventGridCard key={event.id} event={event} />
						))}
						{filteredEvents.length === 0 && (
							<div className="col-span-full">
								<EmptyState />
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

// --- Helper Components ---

function EventGridCard({ event }: { event: Event }) {
	const date = new Date(event.startTime);

	return (
		<Link href={`/dashboard/events/${event.id}`} className="group block h-full">
			<div className="flex flex-col h-full rounded-2xl bg-white/5 border border-white/5 hover:border-accent/40 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl">
				{/* Image / Header Placeholder */}
				<div className="h-32 bg-background-light relative overflow-hidden rounded-t-2xl">
					<div className="absolute top-3 right-3 z-10">
						<span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
							{event.type}
						</span>
					</div>
					{/* Gradient Overlay */} <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent" />
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

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
			<div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-muted">
				<CalendarIcon size={32} />
			</div>
			<h3 className="text-xl font-bold text-white mb-2">No events found</h3>
			<p className="text-muted max-w-sm mb-6">We couldn&apos;t find any events matching your filters. Try adjusting them or create a new one.</p>
			<Link href="/dashboard/events/create" className="btn btn-outline text-white border-white/20 hover:bg-white hover:text-black">
				Create Event
			</Link>
		</div>
	);
}

export default EventsPageClient;
