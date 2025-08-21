import React from "react";
import { loadEventsByAdmin } from "@/lib/requests/events";
import { EventsList } from "@/components/features/events";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/server/auth";
import { UserProfile } from "@/lib/models/User";
import Link from "@/components/ui/link";

async function EventsPage() {
  const user: UserProfile = await getUserProfile();
  if (!user) {
    redirect("/login");
  }
  console.log(user);
  const events = await loadEventsByAdmin(user.userId!);

  return (
    <div className="absolte inset-0 p-4">
      <div>
        <Link href={"/dashboard/events/create"}>Create new event</Link>
      </div>
      <EventsList events={events} />
    </div>
  );
}

export default EventsPage;
