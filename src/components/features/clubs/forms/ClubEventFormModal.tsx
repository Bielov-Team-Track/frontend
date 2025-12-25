"use client";

import { Button, Input } from "@/components";
import Modal from "@/components/ui/modal";
import { Group, Team } from "@/lib/models/Club";
import { Check, Layers, Users } from "lucide-react";
import { useState } from "react";

export interface ClubEvent {
	id: string;
	name: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	location?: string;
	targetType: "all" | "teams" | "groups" | "custom";
	targetTeamIds?: string[];
	targetGroupIds?: string[];
	createdAt: Date;
}

interface ClubEventFormModalProps {
	isOpen: boolean;
	teams: Team[];
	groups: Group[];
	onClose: () => void;
	onSubmit: (event: Omit<ClubEvent, "id" | "createdAt">) => void;
}

const TARGET_OPTIONS = [
	{ value: "all" as const, label: "All Members", icon: Users },
	{ value: "teams" as const, label: "Specific Teams", icon: Users },
	{ value: "groups" as const, label: "Specific Groups", icon: Layers },
	{ value: "custom" as const, label: "Custom Selection", icon: Check },
];

export default function ClubEventFormModal({ isOpen, teams, groups, onClose, onSubmit }: ClubEventFormModalProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [location, setLocation] = useState("");
	const [startDate, setStartDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endDate, setEndDate] = useState("");
	const [endTime, setEndTime] = useState("");
	const [targetType, setTargetType] = useState<"all" | "teams" | "groups" | "custom">("all");
	const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !startDate || !startTime) return;

		const startDateTime = new Date(`${startDate}T${startTime}`);
		const endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}`) : new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

		onSubmit({
			name: name.trim(),
			description: description.trim() || undefined,
			location: location.trim() || undefined,
			startTime: startDateTime,
			endTime: endDateTime,
			targetType,
			targetTeamIds: targetType === "teams" || targetType === "custom" ? selectedTeamIds : undefined,
			targetGroupIds: targetType === "groups" || targetType === "custom" ? selectedGroupIds : undefined,
		});

		// Reset form
		setName("");
		setDescription("");
		setLocation("");
		setStartDate("");
		setStartTime("");
		setEndDate("");
		setEndTime("");
		setTargetType("all");
		setSelectedTeamIds([]);
		setSelectedGroupIds([]);
	};

	const toggleTeam = (teamId: string) => {
		setSelectedTeamIds((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
	};

	const toggleGroup = (groupId: string) => {
		setSelectedGroupIds((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]));
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Create Event" size="lg">
			<form onSubmit={handleSubmit} className="space-y-5">
				<Input label="Event Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Weekly Training Session" required />

				<div>
					<label className="block text-sm font-medium text-white mb-2">Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe your event..."
						rows={3}
						className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent resize-none"
					/>
				</div>

				<Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Main Gym, Beach Court" />

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-white mb-2">
							Start Date <span className="text-red-400">*</span>
						</label>
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-white mb-2">
							Start Time <span className="text-red-400">*</span>
						</label>
						<input
							type="time"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-white mb-2">End Date</label>
						<input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-white mb-2">End Time</label>
						<input
							type="time"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-white mb-3">Who is this event for?</label>
					<div className="grid grid-cols-2 gap-2">
						{TARGET_OPTIONS.map((option) => (
							<button
								key={option.value}
								type="button"
								onClick={() => setTargetType(option.value)}
								className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
									targetType === option.value
										? "bg-accent/20 border-accent text-white"
										: "bg-white/5 border-white/10 text-muted hover:border-white/20"
								}`}>
								<option.icon size={16} />
								<span className="text-sm">{option.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Team Selection */}
				{(targetType === "teams" || targetType === "custom") && teams.length > 0 && (
					<div>
						<label className="block text-sm font-medium text-white mb-2">Select Teams</label>
						<div className="space-y-2 max-h-40 overflow-y-auto">
							{teams.map((team) => (
								<button
									key={team.id}
									type="button"
									onClick={() => toggleTeam(team.id)}
									className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
										selectedTeamIds.includes(team.id) ? "bg-accent/20 border-accent" : "bg-white/5 border-white/10 hover:border-white/20"
									}`}>
									<div className="flex items-center gap-3">
										<Users size={16} className="text-muted" />
										<span className="text-sm text-white">{team.name}</span>
									</div>
									{selectedTeamIds.includes(team.id) && <Check size={16} className="text-accent" />}
								</button>
							))}
						</div>
					</div>
				)}

				{/* Group Selection */}
				{(targetType === "groups" || targetType === "custom") && groups.length > 0 && (
					<div>
						<label className="block text-sm font-medium text-white mb-2">Select Groups</label>
						<div className="space-y-2 max-h-40 overflow-y-auto">
							{groups.map((group) => (
								<button
									key={group.id}
									type="button"
									onClick={() => toggleGroup(group.id)}
									className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
										selectedGroupIds.includes(group.id) ? "bg-accent/20 border-accent" : "bg-white/5 border-white/10 hover:border-white/20"
									}`}>
									<div className="flex items-center gap-3">
										<div
											className="w-4 h-4 rounded"
											style={{
												backgroundColor: group.color || "#6B7280",
											}}
										/>
										<span className="text-sm text-white">{group.name}</span>
									</div>
									{selectedGroupIds.includes(group.id) && <Check size={16} className="text-accent" />}
								</button>
							))}
						</div>
					</div>
				)}

				{/* No teams/groups message */}
				{targetType === "teams" && teams.length === 0 && (
					<div className="text-center py-4 text-muted text-sm">No teams available. Create teams first to target them.</div>
				)}
				{targetType === "groups" && groups.length === 0 && (
					<div className="text-center py-4 text-muted text-sm">No groups available. Create groups first to target them.</div>
				)}

				<div className="flex gap-3 pt-4">
					<Button type="button" variant="ghost" color="neutral" fullWidth onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="solid" color="accent" fullWidth disabled={!name.trim() || !startDate || !startTime}>
						Create Event
					</Button>
				</div>
			</form>
		</Modal>
	);
}
