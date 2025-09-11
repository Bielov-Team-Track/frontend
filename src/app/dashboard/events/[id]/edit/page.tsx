import { loadEvent, loadEvents } from "@/lib/requests/events";
import moment from "moment";
import { notFound } from "next/navigation";
import { loadLocations } from "@/lib/requests/locations";
// import { EventEditForm } from "@/components";
import TeamsEditSection from "@/components/features/teams/components/TeamEditSection";

async function EventEditPage({ params }: Params) {
  if (!params || !params.id) {
    notFound();
  }

  const event = await loadEvent(params.id);

  if (!event) {
    notFound();
  }
  const locations = await loadLocations();

  return (
    <div className="flex flex-col w-full gap-4">
      <h1 className="text-2xl text-neutral-100 self-center">
        {moment(event.startTime).format("DD MMMM, YYYY")}
      </h1>
      {/* <EventEditForm event={event} locations={locations}>
        <button className="btn w-full text-neutral-100 btn-success">
          Save
        </button>
      </EventEditForm> */}
      <div className="flex flex-col gap-4">
        <span className="font-bold text-lg">Edit Teams</span>
        <TeamsEditSection event={event}></TeamsEditSection>
      </div>
    </div>
  );
}

type Params = {
  params: {
    id: string;
  };
};

export async function generateStaticParams() {
  const events = await loadEvents();

  return events.map((event) => ({ id: event.id }));
}

export default EventEditPage;
