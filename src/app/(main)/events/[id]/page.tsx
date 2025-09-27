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

import { UserProfile } from "@/lib/models/User";
import CommentsSection from "@/components/features/comments/components/CommentsSection";
import EventPageButtons from "./components/EventPageButtons";
import PaymentsSection from "./components/PaymentsSection";

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

  // TODO: Too many requests
  const event = await loadEvent(parameters.id);

  if (!event) {
    notFound();
  }

  const isAdmin = !!event.admins!.find((a) => a.userId == user?.userId);
  console.log("EventPage render", { event, user, isAdmin });

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
      {event.canceled && (
        <div className="alert alert-error">
          <div>
            <span>This event has been canceled.</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="md:text-6xl text-5xl font-bold">{event.name}</h1>
        {isAdmin && <EventPageButtons event={event} />}
      </div>
      <div>{event.description}</div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold">Date and time</span>
        </div>
        <div className="flex gap-12 py-4">
          <div className="">{getFormattedDateWithDay(event.startTime)}</div>
          <div className="flex flex-col">
            <div className="font-bold">
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
          <span className="text-3xl font-bold">Location</span>
        </div>
        <div className="flex flex-col gap-2 py-4">
          {event.location ? (
            <>
              <div className="flex flex-col gap-2">
                <span>
                  <b>Address:</b> {event.location.address}
                </span>
              </div>
              <Map defaultAddress={event.location.address} readonly={true} />
              <Link
                target="_blank"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  event.location.address!
                )}`}
                className="btn w-full bg-primary text-primary-content"
              >
                Get Directions
              </Link>
            </>
          ) : (
            <span className="font-2xl font-bold">TBD</span>
          )}
        </div>
      </div>

      {event.admins && event.admins.length > 0 && (
        <div>
          <span className="flex items-center gap-2">
            <span className="text-3xl font-bold">Admins</span>
          </span>
          <div className="flex flex-col gap-2 p-4 rounded-lg bg-primary/5">
            {event.admins.map((admin) => (
              <Link
                href={"/profiles/" + admin.userId}
                key={admin.userId}
                className="flex items-center gap-2"
              >
                <Avatar profile={admin} />
                <span>
                  {admin.name} {admin.surname}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <PaymentsSection event={event} teams={teams} userProfile={user} />
      {teams && teams.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">Teams</span>
          </div>
          {teams && teams.length > 0 && (
            <TeamsList
              teams={teams}
              userId={user?.userId}
              isAdmin={isAdmin}
              registrationType={event.registrationUnit}
            />
          )}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold">Comments</span>
        </div>
        <CommentsSection eventId={event.id}></CommentsSection>
      </div>
    </div>
  );
}

export default EventPage;
