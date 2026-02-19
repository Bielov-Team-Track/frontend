"use client";

import { Checkbox, CollapsibleSection, Input, RadioCards, TextArea } from "@/components";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EventFormat, EventType, PlayingSurface, RecurrencePattern, RecurrencePatternOptions } from "@/lib/models/Event";
import { cn } from "@/lib/utils";
import { Calendar, CalendarRange, Clock, Dumbbell, Gamepad2, PartyPopper, Repeat, Trees, Trophy, Warehouse, Waves } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../context/EventFormContext";
import { calculateSeriesOccurrences } from "../utils/eventFormUtils";

const eventTypeCards = [
	{
		value: EventType.CasualPlay,
		label: "Casual",
		description: "Relaxed games for fun",
		icon: Gamepad2,
	},
	{
		value: EventType.Match,
		label: "Match",
		description: "Competitive game",
		icon: Trophy,
	},
	{
		value: EventType.Social,
		label: "Social",
		description: "Hangout, meetup, or celebration",
		icon: PartyPopper,
	},
	{
		value: EventType.TrainingSession,
		label: "Training",
		description: "Practice drills and skill work",
		icon: Dumbbell,
	},
];

const surfaceCards = [
	{
		value: PlayingSurface.Indoor,
		label: "Indoor",
		description: "Gymnasium or sports hall",
		icon: Warehouse,
	},
	{
		value: PlayingSurface.Grass,
		label: "Grass",
		description: "Outdoor grass court",
		icon: Trees,
	},
	{
		value: PlayingSurface.Beach,
		label: "Beach",
		description: "Sand volleyball",
		icon: Waves,
	},
];

// Calculate duration from time strings (HH:mm format)
function getDurationFromTimes(start: string, end: string): string | null {
	if (!start || !end) return null;
	const [startHour, startMin] = start.split(":").map(Number);
	const [endHour, endMin] = end.split(":").map(Number);
	const diffMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
	if (diffMinutes <= 0) return null;
	const hours = Math.floor(diffMinutes / 60);
	const mins = diffMinutes % 60;
	if (hours === 0) return `${mins}m`;
	if (mins === 0) return `${hours}h`;
	return `${hours}h ${mins}m`;
}

export default function BasicsStep() {
	const { form } = useEventFormContext();
	const {
		control,
		formState: { errors },
		watch,
		setValue,
	} = form;

	const values = watch();
	const isRecurring = watch("isRecurring");

	// Calculate series occurrences for preview
	const seriesOccurrences =
		isRecurring && values.firstOccurrenceDate && values.seriesEndDate && values.recurrencePattern
			? calculateSeriesOccurrences(
					new Date(values.firstOccurrenceDate),
					new Date(values.seriesEndDate),
					values.recurrencePattern
				)
			: [];

	return (
		<div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="basics-step">
			<div className="border-b-2 pb-3 sm:pb-4">
				<h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Event Basics</h2>
				<p className="text-muted-foreground text-xs sm:text-sm">Let&apos;s start with the essential information about your event.</p>
			</div>

			<div className="space-y-4 sm:space-y-6">
				{/* Event Name */}
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<Input {...field} label="Event Name" placeholder="e.g., Sunday Beach Volleyball Tournament" error={errors.name?.message as string | undefined} required data-testid="event-name-input" />
					)}
				/>

				{/* Description */}
				<Controller
					name="description"
					control={control}
					render={({ field }) => (
						<TextArea
							{...field}
							label="Description"
							placeholder="Describe your event, rules, what to bring, etc..."
							maxLength={500}
							showCharCount
							minRows={3}
							optional
							data-testid="event-description-input"
						/>
					)}
				/>

				{/* Event Type */}
				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<RadioCards
							label="Event Type"
							options={eventTypeCards}
							value={field.value}
							onChange={(value: string) => {
								field.onChange(value);
								// Sync eventFormat: Social/Training always use List
								if (value === EventType.Social || value === EventType.TrainingSession) {
									setValue("eventFormat", EventFormat.List);
								} else if (value === EventType.Match) {
									setValue("eventFormat", EventFormat.TeamsWithPositions);
								}
							}}
							error={errors.type?.message as string | undefined}
							columns={2}
							data-testid="event-type-selector"
						/>
					)}
				/>

				{/* Playing Surface */}
				<Controller
					name="surface"
					control={control}
					render={({ field }) => (
						<RadioCards
							label="Playing Surface"
							options={surfaceCards}
							value={field.value}
							onChange={field.onChange}
							error={errors.surface?.message as string | undefined}
							columns={3}
							data-testid="event-surface-selector"
						/>
					)}
				/>

				{/* Single/Recurring Toggle - Visual Switch */}
				<div className="space-y-3">
					<label className="text-sm font-medium text-foreground block">Event Schedule</label>
					<Controller
						name="isRecurring"
						control={control}
						render={({ field: { value, onChange } }) => (
							<div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface border border-border">
								<button
									type="button"
									onClick={() => onChange(false)}
									className={cn(
										"flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all",
										!value
											? "bg-accent text-accent-foreground shadow-sm"
											: "text-muted-foreground hover:text-foreground hover:bg-hover"
									)}
									data-testid="single-event-toggle"
								>
									<Calendar size={16} />
									<span>Single Event</span>
								</button>
								<button
									type="button"
									onClick={() => onChange(true)}
									className={cn(
										"flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all",
										value
											? "bg-accent text-accent-foreground shadow-sm"
											: "text-muted-foreground hover:text-foreground hover:bg-hover"
									)}
									data-testid="recurring-event-toggle"
								>
									<CalendarRange size={16} />
									<span>Recurring</span>
								</button>
							</div>
						)}
					/>
					<p className="text-[10px] sm:text-xs text-muted-foreground">
						{isRecurring
							? "Create a series of events that repeat on a schedule"
							: "A one-time event on a specific date"}
					</p>
				</div>

				{/* Single Event Fields */}
				{!isRecurring && (
					<div className="space-y-4 sm:space-y-6 p-3 sm:p-4 rounded-xl bg-surface border border-border">
						<Controller
							name="eventDate"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type="date"
									label="Event Date"
									leftIcon={<Calendar size={16} />}
									error={errors.eventDate?.message as string | undefined}
									helperText="When will this event take place?"
									value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
									onChange={(e) => field.onChange(new Date(e.target.value))}
									required
									className="bg-surface-elevated"
									data-testid="event-date-input"
								/>
							)}
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Controller
								name="eventStartTime"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="time"
										label="Start Time"
										leftIcon={<Clock size={16} />}
										error={errors.eventStartTime?.message as string | undefined}
										value={field.value || ""}
										onChange={(e) => {
											field.onChange(e.target.value);
											if (values.eventEndTime) {
												setTimeout(() => form.trigger("eventEndTime"), 0);
											}
										}}
										required
										className="bg-surface-elevated"
										data-testid="start-time-input"
									/>
								)}
							/>

							<Controller
								name="eventEndTime"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="time"
										label="End Time"
										leftIcon={<Clock size={16} />}
										error={errors.eventEndTime?.message as string | undefined}
										value={field.value || ""}
										onChange={(e) => {
											field.onChange(e.target.value);
											if (values.eventStartTime) {
												setTimeout(() => form.trigger("eventEndTime"), 0);
											}
										}}
										required
										className="bg-surface-elevated"
										data-testid="end-time-input"
									/>
								)}
							/>
						</div>

						{/* Duration Badge */}
						{values.eventStartTime && values.eventEndTime && getDurationFromTimes(values.eventStartTime, values.eventEndTime) && (
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 w-fit">
								<Clock size={14} className="text-accent" />
								<span className="text-xs sm:text-sm font-medium text-accent">
									{getDurationFromTimes(values.eventStartTime, values.eventEndTime)}
								</span>
							</div>
						)}
					</div>
				)}

				{/* Recurring Event Fields */}
				{isRecurring && (
					<div className="space-y-4 sm:space-y-6 p-3 sm:p-4 rounded-xl bg-surface border border-border">
						{/* Recurrence Pattern */}
						<div>
							<label className="text-sm font-medium text-foreground mb-2 block">
								Recurrence Pattern
								<span className="text-destructive ml-1">*</span>
							</label>
							<Controller
								name="recurrencePattern"
								control={control}
								render={({ field }) => (
									<Select
										value={field.value ?? ""}
										onValueChange={field.onChange}
									>
										<SelectTrigger className="w-full bg-surface-elevated" data-testid="recurrence-pattern-select">
											<SelectValue placeholder="Select frequency" />
										</SelectTrigger>
										<SelectContent>
											{RecurrencePatternOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.recurrencePattern?.message && (
								<p className="text-destructive text-xs mt-1">{errors.recurrencePattern.message as string}</p>
							)}
						</div>

						{/* Date Range */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Controller
								name="firstOccurrenceDate"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="date"
										label="First Occurrence"
										leftIcon={<Calendar size={16} />}
										error={errors.firstOccurrenceDate?.message as string | undefined}
										helperText="When the first event occurs"
										value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
										onChange={(e) => {
											field.onChange(new Date(e.target.value));
											if (values.seriesEndDate) {
												setTimeout(() => form.trigger("seriesEndDate"), 0);
											}
										}}
										required
										className="bg-surface-elevated"
										data-testid="first-occurrence-input"
									/>
								)}
							/>

							<Controller
								name="seriesEndDate"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="date"
										label="Series End Date"
										leftIcon={<Calendar size={16} />}
										error={errors.seriesEndDate?.message as string | undefined}
										helperText="When to stop creating events"
										value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
										onChange={(e) => {
											field.onChange(new Date(e.target.value));
											if (values.firstOccurrenceDate) {
												setTimeout(() => form.trigger("seriesEndDate"), 0);
											}
										}}
										required
										className="bg-surface-elevated"
										data-testid="series-end-date-input"
									/>
								)}
							/>
						</div>

						{/* Event Time (for recurring) */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Controller
								name="eventStartTime"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="time"
										label="Start Time"
										leftIcon={<Clock size={16} />}
										error={errors.eventStartTime?.message as string | undefined}
										helperText="When each event starts"
										value={field.value || ""}
										onChange={(e) => {
											field.onChange(e.target.value);
											if (values.eventEndTime) {
												setTimeout(() => form.trigger("eventEndTime"), 0);
											}
										}}
										required
										className="bg-surface-elevated"
									/>
								)}
							/>

							<Controller
								name="eventEndTime"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="time"
										label="End Time"
										leftIcon={<Clock size={16} />}
										error={errors.eventEndTime?.message as string | undefined}
										helperText="When each event ends"
										value={field.value || ""}
										onChange={(e) => {
											field.onChange(e.target.value);
											if (values.eventStartTime) {
												setTimeout(() => form.trigger("eventEndTime"), 0);
											}
										}}
										required
										className="bg-surface-elevated"
									/>
								)}
							/>
						</div>

						{/* Duration Badge */}
						{values.eventStartTime && values.eventEndTime && getDurationFromTimes(values.eventStartTime, values.eventEndTime) && (
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 w-fit">
								<Clock size={14} className="text-accent" />
								<span className="text-xs sm:text-sm font-medium text-accent">
									{getDurationFromTimes(values.eventStartTime, values.eventEndTime)}
								</span>
							</div>
						)}

						{/* Series Preview */}
						{seriesOccurrences.length > 0 && values.eventStartTime && values.eventEndTime && (
							<SeriesPreview
								occurrences={seriesOccurrences}
								startTime={values.eventStartTime}
								endTime={values.eventEndTime}
								pattern={values.recurrencePattern!}
							/>
						)}
					</div>
				)}

				{/* Collapsible Advanced Settings */}
				<CollapsibleSection label="Advanced Settings" defaultOpen={false} data-testid="advanced-settings-section">
					{/* Private Event toggle */}
					<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border">
						<Controller
							name="isPublic"
							control={control}
							render={({ field: { value, onChange, ...field } }) => (
								<Checkbox
									{...field}
									checked={!value} // Inverted: switch ON = private (isPublic=false)
									onChange={(checked) => onChange(!checked)} // Invert the value
									label="Private Event"
									helperText="Private events are only visible to members and invited guests."
									data-testid="event-private-checkbox"
								/>
							)}
						/>
					</div>
				</CollapsibleSection>
			</div>
		</div>
	);
}

// Series Preview Component
function SeriesPreview({
	occurrences,
	startTime,
	endTime,
	pattern,
}: {
	occurrences: Date[];
	startTime: string;
	endTime: string;
	pattern: RecurrencePattern;
}) {
	const MAX_PREVIEW = 5;
	const displayOccurrences = occurrences.slice(0, MAX_PREVIEW);
	const remainingCount = occurrences.length - MAX_PREVIEW;

	const patternLabel = RecurrencePatternOptions.find((o) => o.value === pattern)?.label || pattern;
	const duration = getDurationFromTimes(startTime, endTime);

	return (
		<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border">
			<div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
				<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
					<Repeat size={14} className="text-accent sm:hidden" />
					<Repeat size={16} className="text-accent hidden sm:block" />
				</div>
				<div className="min-w-0">
					<span className="text-xs sm:text-sm font-semibold text-foreground block">Series Preview</span>
					<span className="text-[10px] sm:text-xs text-muted-foreground">
						{occurrences.length} events · {patternLabel} · {duration} each
					</span>
				</div>
			</div>

			{/* Warning if too many events */}
			{occurrences.length > 52 && (
				<div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
					<p className="text-xs sm:text-sm text-yellow-400">
						This series will create {occurrences.length} events. Consider a shorter date range.
					</p>
				</div>
			)}

			{/* Occurrence list */}
			<div className="space-y-1.5 sm:space-y-2">
				{displayOccurrences.map((date, index) => (
					<div
						key={index}
						className="flex items-center justify-between text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-surface"
					>
						<div className="flex items-center gap-2 sm:gap-3">
							<span className="text-muted-foreground w-5 sm:w-6">#{index + 1}</span>
							<span className="text-foreground">
								{date.toLocaleDateString("en-US", {
									weekday: "short",
									month: "short",
									day: "numeric",
								})}
							</span>
						</div>
						<span className="text-muted-foreground text-[10px] sm:text-sm">
							{startTime} - {endTime}
						</span>
					</div>
				))}

				{remainingCount > 0 && (
					<div className="text-center py-2 text-xs sm:text-sm text-muted-foreground">
						...and {remainingCount} more event{remainingCount > 1 ? "s" : ""}
					</div>
				)}
			</div>
		</div>
	);
}
