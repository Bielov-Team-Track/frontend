import React from "react";
import { loadEvent } from "@/lib/requests/events";
import { loadTeams } from "@/lib/requests/teams";
import { TeamsList } from "@/components/features/teams";
import { notFound, redirect } from "next/navigation";
import { Avatar, Button } from "@/components/ui";
import Link from "next/link";
import { checkUserApproval } from "@/lib/requests/approvals";
import { ApprovalSection } from "@/components/features/events";
import PositionsRealtimeClient from "@/components/features/teams/components/PositionsRealtimeClient";
import { Map } from "@/components/features/locations";
import { getUserProfile } from "@/lib/server/auth";
import {
  getDuration,
  getFormattedDateWithDay,
  getFormattedTime,
} from "@/lib/utils/date";

import {
  FaClock as ClockIcon,
  FaMapPin as PinIcon,
  FaUsers as PeopleIcon,
  FaVolleyballBall as VolleyballIcon,
} from "react-icons/fa";
import { UserProfile } from "@/lib/models/User";

type EventPageParams = {
  params: Promise<{
    id: string;
  }>;
};

async function EventPage({ params }: EventPageParams) {
  const parameters = await params;
  if (!parameters || !parameters.id) {
    notFound();
  }

  const user: UserProfile = await getUserProfile();

  if (!user) {
    redirect("/login");
  }

  // TODO: Too many requests
  const event = await loadEvent(parameters.id);

  if (!event) {
    notFound();
  }

  const isAdmin = !!event.admins!.find((a) => a.userId == user.userId);

  if ((event as any).approveGuests && !isAdmin) {
    const userApproval = await checkUserApproval(event.id!, user?.userId!);

    if (!userApproval || !userApproval.approved) {
      return (
        <ApprovalSection
          defaultApproval={userApproval}
          userId={user?.userId!}
          eventId={event.id!}
        />
      );
    }
  }

  const teams = await loadTeams(parameters.id);

  teams.forEach((team) => {
    team.event = event;
  });

  return (
    <div className="flex flex-col w-full gap-4 p-8">
      <PositionsRealtimeClient />
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{event.name}</h1>
        {!event.teams && <Button>Join</Button>}
      </div>
      <div>{event.description}</div>
      <div>
        <div className="flex items-center gap-2">
          <ClockIcon />
          <span className="text-neutral/60">Date and time</span>
        </div>
        <div className="flex gap-12 py-4">
          <div className="text-2xl">
            {getFormattedDateWithDay(event.startTime)}
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">
              {getFormattedTime(event.startTime)} -{" "}
              {getFormattedTime(event.endTime)}
            </div>
            <span className="text-neutral/40">
              {getDuration(event.startTime, event.endTime)}
            </span>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <PinIcon />
          <span className="text-neutral/60">Location</span>
        </div>
        <div className="flex flex-col gap-2 py-4">
          {event.location ? (
            <>
              <Map defaultAddress={event.location.address} />
              <Link
                target="_blank"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  event.location.address!
                )}`}
                className="btn w-full bg-primary text-primary-content"
              >
                Get Directions
              </Link>
              <div className="flex flex-col gap-2">
                <span>
                  <b>Name:</b> {event.location.name}
                </span>
                <span>
                  <b>Address:</b> {event.location.address}
                </span>
              </div>
            </>
          ) : (
            <span className="font-2xl font-bold">TBD</span>
          )}
        </div>
      </div>

      {teams && teams.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <VolleyballIcon />
            <span className="text-neutral/60">Teams</span>
          </div>
          <TeamsList teams={teams} />
        </div>
      )}
      {event.admins && event.admins.length > 0 && (
        <div>
          <span className="flex items-center gap-2">
            <PeopleIcon />
            <span className="text-neutral/60">Admins</span>
          </span>
          <div className="flex flex-col gap-2 p-4 rounded-lg bg-primary/5">
            {event.admins.map((admin) => (
              <div key={admin.userId} className="flex items-center gap-2">
                <Avatar profile={admin} />
                <span>{(admin as any).name || admin.email}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventPage;
