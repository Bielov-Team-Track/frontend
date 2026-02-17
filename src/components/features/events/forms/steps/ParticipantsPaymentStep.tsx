"use client";

import { Checkbox, CollapsibleSection, RadioCards, Select, Slider } from "@/components/ui";
import { UserSelectorModal } from "@/components/features/users";
import { EventFormat } from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventPaymentConfig";
import { UserProfile } from "@/lib/models/User";
import { LayoutGrid, List, User, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../context/EventFormContext";
import { InviteesSummaryCard } from "./registration/InviteesSummaryCard";

const eventFormatCards = [
	{
		value: EventFormat.List,
		label: "Open",
		description: "Simple participant list - no teams",
		icon: List,
	},
	{
		value: EventFormat.OpenTeams,
		label: "Open Teams",
		description: "Teams with generic player slots",
		icon: Users,
	},
	{
		value: EventFormat.TeamsWithPositions,
		label: "Positions",
		description: "Teams with volleyball positions",
		icon: LayoutGrid,
	},
];

const registrationUnitCards = [
	{
		value: Unit.Individual,
		label: "Individual",
		description: "Join any team with open slot",
		icon: User,
	},
	{
		value: Unit.Team,
		label: "Team",
		description: "Register as a full team",
		icon: Users,
	},
];

export default function ParticipantsPaymentStep() {
	const { form, context } = useEventFormContext();
	const {
		control,
		formState: { errors },
		watch,
		setValue,
	} = form;
	const values = watch();

	const eventFormat = values.eventFormat;
	const isPublic = values.isPublic;

	// Invitees modal state
	const [isInviteesModalOpen, setIsInviteesModalOpen] = useState(false);
	const [selectedUsersCache, setSelectedUsersCache] = useState<UserProfile[]>([]);

	// Handle invitees selection
	const handleInviteesConfirm = useCallback(
		(users: UserProfile[]) => {
			setSelectedUsersCache(users);
			setValue(
				"invitees",
				users.map((u) => u.id),
			);
		},
		[setValue],
	);

	return (
		<div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="participants-payment-step">
			{/* Participants Section Header */}
			<div className="border-b-2 pb-3 sm:pb-4">
				<h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Participants</h2>
				<p className="text-muted-foreground text-xs sm:text-sm">Configure who can join and how</p>
			</div>

			{/* Event Format */}
			<Controller
				name="eventFormat"
				control={control}
				render={({ field }) => (
					<RadioCards
						label="Event Format"
						data-testid="event-format-selector"
						options={eventFormatCards}
						value={field.value}
						onChange={field.onChange}
						error={errors.eventFormat?.message as string | undefined}
						columns={3}
					/>
				)}
			/>

			{/* Registration Unit - Only show when format is NOT Open */}
			{eventFormat !== EventFormat.List && (
				<Controller
					name="registrationUnit"
					control={control}
					render={({ field }) => (
						<RadioCards
							label="Registration Unit"
							data-testid="registration-unit-selector"
							options={registrationUnitCards}
							value={field.value}
							onChange={field.onChange}
							error={errors.registrationUnit?.message as string | undefined}
							columns={2}
						/>
					)}
				/>
			)}

			{/* Maximum Participants - Only show when format is Open */}
			{eventFormat === EventFormat.List && (
				<Controller
					name="capacity"
					control={control}
					render={({ field }) => (
						<Slider
							value={field.value ?? null}
							onChange={(e) => field.onChange(e.target.value)}
							min={1}
							max={100}
							step={1}
							editable
							clearable
							placeholder="Unlimited"
							label="Maximum Participants"
							optional
							helperText="Leave empty for unlimited participants"
							error={errors.capacity?.message as string | undefined}
							color="accent"
						/>
					)}
				/>
			)}

			{/* Invitees */}
			<InviteesSummaryCard selectedUsers={selectedUsersCache} onEdit={() => setIsInviteesModalOpen(true)} />

			<UserSelectorModal
				isOpen={isInviteesModalOpen}
				onClose={() => setIsInviteesModalOpen(false)}
				selectedUsers={selectedUsersCache}
				onConfirm={handleInviteesConfirm}
				title="Select Invitees"
				confirmLabel="Done"
				showFilters={true}
				defaultContext={context || undefined}
			/>

			{/* Advanced Section - Collapsible */}
			<CollapsibleSection label="Registration Settings" defaultOpen={false} data-testid="registration-settings-section">
				{/* Registration Type */}
				<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border">
					<Controller
						name="isPublic"
						control={control}
						render={({ field: { value, onChange, ...field } }) => (
							<Checkbox
								{...field}
								checked={value}
								onChange={onChange}
								label="Open Registration"
								helperText="When disabled, only invited participants can join"
								data-testid="is-public-checkbox"
							/>
						)}
					/>
				</div>

				{/* Casual Play Format - Only show when eventType is CasualPlay */}
				{values.type === "CasualPlay" && (
					<Controller
						name="casualPlayFormat"
						control={control}
						render={({ field }) => (
							<Select
								value={field.value || ""}
								onChange={field.onChange}
								data-testid="casual-play-format-selector"
								options={[
									{ value: "list", label: "List Format" },
									{ value: "openTeams", label: "Open Teams" },
									{ value: "teamsWithPositions", label: "Teams with Positions" },
								]}
								label="Casual Play Format"
								helperText="Select the format for casual play events"
							/>
						)}
					/>
				)}
			</CollapsibleSection>
		</div>
	);
}
