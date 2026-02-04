"use client";

import { Team } from "@/lib/models/Team";
import React, { useEffect, useState } from "react";
import { Position } from "@/lib/models/Position";
import { Plus as PlusIcon, Trash2 as TrashIcon } from "lucide-react";
import {
	addPosition as addPositionRequest,
	loadPositionTypes,
} from "@/lib/api/positions";
import {
	deleteTeam,
	deleteTeamPosition,
	loadTeamPositions,
} from "@/lib/api/teams";
import { Avatar, Loader } from "@/components/ui";
import Image from "next/image";
import { PositionType } from "@/lib/models/PositionType";

function TeamEdit({
	team,
	onTeamDelete,
}: {
	team: Team;
	onTeamDelete: Function;
}) {
	const [positions, setPositions] = useState<Position[]>(team.positions!);
	const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		loadPositionTypes().then((positions) => {
			setIsLoading(false);
			setPositionTypes(positions);
		});
	}, []);

	const addPosition = async (positionId: string) => {
		setIsLoading(true);
		addPositionRequest(team.id!, positionId).then(async () => {
			await updatePositions();
		});
	};

	const updatePositions = async () => {
		setIsLoading(true);
		loadTeamPositions(team.id!).then((positions) => {
			setPositions(positions);
			setIsLoading(false);
		});
	};

	const removeTeam = async () => {
		await deleteTeam(team.id!);
		onTeamDelete && onTeamDelete();
	};

	const removePosition = async (positionId: string) => {
		setIsLoading(true);
		deleteTeamPosition(team.id!, positionId).then(async () => {
			await updatePositions();
		});
	};

	return (
		<div className="w-full flex flex-col gap-4 bg-surface p-4 rounded-lg relative">
			<div className="flex w-full justify-between">
				<span className="text-muted-100 font-bold text-lg">{team.name}</span>
				<div className="flex gap-4">
					<button className="text-error" onClick={removeTeam}>
						<TrashIcon />
					</button>
				</div>
			</div>
			{isLoading && (
				<Loader className="absolute inset-0 flex justify-center items-center bg-black/55 rounded-lg" />
			)}

			{positions && positions.length != 0 ? (
				positions.map((p) => {
					return (
						<div
							key={p.id}
							className="p-4 h-14 rounded-md bg-muted w-full flex justify-between"
						>
							<span className="text-black self-center font-bold">{p.name}</span>
							<div className="flex gap-4">
								{p.eventParticipant?.userProfile && (
									<div className="flex items-center gap-4">
										<span className="text-black">
											{p.eventParticipant?.userProfile.name}
										</span>
										<Avatar profile={p.eventParticipant?.userProfile} />
									</div>
								)}
								<button
									className="cursor-pointer"
									onClick={() => removePosition(p.id)}
								>
									<TrashIcon color="red" />
								</button>
							</div>
						</div>
					);
				})
			) : (
				<span>No positions yet...</span>
			)}

			<div className="dropdown dropdown-end">
				<div tabIndex={0} role="button" className="btn w-full">
					Position
					<PlusIcon size={18} />
				</div>
				<ul
					tabIndex={0}
					className="dropdown-content z-1 menu p-2 shadow-sm bg-card rounded-box w-52"
				>
					{positionTypes?.map((p) => (
						<li key={p.id}>
							<button onClick={() => addPosition(p.id)}>{p.name}</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

export default TeamEdit;
