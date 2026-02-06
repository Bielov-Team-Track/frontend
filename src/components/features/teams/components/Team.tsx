"use client";

import { Position as PositionComponent } from "@/components/features/teams/";
import { Loader } from "@/components/ui";
import { useRealtimePositions } from "@/hooks/useRealtimePositions";
import { addPosition } from "@/lib/api/positions";
import { EVENTS_API_URL } from "@/lib/constants";
import { Position } from "@/lib/models/Position";
import { Team as TeamModel } from "@/lib/models/Team";
import { UserProfile } from "@/lib/models/User";
import { usePositionStore } from "@/lib/realtime/positionStore";
import signalr from "@/lib/realtime/signalrClient";
import { Check, Crown, Plus, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import TeamMenu from "./TeamMenu";

type TeamProps = {
	open?: boolean;
	editable?: boolean;
	audit?: boolean;
	team: TeamModel;
};

function Team({ team: defaultTeam, open = false, editable = false, audit = false }: TeamProps) {
	const [team, setTeam] = useState(defaultTeam);
	const [positions, setLocalPositions] = useState(team.positions);
	const captain = team.captain;
	useRealtimePositions();

	const filteredPositions = useMemo(() => {
		return positions?.filter((p) => p.eventParticipant?.userProfile || open || editable);
	}, [positions, open, editable]);

	const positionStore = usePositionStore((s) => s.positions);
	const upsertPosition = usePositionStore((s) => s.upsert);
	const connectionStatus = usePositionStore((s) => s.connectionStatus);

	// Initialize position store with team positions (upsert each position individually)
	useEffect(() => {
		if (team.positions) {
			team.positions.forEach((position) => {
				upsertPosition(position);
			});
		}
	}, [team.positions, upsertPosition]);

	// Join event group for position updates
	useEffect(() => {
		const connection = signalr.getConnection(EVENTS_API_URL, "position");
		if (connection && team.event?.id && connectionStatus === "connected") {
			// Join the event group
			connection.invoke("JoinEventGroup", team.event.id).catch((error) => {
				console.error("Failed to join event group:", error);
			});

			// Cleanup: leave the group
			return () => {
				if (connection && connectionStatus === "connected") {
					connection.invoke("LeaveEventGroup", team.event.id).catch((error) => {
						console.error("Failed to leave event group:", error);
					});
				}
			};
		}
	}, [team.event?.id, connectionStatus]);

	const updatePositions = useCallback(() => {
		setLocalPositions((prev) => {
			if (!prev) return prev;
			return prev.map((p) => (positionStore[p.id] ? { ...p, ...positionStore[p.id] } : p));
		});
	}, [positionStore]);

	useEffect(() => {
		// If store has entries for this team's positions, reflect them
		updatePositions();
	}, [positionStore, updatePositions]);

	const handleCaptainAssigned = (newCaptain: UserProfile) => {
		// Update local state
		setTeam((prevTeam) => ({ ...prevTeam, captain: newCaptain }));
	};

	const handleCaptainRemoved = () => {
		// Update local state
		setTeam((prevTeam) => ({ ...prevTeam, captain: undefined }));
	};

	const isTeamFull = !positions?.find((p) => !p.eventParticipant?.userProfile);

	return (
		<div className="bg-surface-elevated border border-border relative max-w-sm flex flex-col rounded-2xl w-full sm:w-80 shadow-lg hover:border-border transition-all overflow-hidden group">
			{/* Team Header */}
			<div className="p-4 border-b border-border bg-surface">
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between w-full">
						<div className="flex gap-2 justify-between w-full items-center">
							<span className="text-lg font-bold text-foreground truncate max-w-[150px]" title={team.name}>
								{team.name}
							</span>

							<div className="flex items-center gap-2">
								{/* Captain Badge */}
								{captain && (
									<div className="tooltip tooltip-bottom" data-tip="Captain">
										<Link
											href={"/profiles/" + captain.id}
											className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors">
											<Crown size={12} className="text-accent" />
											<span className="text-xs font-bold text-accent truncate max-w-[80px]">{captain.name}</span>
										</Link>
									</div>
								)}

								{/* Status Badge */}
								{open &&
									!captain &&
									positions &&
									positions.length > 0 &&
									(isTeamFull ? (
										<span className="px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 text-[10px] font-bold uppercase">
											Full
										</span>
									) : (
										<span className="px-2 py-0.5 rounded-full bg-surface text-muted border border-border text-[10px] font-bold uppercase whitespace-nowrap">
											Open
										</span>
									))}

								{/* Menu */}
								<TeamMenu team={team} onCaptainAssigned={handleCaptainAssigned} onCaptainRemoved={handleCaptainRemoved} />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Positions List */}
			<div className="p-2 space-y-1">
				{filteredPositions && filteredPositions.length !== 0 ? (
					positions?.map((p) => (
						<div key={p.id + p.eventParticipant?.userProfile?.id} className="transform transition-all duration-200">
							<PositionComponent
								open={open}
								audit={audit}
								editable={editable}
								payToJoin={team.event.budget?.payToJoin}
								team={team}
								position={p}
								onPositionRemoved={(id) => {
									setLocalPositions((prev) => (prev ? prev.filter((pos) => pos.id !== id) : prev));
								}}
							/>
						</div>
					))
				) : (
					<div className="py-8 text-center text-muted/50 text-sm italic">No players assigned yet</div>
				)}

				{editable && (
					<div className="pt-2 px-2 pb-2">
						<AddNewPosition
							teamId={team.id!}
							onPositionAdded={(p) => {
								upsertPosition(p);
								setLocalPositions((prev) => [...(prev || []), p]);
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

type AddNewPositionProps = {
	teamId: string;
	onPositionAdded: (position: Position) => void;
};

const AddNewPosition = ({ teamId, onPositionAdded }: AddNewPositionProps) => {
	const [addingNewPosition, setAddingNewPosition] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [newPositionName, setNewPositionName] = useState("");
	const [error, setError] = useState<string | null>("");

	const handleAddNewPosition = () => {
		if (newPositionName.trim()) {
			setIsLoading(true);
			addPosition(teamId, newPositionName.trim())
				.then((createdPosition) => {
					onPositionAdded && onPositionAdded(createdPosition);
					setNewPositionName("");
					setAddingNewPosition(false);
					setIsLoading(false);
					setError(null);
				})
				.catch((err) => {
					setError("Failed to add position. Please try again.");
					setIsLoading(false);
				});
		} else {
			setError("Position name cannot be empty");
		}
	};

	return addingNewPosition ? (
		<div className="flex flex-col relative mt-2 bg-background p-2 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
			{isLoading && <Loader className="inset-0 absolute bg-overlay rounded-xl" />}
			<div className="flex items-center gap-2 w-full">
				<input
					type="text"
					placeholder="Position name (e.g. Setter)"
					className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-hidden focus:border-accent/50 transition-colors"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleAddNewPosition();
						}
					}}
					value={newPositionName}
					onChange={(e) => setNewPositionName(e.target.value)}
					autoFocus
				/>
				<button
					className="p-2 bg-accent/10 text-accent hover:bg-accent hover:text-foreground rounded-lg transition-colors border border-accent/20"
					onClick={() => handleAddNewPosition()}
					title="Add">
					<Check size={16} />
				</button>
				<button
					className="p-2 bg-surface text-muted hover:bg-red-500/10 hover:text-error rounded-lg transition-colors border border-border"
					onClick={() => {
						setAddingNewPosition(false);
						setNewPositionName("");
						setError(null);
					}}
					title="Cancel">
					<X size={16} />
				</button>
			</div>
			{error && <div className="text-xs text-error mt-2 px-1">{error}</div>}
		</div>
	) : (
		<button
			className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-border text-xs font-medium text-muted hover:text-foreground hover:border-border hover:bg-hover transition-all"
			onClick={() => setAddingNewPosition(true)}>
			<Plus size={14} /> Add Position
		</button>
	);
};

export default Team;
