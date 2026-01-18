# Event Registration Step Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Settings step with a dynamic Registration step that adapts based on event type (Match, Social, Training, Casual Play).

**Architecture:** Multi-phase implementation starting with foundation changes (move isPrivate, create step shell), then building out each registration mode (List format, Match teams, Casual Play teams). Each phase builds on the previous, with shared components extracted where appropriate.

**Tech Stack:** React, TypeScript, React Hook Form, Yup validation, Tailwind CSS, existing UI components (RadioCards, Checkbox, ColorPicker, Input)

---

## Phase 1: Foundation & Step Shell

### Task 1.1: Add isPrivate to EventDetailsStep

**Files:**
- Modify: `src/components/features/events/forms/steps/EventDetailsStep.tsx`

**Step 1: Add Checkbox import**

Add to imports at top of file:
```tsx
import { Checkbox, Input, RadioCards, TextArea } from "@/components";
```

**Step 2: Add isPrivate field after Playing Surface**

Add after the closing `</Controller>` of the surface field (after line 130):
```tsx
<div className="p-4 rounded-xl bg-white/5 border border-white/10">
	<Controller
		name="isPrivate"
		control={control}
		render={({ field: { value, onChange, ...field } }) => (
			<Checkbox
				{...field}
				checked={value}
				onChange={onChange}
				label="Private Event"
				helperText="Private events are only visible to invited participants"
			/>
		)}
	/>
</div>
```

**Step 3: Verify file saves without syntax errors**

---

### Task 1.2: Update Step Validation Fields

**Files:**
- Modify: `src/components/features/events/forms/constants/eventFormOptions.ts`

**Step 1: Add isPrivate to step 1 validation**

Change line 24 from:
```typescript
1: ["name", "type", "surface"],
```
to:
```typescript
1: ["name", "type", "surface", "isPrivate"],
```

**Step 2: Update step 4 validation for new Registration step**

Change line 27 from:
```typescript
4: ["eventFormat", "courtsNumber"],
```
to:
```typescript
4: ["registrationType"],
```

---

### Task 1.3: Create Registration Types

**Files:**
- Create: `src/components/features/events/forms/types/registration.ts`

**Step 1: Create the file with all registration types**

```typescript
import { EventType } from "@/lib/models/Event";

// Registration type - open or closed
export type RegistrationType = "open" | "closed";

// Registration unit for open registration
export type RegistrationUnit = "individual" | "team";

// Team slot selection type
export type TeamSlotType = "own" | "invited" | "manual";

// Team slot for Match events
export interface MatchTeamSlot {
	type: TeamSlotType;
	teamId?: string;
	invitationId?: string;
	name?: string;
	contactEmail?: string;
	color?: string;
	status?: "pending" | "accepted" | "declined";
}

// Team slot for Casual Play (open registration)
export interface CasualTeamSlot {
	name: string;
	color: string;
}

// Team for Casual Play (closed registration)
export interface CasualTeamClosed {
	type: "invited" | "created";
	teamId?: string;
	name?: string;
	color?: string;
	captainId?: string;
	status?: "pending" | "accepted" | "declined";
}

// Invitee types
export type InviteeType = "user" | "team" | "group" | "club";

export interface Invitee {
	type: InviteeType;
	id: string;
	name: string;
	avatarUrl?: string;
	memberCount?: number; // for groups/teams/clubs
	excludedUserIds?: string[]; // for granular control
}

// Event format determined by event type
export function getEventFormatForType(eventType: EventType): "match" | "list" | "choice" {
	switch (eventType) {
		case EventType.Match:
			return "match";
		case EventType.Social:
		case EventType.TrainingSession:
			return "list";
		case EventType.CasualPlay:
			return "choice";
		default:
			return "list";
	}
}

// Casual Play format options
export type CasualPlayFormat = "list" | "openTeams" | "teamsWithPositions";
```

---

### Task 1.4: Update Validation Schema

**Files:**
- Modify: `src/components/features/events/forms/validation/eventValidationSchema.ts`

**Step 1: Add new imports**

Add after line 8:
```typescript
import type {
	RegistrationType,
	RegistrationUnit,
	CasualPlayFormat
} from "../types/registration";
```

**Step 2: Add registrationType field**

Add after line 74 (after isPrivate):
```typescript
registrationType: yup
	.mixed<RegistrationType>()
	.oneOf(["open", "closed"] as const)
	.default("open")
	.required("Registration type is required"),
registrationOpenTime: yup.date().nullable().optional(),
registrationDeadline: yup.date().nullable().optional(),
casualPlayFormat: yup
	.mixed<CasualPlayFormat>()
	.oneOf(["list", "openTeams", "teamsWithPositions"] as const)
	.optional(),
```

**Step 3: Remove approveGuests and teamsNumber fields**

Delete lines 42-50 (approveGuests and teamsNumber definitions).

**Step 4: Update EventFormData export**

The type will auto-update from schema inference.

---

### Task 1.5: Update Default Form Values

**Files:**
- Modify: `src/components/features/events/forms/utils/eventFormUtils.ts`

**Step 1: Update getDefaultFormValues**

Replace the function (lines 45-80) with:
```typescript
export function getDefaultFormValues() {
	const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
	const tomorrowPlus2Hours = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000);

	return {
		startTime: tomorrow,
		endTime: tomorrowPlus2Hours,
		location: {
			name: "",
			address: "",
			city: "",
			country: "",
			postalCode: "",
			latitude: undefined,
			longitude: undefined,
		},
		name: "",
		courtsNumber: 1,
		type: EventType.CasualPlay,
		eventFormat: EventFormat.TeamsWithPositions,
		registrationUnit: Unit.Individual,
		surface: PlayingSurface.Indoor,
		isPrivate: false,
		capacity: null,
		description: "",
		payToEnter: false,
		useBudget: false,
		budget: {
			pricingModel: PricingModel.Individual,
			cost: 0,
			payToJoin: false,
			minUnitsForBudget: undefined,
			dropoutDeadlineHours: undefined,
		},
		// New registration fields
		registrationType: "open" as const,
		registrationOpenTime: null,
		registrationDeadline: null,
		casualPlayFormat: undefined,
	};
}
```

**Step 2: Update transformFormDataToCreateEvent**

Remove `approveGuests` and `teamsNumber` from the transform function. Update lines 11-43:
```typescript
export function transformFormDataToCreateEvent(
	data: EventFormData,
): CreateEvent {
	return {
		startTime: new Date(data.startTime),
		endTime: new Date(data.endTime),
		location: {
			name: data.location.name,
			address: data.location.address,
			city: data.location.city,
			country: data.location.country,
			postalCode: data.location.postalCode,
			latitude: data.location.latitude,
			longitude: data.location.longitude,
		},
		budget: data.useBudget ? {
			cost: data.budget?.cost ?? 0,
			payToJoin: data.budget?.payToJoin ?? false,
			pricingModel: data.budget?.pricingModel ?? PricingModel.Individual,
			dropoutDeadlineHours: data.budget?.dropoutDeadlineHours,
			minUnitsForBudget: data.budget?.minUnitsForBudget,
		} : undefined,
		name: data.name,
		eventFormat: data.eventFormat,
		registrationUnit: data.registrationUnit,
		type: data.type,
		surface: data.surface,
		isPrivate: !!data.isPrivate,
		// Registration fields will be added as we implement them
	};
}
```

---

### Task 1.6: Create RegistrationStep Shell

**Files:**
- Create: `src/components/features/events/forms/steps/RegistrationStep.tsx`

**Step 1: Create the component file**

```tsx
import { EventType } from "@/lib/models/Event";
import { useEventFormContext } from "../context/EventFormContext";
import { getEventFormatForType } from "../types/registration";

export function RegistrationStep() {
	const { form } = useEventFormContext();
	const { watch } = form;
	const eventType = watch("type") as EventType;

	const formatType = getEventFormatForType(eventType);

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b-2 pb-4">
				<h2 className="text-xl font-bold text-white mb-1">Registration</h2>
				<p className="text-muted text-sm">Configure how participants can join your event.</p>
			</div>

			<div className="space-y-6">
				{formatType === "match" && (
					<div className="p-4 rounded-xl bg-white/5 border border-white/10">
						<p className="text-muted text-sm">Match team selection coming in Phase 3...</p>
					</div>
				)}

				{formatType === "list" && (
					<div className="p-4 rounded-xl bg-white/5 border border-white/10">
						<p className="text-muted text-sm">List registration coming in Phase 2...</p>
					</div>
				)}

				{formatType === "choice" && (
					<div className="p-4 rounded-xl bg-white/5 border border-white/10">
						<p className="text-muted text-sm">Casual Play format selection coming in Phase 4...</p>
					</div>
				)}
			</div>
		</div>
	);
}
```

---

### Task 1.7: Update Step Config

**Files:**
- Modify: `src/components/features/events/forms/config/stepConfig.tsx`

**Step 1: Update imports**

Replace line 3:
```tsx
import { EventSettingsStep } from "../steps/EventSettingsStep";
```
with:
```tsx
import { RegistrationStep } from "../steps/RegistrationStep";
```

**Step 2: Update step 4 config**

Replace lines 34-38:
```tsx
4: {
	id: 4,
	label: "Registration",
	key: "registration",
	component: RegistrationStep,
},
```

---

### Task 1.8: Update Wizard Validation Logic

**Files:**
- Modify: `src/components/features/events/forms/hooks/useEventWizard.ts`

**Step 1: Remove old teamsNumber validation**

Delete lines 37-40 (the dynamic validation for step 4 with teamsNumber).

**Step 2: The new step 4 validation is simpler**

The `STEP_VALIDATION_FIELDS` already updated in Task 1.2 handles the basic case.

---

### Task 1.9: Phase 1 Verification

**Step 1: Check all files compile**

Open each modified file and verify no TypeScript errors.

**Step 2: Manual test**

- Navigate to event creation form
- Verify isPrivate checkbox appears in Event Details step
- Verify step 4 shows "Registration" label
- Verify Registration step shows placeholder based on event type

---

## Phase 2: List Format Registration

### Task 2.1: Create RegistrationTypeSelector Component

**Files:**
- Create: `src/components/features/events/forms/steps/registration/RegistrationTypeSelector.tsx`

**Step 1: Create the component**

```tsx
import { RadioCards } from "@/components/ui";
import { Lock, Unlock } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";
import type { RegistrationType } from "../../types/registration";

const registrationTypeCards = [
	{
		value: "open" as RegistrationType,
		label: "Open",
		description: "Anyone with access can register",
		icon: Unlock,
	},
	{
		value: "closed" as RegistrationType,
		label: "Closed",
		description: "Invitees only",
		icon: Lock,
	},
];

export function RegistrationTypeSelector() {
	const { form } = useEventFormContext();
	const { control, formState: { errors } } = form;

	return (
		<Controller
			name="registrationType"
			control={control}
			render={({ field }) => (
				<RadioCards
					label="Registration Type"
					options={registrationTypeCards}
					value={field.value}
					onChange={field.onChange}
					error={errors.registrationType?.message}
					columns={2}
				/>
			)}
		/>
	);
}
```

---

### Task 2.2: Create RegistrationTimingFields Component

**Files:**
- Create: `src/components/features/events/forms/steps/registration/RegistrationTimingFields.tsx`

**Step 1: Create the component**

```tsx
import { Input } from "@/components/ui";
import { Calendar, Clock } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";

export function RegistrationTimingFields() {
	const { form } = useEventFormContext();
	const { control, watch, formState: { errors } } = form;

	const startTime = watch("startTime");

	// Format date for datetime-local input
	const formatDateTimeLocal = (date: Date | null | undefined): string => {
		if (!date) return "";
		const d = new Date(date);
		const offset = d.getTimezoneOffset();
		const adjusted = new Date(d.getTime() - offset * 60 * 1000);
		return adjusted.toISOString().slice(0, 16);
	};

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-medium text-white">Registration Timing</h3>

			<Controller
				name="registrationOpenTime"
				control={control}
				render={({ field: { value, onChange, ...field } }) => (
					<Input
						{...field}
						type="datetime-local"
						label="Registration Opens"
						value={formatDateTimeLocal(value)}
						onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
						leftIcon={<Calendar size={16} />}
						error={errors.registrationOpenTime?.message}
						helperText="Leave empty to open registration immediately"
						optional
					/>
				)}
			/>

			<Controller
				name="registrationDeadline"
				control={control}
				render={({ field: { value, onChange, ...field } }) => (
					<Input
						{...field}
						type="datetime-local"
						label="Registration Deadline"
						value={formatDateTimeLocal(value)}
						onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
						leftIcon={<Clock size={16} />}
						error={errors.registrationDeadline?.message}
						helperText={`Default: Event start time (${startTime ? new Date(startTime).toLocaleString() : "not set"})`}
						optional
					/>
				)}
			/>
		</div>
	);
}
```

---

### Task 2.3: Create CapacityField Component

**Files:**
- Create: `src/components/features/events/forms/steps/registration/CapacityField.tsx`

**Step 1: Create the component**

```tsx
import { Input } from "@/components/ui";
import { Users } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";

export function CapacityField() {
	const { form } = useEventFormContext();
	const { control, formState: { errors } } = form;

	return (
		<Controller
			name="capacity"
			control={control}
			render={({ field: { value, ...field } }) => (
				<Input
					{...field}
					value={value ?? ""}
					type="number"
					label="Maximum Participants"
					leftIcon={<Users size={16} />}
					error={errors.capacity?.message}
					min="1"
					helperText="Leave empty for unlimited participants"
					optional
				/>
			)}
		/>
	);
}
```

---

### Task 2.4: Create ListRegistration Component

**Files:**
- Create: `src/components/features/events/forms/steps/registration/ListRegistration.tsx`

**Step 1: Create the component**

```tsx
import { RegistrationTypeSelector } from "./RegistrationTypeSelector";
import { RegistrationTimingFields } from "./RegistrationTimingFields";
import { CapacityField } from "./CapacityField";
import { useEventFormContext } from "../../context/EventFormContext";

export function ListRegistration() {
	const { form } = useEventFormContext();
	const { watch } = form;
	const registrationType = watch("registrationType");

	return (
		<div className="space-y-6">
			<RegistrationTypeSelector />

			<div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
				<CapacityField />
			</div>

			<div className="p-4 rounded-xl bg-white/5 border border-white/10">
				<RegistrationTimingFields />
			</div>

			{/* Invitee selector placeholder - will be implemented in Phase 2.2 */}
			<div className="p-4 rounded-xl bg-white/5 border border-white/10">
				<h3 className="text-sm font-medium text-white mb-2">Invitees</h3>
				<p className="text-muted text-sm">
					{registrationType === "closed"
						? "Add people who can participate in this event."
						: "Optionally invite specific people (they'll be notified)."}
				</p>
				<div className="mt-4 p-8 border-2 border-dashed border-white/20 rounded-xl text-center text-muted text-sm">
					Invitee selector coming soon...
				</div>
			</div>
		</div>
	);
}
```

---

### Task 2.5: Update RegistrationStep to Use ListRegistration

**Files:**
- Modify: `src/components/features/events/forms/steps/RegistrationStep.tsx`

**Step 1: Update imports**

Add at top:
```tsx
import { ListRegistration } from "./registration/ListRegistration";
```

**Step 2: Replace list placeholder**

Replace the `{formatType === "list" && (...)}` block with:
```tsx
{formatType === "list" && <ListRegistration />}
```

---

### Task 2.6: Create Registration Components Index

**Files:**
- Create: `src/components/features/events/forms/steps/registration/index.ts`

**Step 1: Create the barrel export**

```typescript
export { RegistrationTypeSelector } from "./RegistrationTypeSelector";
export { RegistrationTimingFields } from "./RegistrationTimingFields";
export { CapacityField } from "./CapacityField";
export { ListRegistration } from "./ListRegistration";
```

---

### Task 2.7: Phase 2 Verification

**Step 1: Manual test**

- Create event with type Social or Training
- Verify Registration step shows open/closed toggle
- Verify capacity field appears
- Verify timing fields appear
- Verify invitee placeholder shows

---

## Phase 3: Match Team Slots

### Task 3.1: Create TeamSlotCard Component

**Files:**
- Create: `src/components/features/events/forms/steps/registration/TeamSlotCard.tsx`

**Step 1: Create the component**

```tsx
import { cn } from "@/lib/utils";
import { Check, Clock, X, ChevronDown, Users, Mail, Palette } from "lucide-react";
import { useState } from "react";
import type { MatchTeamSlot, TeamSlotType } from "../../types/registration";

interface TeamSlotCardProps {
	label: string; // "Home Team" or "Away Team"
	slot: MatchTeamSlot | null;
	onChange: (slot: MatchTeamSlot | null) => void;
	userTeams: Array<{ id: string; name: string; clubName: string; color?: string }>;
	disabled?: boolean;
}

type SelectionMode = "own" | "invite" | "manual" | null;

export function TeamSlotCard({ label, slot, onChange, userTeams, disabled }: TeamSlotCardProps) {
	const [mode, setMode] = useState<SelectionMode>(slot?.type || null);
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

	const handleTeamSelect = (teamId: string, team: typeof userTeams[0]) => {
		onChange({
			type: "own",
			teamId,
			name: team.name,
			color: team.color,
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
		<div className={cn(
			"rounded-xl border transition-all",
			slot ? "bg-white/5 border-white/20" : "bg-white/5 border-white/10",
			disabled && "opacity-50 pointer-events-none"
		)}>
			{/* Header */}
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full p-4 flex items-center justify-between text-left"
			>
				<div className="flex items-center gap-3">
					{slot?.color && (
						<div
							className="w-4 h-4 rounded-full border border-white/20"
							style={{ backgroundColor: slot.color }}
						/>
					)}
					<div>
						<div className="text-sm font-medium text-white">{label}</div>
						{slot?.name ? (
							<div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
								{slot.name}
								{getStatusIcon()}
								{getStatusText() && (
									<span className={cn(
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
				<ChevronDown
					size={16}
					className={cn(
						"text-muted transition-transform",
						isExpanded && "rotate-180"
					)}
				/>
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
							)}
						>
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
							)}
						>
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
							)}
						>
							<Mail size={14} className="mx-auto mb-1" />
							Manual
						</button>
					</div>

					{/* Mode Content */}
					{mode === "own" && (
						<OwnTeamSelector
							teams={userTeams}
							selectedId={slot?.teamId}
							onSelect={handleTeamSelect}
						/>
					)}
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
					{mode === "manual" && (
						<ManualTeamEntry onSubmit={handleManualSubmit} />
					)}

					{/* Clear Button */}
					{slot && (
						<button
							type="button"
							onClick={() => {
								onChange(null);
								setMode(null);
							}}
							className="w-full p-2 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
						>
							Clear Selection
						</button>
					)}
				</div>
			)}
		</div>
	);
}

// Sub-components

function OwnTeamSelector({
	teams,
	selectedId,
	onSelect
}: {
	teams: TeamSlotCardProps["userTeams"];
	selectedId?: string;
	onSelect: (id: string, team: TeamSlotCardProps["userTeams"][0]) => void;
}) {
	if (teams.length === 0) {
		return (
			<div className="p-4 text-center text-muted text-sm">
				You don't have any teams yet.
			</div>
		);
	}

	return (
		<div className="space-y-2 max-h-48 overflow-y-auto">
			{teams.map((team) => (
				<button
					key={team.id}
					type="button"
					onClick={() => onSelect(team.id, team)}
					className={cn(
						"w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3",
						selectedId === team.id
							? "bg-accent/20 border border-accent"
							: "bg-white/5 border border-white/10 hover:bg-white/10"
					)}
				>
					{team.color && (
						<div
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: team.color }}
						/>
					)}
					<div>
						<div className="text-sm font-medium text-white">{team.name}</div>
						<div className="text-xs text-muted">{team.clubName}</div>
					</div>
					{selectedId === team.id && (
						<Check size={14} className="ml-auto text-accent" />
					)}
				</button>
			))}
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
				<input
					type="color"
					value={color}
					onChange={(e) => setColor(e.target.value)}
					className="w-8 h-8 rounded cursor-pointer"
				/>
				<span className="text-xs text-muted">Team color</span>
			</div>
			<button
				type="button"
				onClick={handleSubmit}
				disabled={!name || !email}
				className={cn(
					"w-full p-2 rounded-lg text-sm font-medium transition-colors",
					name && email
						? "bg-accent hover:bg-accent/90 text-white"
						: "bg-white/10 text-muted cursor-not-allowed"
				)}
			>
				Add Team
			</button>
		</div>
	);
}
```

---

### Task 3.2: Create MatchTeamSlots Component

**Files:**
- Create: `src/components/features/events/forms/steps/registration/MatchTeamSlots.tsx`

**Step 1: Create the component**

```tsx
import { useState } from "react";
import { TeamSlotCard } from "./TeamSlotCard";
import type { MatchTeamSlot } from "../../types/registration";
import { useEventFormContext } from "../../context/EventFormContext";
import { RegistrationTimingFields } from "./RegistrationTimingFields";

// Mock data - will be replaced with actual API call
const mockUserTeams = [
	{ id: "1", name: "Beach Volleyers", clubName: "Sunset Beach Club", color: "#FF6B6B" },
	{ id: "2", name: "Indoor Warriors", clubName: "City Sports Club", color: "#4ECDC4" },
	{ id: "3", name: "Sand Devils", clubName: "Sunset Beach Club", color: "#45B7D1" },
];

export function MatchTeamSlots() {
	const { form } = useEventFormContext();
	// These would be form fields in a real implementation
	const [homeTeam, setHomeTeam] = useState<MatchTeamSlot | null>(null);
	const [awayTeam, setAwayTeam] = useState<MatchTeamSlot | null>(null);

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<h3 className="text-sm font-medium text-white">Team Selection</h3>

				<TeamSlotCard
					label="Home Team"
					slot={homeTeam}
					onChange={setHomeTeam}
					userTeams={mockUserTeams}
				/>

				<div className="flex items-center gap-4">
					<div className="flex-1 h-px bg-white/10" />
					<span className="text-xs text-muted font-medium">VS</span>
					<div className="flex-1 h-px bg-white/10" />
				</div>

				<TeamSlotCard
					label="Away Team"
					slot={awayTeam}
					onChange={setAwayTeam}
					userTeams={mockUserTeams}
				/>
			</div>

			<div className="p-4 rounded-xl bg-white/5 border border-white/10">
				<RegistrationTimingFields />
			</div>

			{/* Match info note */}
			<div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
				<p className="text-sm text-blue-300">
					<strong>Note:</strong> Match functionality (scoring, results) will be available
					regardless of whether invited teams have accepted.
				</p>
			</div>
		</div>
	);
}
```

---

### Task 3.3: Update RegistrationStep for Match

**Files:**
- Modify: `src/components/features/events/forms/steps/RegistrationStep.tsx`

**Step 1: Add import**

```tsx
import { MatchTeamSlots } from "./registration/MatchTeamSlots";
```

**Step 2: Replace match placeholder**

Replace `{formatType === "match" && (...)}` with:
```tsx
{formatType === "match" && <MatchTeamSlots />}
```

---

### Task 3.4: Update Registration Index

**Files:**
- Modify: `src/components/features/events/forms/steps/registration/index.ts`

**Step 1: Add new exports**

```typescript
export { RegistrationTypeSelector } from "./RegistrationTypeSelector";
export { RegistrationTimingFields } from "./RegistrationTimingFields";
export { CapacityField } from "./CapacityField";
export { ListRegistration } from "./ListRegistration";
export { TeamSlotCard } from "./TeamSlotCard";
export { MatchTeamSlots } from "./MatchTeamSlots";
```

---

### Task 3.5: Phase 3 Verification

**Step 1: Manual test**

- Create event with type Match
- Verify Registration step shows Home/Away team slots
- Verify clicking slot expands with mode selection
- Verify Your Team shows mock teams
- Verify Manual entry works with name, email, color
- Verify timing fields appear below team slots

---

## Phase 4: Casual Play Registration

### Task 4.1: Create CasualPlayFormatSelector Component

**Files:**
- Create: `src/components/features/events/forms/steps/registration/CasualPlayFormatSelector.tsx`

**Step 1: Create the component**

```tsx
import { RadioCards } from "@/components/ui";
import { List, Users, LayoutGrid } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";
import type { CasualPlayFormat } from "../../types/registration";

const formatCards = [
	{
		value: "list" as CasualPlayFormat,
		label: "List",
		description: "Simple participant list",
		icon: List,
	},
	{
		value: "openTeams" as CasualPlayFormat,
		label: "Open Teams",
		description: "Teams with generic player slots",
		icon: Users,
	},
	{
		value: "teamsWithPositions" as CasualPlayFormat,
		label: "Positions",
		description: "Teams with volleyball positions",
		icon: LayoutGrid,
	},
];

export function CasualPlayFormatSelector() {
	const { form } = useEventFormContext();
	const { control, formState: { errors } } = form;

	return (
		<Controller
			name="casualPlayFormat"
			control={control}
			render={({ field }) => (
				<RadioCards
					label="Event Format"
					options={formatCards}
					value={field.value}
					onChange={field.onChange}
					error={errors.casualPlayFormat?.message}
					columns={3}
				/>
			)}
		/>
	);
}
```

---

### Task 4.2: Create CasualPlayTeamSlots Component (Open Registration)

**Files:**
- Create: `src/components/features/events/forms/steps/registration/CasualPlayTeamSlots.tsx`

**Step 1: Create the component**

```tsx
import { useState } from "react";
import { Plus, X, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorPicker, DEFAULT_PRESET_COLORS } from "@/components/ui/color-picker";
import type { CasualTeamSlot } from "../../types/registration";

interface CasualPlayTeamSlotsProps {
	slots: CasualTeamSlot[];
	onChange: (slots: CasualTeamSlot[]) => void;
}

export function CasualPlayTeamSlots({ slots, onChange }: CasualPlayTeamSlotsProps) {
	const addSlot = () => {
		const usedColors = slots.map(s => s.color);
		const availableColor = DEFAULT_PRESET_COLORS.find(c => !usedColors.includes(c)) || DEFAULT_PRESET_COLORS[0];

		onChange([
			...slots,
			{ name: `Team ${slots.length + 1}`, color: availableColor }
		]);
	};

	const removeSlot = (index: number) => {
		onChange(slots.filter((_, i) => i !== index));
	};

	const updateSlot = (index: number, updates: Partial<CasualTeamSlot>) => {
		onChange(slots.map((slot, i) => i === index ? { ...slot, ...updates } : slot));
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-white">Team Slots</h3>
				<button
					type="button"
					onClick={addSlot}
					className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
				>
					<Plus size={14} />
					Add Team
				</button>
			</div>

			<div className="space-y-3">
				{slots.map((slot, index) => (
					<div
						key={index}
						className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
					>
						<div
							className="w-6 h-6 rounded-full border border-white/20 cursor-pointer relative group"
							style={{ backgroundColor: slot.color }}
						>
							<input
								type="color"
								value={slot.color}
								onChange={(e) => updateSlot(index, { color: e.target.value })}
								className="absolute inset-0 opacity-0 cursor-pointer"
							/>
						</div>

						<input
							type="text"
							value={slot.name}
							onChange={(e) => updateSlot(index, { name: e.target.value })}
							className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent"
							placeholder="Team name"
						/>

						{slots.length > 2 && (
							<button
								type="button"
								onClick={() => removeSlot(index)}
								className="p-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
							>
								<X size={16} />
							</button>
						)}
					</div>
				))}
			</div>

			{slots.length < 2 && (
				<p className="text-xs text-yellow-400">
					Add at least 2 teams to continue
				</p>
			)}
		</div>
	);
}
```

---

### Task 4.3: Create CasualPlayRegistration Component

**Files:**
- Create: `src/components/features/events/forms/steps/registration/CasualPlayRegistration.tsx`

**Step 1: Create the component**

```tsx
import { useState } from "react";
import { RadioCards } from "@/components/ui";
import { User, Users } from "lucide-react";
import { CasualPlayFormatSelector } from "./CasualPlayFormatSelector";
import { RegistrationTypeSelector } from "./RegistrationTypeSelector";
import { RegistrationTimingFields } from "./RegistrationTimingFields";
import { CapacityField } from "./CapacityField";
import { CasualPlayTeamSlots } from "./CasualPlayTeamSlots";
import { ListRegistration } from "./ListRegistration";
import { useEventFormContext } from "../../context/EventFormContext";
import type { CasualPlayFormat, CasualTeamSlot, RegistrationUnit } from "../../types/registration";
import { Controller } from "react-hook-form";

const registrationUnitCards = [
	{
		value: "individual" as RegistrationUnit,
		label: "Individual",
		description: "Join any team with open slot",
		icon: User,
	},
	{
		value: "team" as RegistrationUnit,
		label: "Team",
		description: "Register as a full team",
		icon: Users,
	},
];

export function CasualPlayRegistration() {
	const { form } = useEventFormContext();
	const { watch, control, formState: { errors } } = form;

	const casualPlayFormat = watch("casualPlayFormat") as CasualPlayFormat | undefined;
	const registrationType = watch("registrationType");

	// Local state for team slots (will be moved to form state later)
	const [teamSlots, setTeamSlots] = useState<CasualTeamSlot[]>([
		{ name: "Team 1", color: "#FF6B6B" },
		{ name: "Team 2", color: "#4ECDC4" },
	]);

	// If list format, use ListRegistration
	if (casualPlayFormat === "list") {
		return (
			<div className="space-y-6">
				<CasualPlayFormatSelector />
				<ListRegistration />
			</div>
		);
	}

	// If teams format
	if (casualPlayFormat === "openTeams" || casualPlayFormat === "teamsWithPositions") {
		return (
			<div className="space-y-6">
				<CasualPlayFormatSelector />
				<RegistrationTypeSelector />

				{registrationType === "open" && (
					<>
						{/* Registration Unit */}
						<Controller
							name="registrationUnit"
							control={control}
							render={({ field }) => (
								<RadioCards
									label="Registration Unit"
									options={registrationUnitCards}
									value={field.value}
									onChange={field.onChange}
									error={errors.registrationUnit?.message}
									columns={2}
								/>
							)}
						/>

						{/* Team Slots */}
						<div className="p-4 rounded-xl bg-white/5 border border-white/10">
							<CasualPlayTeamSlots
								slots={teamSlots}
								onChange={setTeamSlots}
							/>
						</div>
					</>
				)}

				{registrationType === "closed" && (
					<div className="p-4 rounded-xl bg-white/5 border border-white/10">
						<h3 className="text-sm font-medium text-white mb-2">Teams</h3>
						<p className="text-muted text-sm mb-4">
							Invite existing teams or create teams with captains who will manage rosters.
						</p>
						<div className="p-8 border-2 border-dashed border-white/20 rounded-xl text-center text-muted text-sm">
							Closed registration team management coming in Phase 5...
						</div>
					</div>
				)}

				<div className="p-4 rounded-xl bg-white/5 border border-white/10">
					<RegistrationTimingFields />
				</div>
			</div>
		);
	}

	// No format selected yet - just show format selector
	return (
		<div className="space-y-6">
			<CasualPlayFormatSelector />

			<div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
				<p className="text-muted text-sm">
					Select a format above to configure registration settings.
				</p>
			</div>
		</div>
	);
}
```

---

### Task 4.4: Update RegistrationStep for Casual Play

**Files:**
- Modify: `src/components/features/events/forms/steps/RegistrationStep.tsx`

**Step 1: Update imports**

Add:
```tsx
import { CasualPlayRegistration } from "./registration/CasualPlayRegistration";
```

**Step 2: Replace choice placeholder**

Replace `{formatType === "choice" && (...)}` with:
```tsx
{formatType === "choice" && <CasualPlayRegistration />}
```

---

### Task 4.5: Update Registration Index

**Files:**
- Modify: `src/components/features/events/forms/steps/registration/index.ts`

**Step 1: Add new exports**

```typescript
export { RegistrationTypeSelector } from "./RegistrationTypeSelector";
export { RegistrationTimingFields } from "./RegistrationTimingFields";
export { CapacityField } from "./CapacityField";
export { ListRegistration } from "./ListRegistration";
export { TeamSlotCard } from "./TeamSlotCard";
export { MatchTeamSlots } from "./MatchTeamSlots";
export { CasualPlayFormatSelector } from "./CasualPlayFormatSelector";
export { CasualPlayTeamSlots } from "./CasualPlayTeamSlots";
export { CasualPlayRegistration } from "./CasualPlayRegistration";
```

---

### Task 4.6: Phase 4 Verification

**Step 1: Manual test**

- Create event with type Casual Play
- Verify format selector shows List/Open Teams/Positions options
- Select "List" → verify ListRegistration appears
- Select "Open Teams" → verify:
  - Registration type selector appears
  - With "Open": registration unit + team slots appear
  - With "Closed": placeholder for team management appears
- Verify team slots can be added/removed
- Verify team colors can be changed

---

## Phase 5: Invitee Selector (Future)

> Note: This phase is documented but not implemented in the initial release. It will be tackled after the core registration functionality is complete.

### Task 5.1: Create InviteeSearch Component
### Task 5.2: Create InviteeList Component
### Task 5.3: Create InviteeSelector Component
### Task 5.4: Integrate with ListRegistration
### Task 5.5: Add bulk selection for clubs/teams/groups

---

## Summary

**Phase 1:** Foundation - Move isPrivate, create types, update schema, create step shell
**Phase 2:** List Registration - Open/closed toggle, timing, capacity, invitee placeholder
**Phase 3:** Match Teams - Home/Away slots, team selection modes, manual entry
**Phase 4:** Casual Play - Format selector, team slots for open registration
**Phase 5:** Invitee Selector - Search, bulk selection, granular control (future)

Each phase builds on the previous and can be tested independently.
