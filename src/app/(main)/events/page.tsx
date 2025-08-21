"use client";

import { Input, Loader, Select } from "@/components";
import EventList from "@/components/features/events/components/event-list";
import {
  EventTypeOptions,
  GetEventsRequest,
  SurfaceOptions,
  Event,
} from "@/lib/models/Event";
import { loadEvents } from "@/lib/requests/events";
import React, { useEffect, useState, useCallback } from "react";
import { FaCalendar, FaVolleyballBall } from "react-icons/fa";

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<GetEventsRequest>({
    type: undefined,
    surface: undefined,
    from: undefined,
    to: undefined,
  });
  const [loading, setLoading] = useState(true);

  // Load events whenever filters change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await loadEvents(filters);
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  // Handle individual filter changes
  const handleFilterChange = useCallback(
    (key: keyof GetEventsRequest, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value || undefined,
      }));
    },
    []
  );

  // Optional: Add debouncing for date inputs
  const [dateInputs, setDateInputs] = useState({
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        fromDate: dateInputs.fromDate || undefined,
        toDate: dateInputs.toDate || undefined,
      }));
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [dateInputs]);

  return (
    <div className="absolute inset-0 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-background">Volleyball events</h1>
        <div className="flex gap-4">
          <Select
            placeholder="Event type"
            leftIcon={<FaVolleyballBall />}
            options={EventTypeOptions}
            value={filters.type}
            onChange={(value) => handleFilterChange("type", value)}
          />
          <Select
            placeholder="Playing surface"
            leftIcon={<FaVolleyballBall />}
            options={SurfaceOptions}
            value={filters.surface}
            onChange={(value) => handleFilterChange("surface", value)}
          />
          <Input
            type="date"
            leftIcon={<FaCalendar />}
            placeholder="From"
            value={dateInputs.fromDate}
            onChange={(e) =>
              setDateInputs((prev) => ({ ...prev, fromDate: e.target.value }))
            }
          />
          <Input
            type="date"
            leftIcon={<FaCalendar />}
            placeholder="To"
            value={dateInputs.toDate}
            onChange={(e) =>
              setDateInputs((prev) => ({ ...prev, toDate: e.target.value }))
            }
          />
        </div>
      </div>
      <div>{loading ? <Loader /> : <EventList events={events} />}</div>
    </div>
  );
};

export default EventsPage;
