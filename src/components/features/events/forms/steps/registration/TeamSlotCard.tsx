import { Avatar, Badge, Button, Input } from "@/components/ui";
import { Team } from "@/lib/models/Club";
import { cn } from "@/lib/utils";
import { useClub } from "@/providers";
import { Check, Mail, Palette, Pencil, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import * as yup from "yup";
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

	const handleModeSelect = (newMode: SelectionMode) => {
		setMode(newMode);
		if (newMode === null) {
			onChange(null);
		}
	};

	const handleTeamSelect = (team: Team) => {
		onChange({
			type: "own",
			teamId: team.id,
			team: team,
		});
	};

	const handleManualSubmit = (name: string, email: string, color: string) => {
		onChange({
			type: "manual",
			name,
			contactEmail: email,
			color,
			status: "pending",
		});
	};

	return (
		<div
			className={cn(
				"rounded-xl border transition-all bg-surface",
				slot ? "border-accent shadow-sm" : "border-border",
				disabled && "opacity-50 pointer-events-none"
			)}>
			{/* Header */}
			<div className="p-3 sm:p-4 flex items-center justify-between border-b border-border/50">
				<span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{label}
				</span>
				{!slot ? (
					<Badge variant="soft" color="neutral" size="xs">Empty</Badge>
				) : slot.status === "accepted" ? (
					<Badge variant="soft" color="success" size="xs">Confirmed</Badge>
				) : slot.status === "pending" ? (
					<Badge variant="soft" color="warning" size="xs">Invited</Badge>
				) : slot.status === "declined" ? (
					<Badge variant="soft" color="error" size="xs">Declined</Badge>
				) : null}
			</div>

			{/* Body */}
			<div className="p-3 sm:p-4">
				{!slot ? (
					<>
						{/* Empty state */}
						<div className="space-y-3">
							{/* Mode Selection */}
							<div className="grid grid-cols-3 gap-1.5 sm:gap-2" aria-label="Team selection mode">
								<button
									type="button"
									aria-pressed={mode === "own"}
									onClick={() => handleModeSelect("own")}
									className={cn(
										"p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs font-medium transition-colors",
										mode === "own"
											? "bg-accent/20 text-accent border border-accent"
											: "bg-surface text-muted-foreground border border-border hover:bg-hover"
									)}>
									<Users size={12} className="mx-auto mb-0.5 sm:mb-1 sm:w-3.5 sm:h-3.5" />
									Your Team
								</button>
								<button
									type="button"
									aria-pressed={mode === "invite"}
									onClick={() => handleModeSelect("invite")}
									className={cn(
										"p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs font-medium transition-colors",
										mode === "invite"
											? "bg-accent/20 text-accent border border-accent"
											: "bg-surface text-muted-foreground border border-border hover:bg-hover"
									)}>
									<Users size={12} className="mx-auto mb-0.5 sm:mb-1 sm:w-3.5 sm:h-3.5" />
									Invite
								</button>
								<button
									type="button"
									aria-pressed={mode === "manual"}
									onClick={() => handleModeSelect("manual")}
									className={cn(
										"p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs font-medium transition-colors",
										mode === "manual"
											? "bg-accent/20 text-accent border border-accent"
											: "bg-surface text-muted-foreground border border-border hover:bg-hover"
									)}>
									<Mail size={12} className="mx-auto mb-0.5 sm:mb-1 sm:w-3.5 sm:h-3.5" />
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
									}}
								/>
							)}
							{mode === "manual" && <ManualTeamEntry onSubmit={handleManualSubmit} />}
						</div>
					</>
				) : (
					<>
						{/* Filled state */}
						<div className="flex items-center gap-3">
							<Avatar
								variant="team"
								size="md"
								name={slot.team?.name || slot.name}
								color={slot.team?.color || slot.color}
							/>
							<div className="flex-1 min-w-0">
								<div className="text-sm font-semibold text-foreground truncate">
									{slot.team?.name || slot.name}
								</div>
								<div className="text-xs text-muted-foreground truncate">
									{slot.team?.club?.name || slot.contactEmail || "External team"}
								</div>
							</div>
							<div className="flex gap-1.5 shrink-0">
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() => {
										onChange(null);
										setMode((slot.type as SelectionMode) || "own");
									}}
									aria-label="Change team"
								>
									<Pencil size={14} className="text-muted-foreground" />
								</Button>
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="group hover:bg-error/10 hover:border-error"
									onClick={() => {
										onChange(null);
										setMode(null);
									}}
									aria-label="Remove team"
								>
									<X size={14} className="text-muted-foreground group-hover:text-error" />
								</Button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

// Sub-components

function OwnTeamSelector({ selectedId, onSelect }: { selectedId?: string; onSelect: (team: Team) => void }) {
	const clubs = useClub().clubs;

	const teams = useMemo(
		() => clubs.flatMap(club =>
			(club.teams ?? []).map(team => ({ ...team, club }))
		),
		[clubs]
	);

	if (!teams || teams.length === 0) {
		return <div className="p-3 sm:p-4 text-center text-muted-foreground text-xs sm:text-sm">You don&apos;t have any teams yet.</div>;
	}

	return (
		<div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
			{teams.map(
				(team) =>
					team && (
						<button
							key={team.id}
							type="button"
							onClick={() => onSelect(team)}
							className={cn(
								"w-full p-2 sm:p-3 rounded-lg text-left transition-colors flex items-center gap-2 sm:gap-3",
								selectedId === team.id ? "bg-accent/20 border border-accent" : "bg-surface border border-border hover:bg-hover"
							)}>
							<Avatar variant="team" size="sm" name={team?.name} color={team?.color} />
							<div className="min-w-0 flex-1">
								<div className="text-xs sm:text-sm font-medium text-foreground truncate">{team.name}</div>
								<div className="text-[10px] sm:text-xs text-muted-foreground truncate">{team.club?.name}</div>
							</div>
							{selectedId === team.id && <Check size={12} className="ml-auto text-accent shrink-0 sm:w-3.5 sm:h-3.5" />}
						</button>
					)
			)}
		</div>
	);
}

function InviteTeamSelector({ onInvite }: { onInvite: (teamId: string, teamName: string) => void }) {
	// TODO: Implement team search - for now show placeholder
	return (
		<div className="p-3 sm:p-4 text-center text-muted-foreground text-xs sm:text-sm border-2 border-dashed border-border/50 rounded-lg">
			Team search coming soon...
			<br />
			<span className="text-[10px] sm:text-xs">Search for clubs and teams to invite</span>
		</div>
	);
}

function ManualTeamEntry({ onSubmit }: { onSubmit: (name: string, email: string, color: string) => void }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [color, setColor] = useState("#4ECDC4");
	const [errors, setErrors] = useState<string[]>([]);

	const validateManualEntry = (data: { name: string; contactEmail?: string; color?: string }) => {
		const errs: string[] = [];
		if (!data.name?.trim()) errs.push("Team name is required");
		if (data.name && data.name.length > 100) errs.push("Team name must be 100 characters or less");
		if (/[\x00-\x1f\x7f]/.test(data.name)) errs.push("Team name contains invalid characters");
		if (data.contactEmail && /[\x00-\x1f\x7f]/.test(data.contactEmail)) errs.push("Email contains invalid characters");
		if (data.contactEmail && data.contactEmail.length > 254) errs.push("Email must be 254 characters or less");
		if (data.contactEmail && !yup.string().email().isValidSync(data.contactEmail)) {
			errs.push("Invalid email format");
		}
		if (data.color && !/^#[0-9a-fA-F]{6}$/.test(data.color)) {
			errs.push("Color must be a valid hex code (e.g. #FF0000)");
		}
		return errs;
	};

	const handleSubmit = () => {
		const validationErrors = validateManualEntry({ name, contactEmail: email, color });
		setErrors(validationErrors);
		if (validationErrors.length === 0) {
			onSubmit(name, email, color);
		}
	};

	return (
		<div className="space-y-2 sm:space-y-3">
			<Input
				type="text"
				aria-label="Team name"
				placeholder="Team name"
				value={name}
				maxLength={100}
				onChange={(e) => setName(e.target.value)}
			/>
			<Input
				type="email"
				aria-label="Contact email"
				placeholder="Contact email"
				value={email}
				maxLength={254}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<div className="flex items-center gap-1.5 sm:gap-2">
				<Palette size={12} className="text-muted-foreground sm:w-3.5 sm:h-3.5" />
				<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 sm:w-8 sm:h-8 rounded cursor-pointer" aria-label="Team color" />
				<span className="text-[10px] sm:text-xs text-muted-foreground">Team color</span>
			</div>

			{errors.length > 0 && (
				<div className="space-y-1">
					{errors.map((err, i) => (
						<p key={i} className="text-xs text-error">{err}</p>
					))}
				</div>
			)}

			<Button
				type="button"
				onClick={handleSubmit}
				disabled={!name.trim()}
				className="w-full"
			>
				Add Team
			</Button>
		</div>
	);
}
