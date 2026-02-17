"use client";

import { Button, Loader, Select } from "@/components";
import { renderClubOption, renderGroupOption, renderTeamOption } from "@/components/features/clubs/utils";
import { Club, Group, Team } from "@/lib/models/Club";
import { ContextType } from "@/lib/models/shared/models";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { ContextIndicator } from "./ContextIndicator";

export type ContextSelection = {
	context: Club | Group | Team;
	contextType: ContextType;
} | null;

export type ContextSelectorProps = {
	clubs: Club[];
	onSelect: (selection: ContextSelection) => void;
};

const ContextSelector = ({ onSelect, clubs }: ContextSelectorProps) => {
	const [selectedClubId, setSelectedClubId] = React.useState<string>();
	const [selectedGroupId, setSelectedGroupId] = React.useState<string>();
	const [selectedTeamId, setSelectedTeamId] = React.useState<string>();

	if (!clubs || clubs.length === 0) {
		onSelect(null);
		return <Loader />;
	}

	const clubOptions = clubs.map((club) => ({
		value: club.id,
		label: club.name,
		data: club,
	}));

	const groupOptions = clubs
		.find((c) => c.id === selectedClubId)
		?.groups?.map((group: Group) => ({
			value: group.id,
			label: group.name,
			data: group,
		}));

	const teamOptions = clubs
		.find((c) => c.id === selectedClubId)
		?.teams?.map((team) => ({
			value: team.id,
			label: team.name,
			data: team,
		}));

	const getSelectedContext = (): ContextSelection => {
		if (selectedTeamId) {
			const team = teamOptions?.find((t) => t.value === selectedTeamId)?.data;

			if (!team) return null;

			team.club = clubs.find((c) => c.id === team?.clubId);

			return { context: team, contextType: "team" };
		}
		if (selectedGroupId) {
			const group = groupOptions?.find((g) => g.value === selectedGroupId)?.data;

			if (!group) return null;

			group.club = clubs.find((c) => c.id === group?.clubId);
			return { context: group, contextType: "group" };
		}
		if (selectedClubId) {
			const club = clubOptions.find((c) => c.value === selectedClubId)?.data;
			if (!club) return null;
			return { context: club, contextType: "club" };
		}
		return null;
	};

	return (
		<div className="flex flex-1 flex-col justify-between h-full animate-in fade-in slide-in-from-right-4 duration-300" data-testid="context-selector">
			<div className="space-y-4 sm:space-y-6">
				<div className="border-b-2 pb-3 sm:pb-4">
					<h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Select club, group, or team</h2>
					<p className="text-muted text-xs sm:text-sm">We see that you are part of the club, you can select it, so event is linked to it. This is optional.</p>
				</div>

				<motion.div
					layout
					transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
					className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-surface border border-border">
					<Select
						clearable={true}
						options={clubOptions}
						label="Club"
						data-testid="context-club-select"
						value={selectedClubId}
						onChange={(value) => {
							setSelectedClubId(value);
							setSelectedGroupId(undefined);
							setSelectedTeamId(undefined);
						}}
						renderOption={renderClubOption}
					/>
					<AnimatePresence mode="popLayout">
						{selectedClubId && !selectedGroupId && (
							<motion.div
								key="team-select"
								layout
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}>
								<Select
									clearable={true}
									disabled={!teamOptions || teamOptions.length == 0}
									options={teamOptions || []}
									label="Team"
									placeholder={!teamOptions || teamOptions.length == 0 ? "No teams available" : "Select a team"}
									value={selectedTeamId}
									onChange={(value) => setSelectedTeamId(value)}
									renderOption={renderTeamOption}
								/>
							</motion.div>
						)}
						{selectedClubId && !selectedTeamId && (
							<motion.div
								key="group-select"
								layout
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}>
								<div className="separator"></div>
								<Select
									clearable={true}
									disabled={!groupOptions || groupOptions.length == 0}
									options={groupOptions || []}
									label="Group"
									data-testid="context-group-select"
									placeholder={!groupOptions || groupOptions.length == 0 ? "No groups available" : "Select a group"}
									value={selectedGroupId}
									onChange={(value) => setSelectedGroupId(value)}
									renderOption={renderGroupOption}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				<AnimatePresence>
					{getSelectedContext() && (
						<motion.div
							key="context-indicator"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 8 }}
							transition={{ duration: 0.2 }}>
							<ContextIndicator context={getSelectedContext()?.context} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 justify-end mt-6">
				<Button variant={"ghost"} className="w-full sm:w-auto" onClick={() => onSelect(null)} data-testid="context-skip-button">
					Skip
				</Button>
				<Button disabled={!selectedClubId} className="w-full sm:w-auto" onClick={() => onSelect(getSelectedContext())} data-testid="context-continue-button">
					Continue
				</Button>
			</div>
		</div>
	);
};

export default ContextSelector;
