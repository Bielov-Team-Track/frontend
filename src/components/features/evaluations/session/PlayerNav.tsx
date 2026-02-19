"use client";

import Avatar from "@/components/ui/avatar/index";
import { Check } from "lucide-react";

export interface PlayerNavPlayer {
	playerId: string;
	playerName: string | null;
	avatarUrl: string | null;
}

export interface PlayerNavProps {
	players: PlayerNavPlayer[];
	currentPlayerId: string | null;
	scoredPlayerIds: Set<string>;
	onSelectPlayer: (playerId: string) => void;
}

export default function PlayerNav({ players, currentPlayerId, scoredPlayerIds, onSelectPlayer }: PlayerNavProps) {
	if (players.length === 0) {
		return (
			<p className="text-xs text-muted text-center py-2">No players assigned</p>
		);
	}

	return (
		<div
			className="flex gap-3 overflow-x-auto pb-1 px-1"
			role="list"
			aria-label="Players"
		>
			{players.map((player) => {
				const isSelected = player.playerId === currentPlayerId;
				const isScored = scoredPlayerIds.has(player.playerId);

				return (
					<button
						key={player.playerId}
						type="button"
						onClick={() => onSelectPlayer(player.playerId)}
						role="listitem"
						aria-label={player.playerName ?? "Unknown player"}
						aria-current={isSelected ? "true" : undefined}
						className="flex flex-col items-center gap-1 shrink-0 focus:outline-none group"
					>
						{/* Avatar wrapper with border and checkmark overlay */}
						<div className="relative">
							<div
								className={[
									"rounded-full p-0.5 transition-all",
									isSelected
										? "ring-2 ring-offset-2 ring-offset-background ring-[#FF7D00]"
										: "ring-1 ring-border",
								].join(" ")}
							>
								<Avatar
									src={player.avatarUrl}
									name={player.playerName ?? "?"}
									size="xs"
								/>
							</div>
							{/* Scored checkmark badge */}
							{isScored && (
								<span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center">
									<Check size={9} className="text-white" strokeWidth={3} />
								</span>
							)}
						</div>
						{/* Player name truncated */}
						<span
							className={[
								"text-[10px] max-w-[52px] truncate leading-tight",
								isSelected ? "text-[#FF7D00] font-semibold" : "text-muted",
							].join(" ")}
						>
							{player.playerName?.split(" ")[0] ?? "?"}
						</span>
					</button>
				);
			})}
		</div>
	);
}
