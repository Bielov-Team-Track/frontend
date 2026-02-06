"use client";
import { Loader } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import { Team } from "@/lib/models/Team";
import { createTeam, loadTeams } from "@/lib/api/teams";
import { useEffect, useState } from "react";
import { Plus as PlusIcon } from "lucide-react";
import TeamsEditList from "./TeamsEditList";

export default function TeamsEditSection({ event }: { event: Event }) {
	const [teams, setTeams] = useState<Team[]>();
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		loadTeams(event.id!).then((tms) => {
			setIsLoading(false);
			setTeams(tms);
		});
	}, [event.id]);

	const updateTeams = () => {
		setIsLoading(true);
		loadTeams(event.id!).then((tms) => {
			setIsLoading(false);
			setTeams(tms);
		});
	};

	const addTeam = async () => {
		await createTeam({ eventId: event.id! });
		updateTeams();
	};

	return (
		<div className="flex flex-col justify-center items-center">
			<div className="w-full flex flex-col gap-4 relative">
				{isLoading && (
					<Loader className="absolute inset-0 flex justify-center items-center bg-overlay rounded-lg z-50" />
				)}
				<button onClick={addTeam} className="btn w-full text-muted-100">
					<PlusIcon size={18} />
				</button>
				{teams ? (
					<TeamsEditList
						onTeamDelete={updateTeams}
						teams={teams}
						event={event}
					/>
				) : (
					<span>No teams...</span>
				)}
			</div>
		</div>
	);
}
