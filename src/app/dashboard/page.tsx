import EventList from "@/components/features/events/components/event-list";
import { loadEventsByAdmin, loadEventsByUser } from "@/lib/requests/events";
import { getUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";

const HomePage = async () => {
  const userProfile = await getUserProfile();

  if (!userProfile) {
    redirect("/login");
  }

  var userEvents = await loadEventsByUser(userProfile.userId!);
  var adminEvents = await loadEventsByAdmin(userProfile.userId!);

  return (
    <div className="flex flex-col p-8 gap-5">
      <h1 className="text-3xl mb-4">Welcome, {userProfile.name}</h1>
      {adminEvents && adminEvents.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-2xl">Events you are hosting</span>
          </div>
          <EventList
            events={adminEvents.filter((e) => !e.canceled)}
            variant="inline"
            cardVariant="vertical"
          />
        </>
      )}
      {userEvents && userEvents.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-2xl">Events you are attending</span>
          </div>
          <EventList
            events={userEvents}
            variant="inline"
            cardVariant="vertical"
          />
        </>
      )}
      <div className="flex items-center gap-2">
        <span className="text-2xl">Events that needs audition</span>
      </div>
      <EventList events={userEvents} variant="inline" cardVariant="vertical" />
    </div>
  );
};

export default HomePage;
