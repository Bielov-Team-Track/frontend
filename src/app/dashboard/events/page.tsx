import React from "react";
import { loadEventsByUser } from "@/lib/requests/events";
import { EventsList } from "@/components/features/events";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/server/auth";

async function EventsPage() {
  const userProfile = await getUserProfile();
  if (!userProfile) {
    redirect("/login");
  }
  const events = await loadEventsByUser(userProfile.userId!);

  return (
    <div className="absolte inset-0 grid place-items-center p-4">
      <EventsList events={events} />
    </div>
  );
}

export default EventsPage;
