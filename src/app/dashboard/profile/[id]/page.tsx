"use client";

import React, { useState, useEffect, use } from "react";
import Avatar from "@/components/ui/avatar";
import { followUser, getUserProfile } from "@/lib/requests/user";
import { redirect } from "next/navigation";
import Loader from "@/components/ui/loader";
import { Event } from "@/lib/models/Event";
import { loadEventsByUser } from "@/lib/requests/events";
import { UserProfile } from "@/lib/models/User";
import { useAuth } from "@/lib/auth/authContext";

function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [profile, setProfile] = useState<UserProfile>();
  const [events, setEvents] = useState<Event[]>();
  const { id } = use(params);
  const { userProfile } = useAuth();

  useEffect(() => {
    getUserProfile(id as string).then((profileUser) => {
      if (!profileUser) {
        redirect("/404");
      }

      setProfile(profileUser);
    });
  }, [id]);

  useEffect(() => {
    loadEventsByUser(id as string).then((events) => {
      setEvents(events);
    });
  }, [id]);

  if (!id) {
    redirect("/404");
  }

  const handleFollow = () => {
    followUser;
  };

  const displayName = profile?.email?.split("@")[0] || "User";

  return profile ? (
    <div>
      <div className="flex items-center flex-col gap-4">
        <Avatar profile={profile} size="large" />
        <div>{displayName}</div>
        {profile.userId !== userProfile?.userId && (
          <button className="btn btn-info btn-md w-32">Follow</button>
        )}
      </div>
      <div>
        <h2>Events</h2>
        {events ? (
          events?.map((event) => {
            return <div key={event.id}>{event.name}</div>;
          })
        ) : (
          <Loader />
        )}
      </div>
    </div>
  ) : (
    <Loader />
  );
}

export default ProfilePage;
