import { Avatar } from "@/components/ui";
import { Team } from "@/lib/models/Club";
import { cn } from "@/lib/utils";
import { useClub } from "@/providers";
import { Check, ChevronDown, Clock, Mail, Palette, Users, X } from "lucide-react";
import { useState } from "react";
import type { MatchTeamSlot } from "../../types/registration";

interface TeamSlotCardProps {
	label: string; // "Home Team" or "Away Team"
	slot: MatchTeamSlot | null;
	onChange: (slot: MatchTeamSlot | null) => void;
	disabled?: boolean;
}

type SelectionMode = "own" | "invite" | "manual" | null;

export function TeamSlotCard({ label, slot, onChange, disabled }: TeamSlotCardProps) {
	const [mode, setMode] = useState<SelectionMode>((slot?.type as SelectionMode) || null);
	const [isExpanded, setIsExpanded] = useState(!slot);

	const getStatusIcon = () => {
		if (!slot) return null;
		switch (slot.status) {
			case "accepted":
				return <Check size={14} className="text-green-400" />;
			case "pending":
				return <Clock size={14} className="text-yellow-400" />;
			case "declined":
				return <X size={14} className="text-red-400" />;
			default:
				return null;
		}
	};

	const getStatusText = () => {
		if (!slot) return null;
		switch (slot.status) {
			case "accepted":
				return "Confirmed";
			case "pending":
				return "Pending";
			case "declined":
				return "Declined";
			default:
				return null;
		}
	};

	const handleModeSelect = (newMode: SelectionMode) => {
		setMode(newMode);
		if (newMode === null) {
			onChange(null);
		}
	};

	const handleTeamSelect = (team: Team) => {
		onChange({
			type: "own",
			team: team,
		});
		setIsExpanded(false);
	};

	const handleManualSubmit = (name: string, email: string, color: string) => {
		onChange({
			type: "manual",
			name,
			contactEmail: email,
			color,
			status: "pending",
		});
		setIsExpanded(false);
	};

	return (
		<div
			className={cn(
				"rounded-xl border transition-all",
				slot ? "bg-white/5 border-white/20" : "bg-white/5 border-white/10",
				disabled && "opacity-50 pointer-events-none"
			)}>
			{/* Header */}
			<button type="button" onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex items-center justify-between text-left">
				<div className="flex items-center gap-3">
					{slot?.color && <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: slot.color }} />}
					<div>
						<div className="text-sm font-medium text-white">{label}</div>
						{slot?.team ? (
							<div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
								{slot.name}
								{getStatusIcon()}
								{getStatusText() && (
									<span
										className={cn(
											"text-xs",
											slot.status === "accepted" && "text-green-400",
											slot.status === "pending" && "text-yellow-400",
											slot.status === "declined" && "text-red-400"
										)}>
										({getStatusText()})
									</span>
								)}
							</div>
						) : (
							<div className="text-xs text-muted mt-0.5">Not selected</div>
						)}
					</div>
				</div>
				<ChevronDown size={16} className={cn("text-muted transition-transform", isExpanded && "rotate-180")} />
			</button>

			{/* Expanded Content */}
			{isExpanded && (
				<div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
					{/* Mode Selection */}
					<div className="grid grid-cols-3 gap-2">
						<button
							type="button"
							onClick={() => handleModeSelect("own")}
							className={cn(
								"p-2 rounded-lg text-xs font-medium transition-colors",
								mode === "own"
									? "bg-accent/20 text-accent border border-accent"
									: "bg-white/5 text-muted border border-white/10 hover:bg-white/10"
							)}>
							<Users size={14} className="mx-auto mb-1" />
							Your Team
						</button>
						<button
							type="button"
							onClick={() => handleModeSelect("invite")}
							className={cn(
								"p-2 rounded-lg text-xs font-medium transition-colors",
								mode === "invite"
									? "bg-accent/20 text-accent border border-accent"
									: "bg-white/5 text-muted border border-white/10 hover:bg-white/10"
							)}>
							<Users size={14} className="mx-auto mb-1" />
							Invite Team
						</button>
						<button
							type="button"
							onClick={() => handleModeSelect("manual")}
							className={cn(
								"p-2 rounded-lg text-xs font-medium transition-colors",
								mode === "manual"
									? "bg-accent/20 text-accent border border-accent"
									: "bg-white/5 text-muted border border-white/10 hover:bg-white/10"
							)}>
							<Mail size={14} className="mx-auto mb-1" />
							Manual
						</button>
					</div>

					{/* Mode Content */}
					{mode === "own" && <OwnTeamSelector selectedId={slot?.teamId} onSelect={handleTeamSelect} />}
					{mode === "invite" && (
						<InviteTeamSelector
							onInvite={(teamId, teamName) => {
								onChange({
									type: "invited",
									teamId,
									name: teamName,
									status: "pending",
								});
								setIsExpanded(false);
							}}
						/>
					)}
					{mode === "manual" && <ManualTeamEntry onSubmit={handleManualSubmit} />}

					{/* Clear Button */}
					{slot && (
						<button
							type="button"
							onClick={() => {
								onChange(null);
								setMode(null);
							}}
							className="w-full p-2 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
							Clear Selection
						</button>
					)}
				</div>
			)}
		</div>
	);
}

// Sub-components

function OwnTeamSelector({ selectedId, onSelect }: { selectedId?: string; onSelect: (team: Team) => void }) {
	const clubs = useClub().clubs;

	for (const club of clubs) {
		for (const team of club.teams ?? []) {
			team.club = club;
		}
	}

	const teams = clubs?.flatMap((c) => c.teams).filter(Boolean);

	if (!teams || teams.length === 0) {
		return <div className="p-4 text-center text-muted text-sm">You don't have any teams yet.</div>;
	}

	return (
		<div className="space-y-2 max-h-48 overflow-y-auto">
			{teams.map(
				(team) =>
					team && (
						<button
							key={team.id}
							type="button"
							onClick={() => onSelect(team)}
							className={cn(
								"w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3",
								selectedId === team.id ? "bg-accent/20 border border-accent" : "bg-white/5 border border-white/10 hover:bg-white/10"
							)}>
							<Avatar variant="team" size="sm" name={team?.name} color={team?.color} />
							<div>
								<div className="text-sm font-medium text-white">{team.name}</div>
								<div className="text-xs text-muted">{team.club?.name}</div>
							</div>
							{selectedId === team.id && <Check size={14} className="ml-auto text-accent" />}
						</button>
					)
			)}
		</div>
	);
}

function InviteTeamSelector({ onInvite }: { onInvite: (teamId: string, teamName: string) => void }) {
	// TODO: Implement team search - for now show placeholder
	return (
		<div className="p-4 text-center text-muted text-sm border-2 border-dashed border-white/20 rounded-lg">
			Team search coming soon...
			<br />
			<span className="text-xs">Search for clubs and teams to invite</span>
		</div>
	);
}

function ManualTeamEntry({ onSubmit }: { onSubmit: (name: string, email: string, color: string) => void }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [color, setColor] = useState("#4ECDC4");

	const handleSubmit = () => {
		if (name && email) {
			onSubmit(name, email, color);
		}
	};

	return (
		<div className="space-y-3">
			<input
				type="text"
				placeholder="Team name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent"
			/>
			<input
				type="email"
				placeholder="Contact email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent"
			/>
			<div className="flex items-center gap-2">
				<Palette size={14} className="text-muted" />
				<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
				<span className="text-xs text-muted">Team color</span>
			</div>
			<button
				type="button"
				onClick={handleSubmit}
				disabled={!name || !email}
				className={cn(
					"w-full p-2 rounded-lg text-sm font-medium transition-colors",
					name && email ? "bg-accent hover:bg-accent/90 text-white" : "bg-white/10 text-muted cursor-not-allowed"
				)}>
				Add Team
			</button>
		</div>
	);
}
