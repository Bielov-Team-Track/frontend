import TeamsEditSection from "@/components/features/teams/components/TeamEditSection";
import { loadEvent, loadEvents } from "@/lib/api/events";
import { format } from "date-fns";
import { notFound } from "next/navigation";

async function EventEditPage({ params }: Params) {
	const parameters = await params;
	if (!parameters || !parameters.id) {
		notFound();
	}

	const event = await loadEvent(parameters.id);

	if (!event) {
		notFound();
	}

	return (
		<div className="flex flex-col w-full gap-4">
			<h1 className="text-2xl text-muted-100 self-center">
				{format(new Date(event.startTime), "dd MMMM, yyyy")}
			</h1>
			{/* <EventEditForm event={event} locations={locations}>
        <button className="btn w-full text-muted-100 btn-success">
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
	params: Promise<{
		id: string;
	}>;
};

export async function generateStaticParams() {
	const events = await loadEvents();

	return events.map((event) => ({ id: event.id }));
}

export default EventEditPage;
