"use client";

import { Checkbox, CollapsibleSection, Input, RadioCards, TextArea } from "@/components";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EventType, PlayingSurface, RecurrencePattern, RecurrencePatternOptions } from "@/lib/models/Event";
import { getDuration } from "@/lib/utils/date";
import { Calendar, Clock, Dumbbell, Gamepad2, PartyPopper, Repeat, Trees, Trophy, Warehouse, Waves } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
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

export default function BasicsStep() {
	const {
		control,
		formState: { errors },
		watch,
		setValue,
	} = useFormContext();

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
				<h2 className="text-lg sm:text-xl font-bold text-white mb-1">Event Basics</h2>
				<p className="text-muted text-xs sm:text-sm">Let&apos;s start with the essential information about your event.</p>
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

				{/* Event Type */}
				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<RadioCards
							label="Event Type"
							options={eventTypeCards}
							value={field.value}
							onChange={field.onChange}
							error={errors.type?.message as string | undefined}
							columns={2}
							data-testid="event-type-selector"
						/>
					)}
				/>

				{/* Date - only shown when NOT recurring */}
				{!isRecurring && (
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
				)}

				{/* Start Time / End Time (side by side) */}
				<div>
					<label className="text-sm font-medium text-white mb-2 block">
						Event Time
						<span className="text-destructive ml-1">*</span>
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Controller
							name={isRecurring ? "eventStartTime" : "startTime"}
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type={isRecurring ? "time" : "datetime-local"}
									label="Start Time"
									leftIcon={<Clock size={16} />}
									error={(isRecurring ? errors.eventStartTime?.message : errors.startTime?.message) as string | undefined}
									helperText={isRecurring ? "When each event starts" : "When the event starts"}
									value={
										field.value
											? isRecurring
												? field.value
												: new Date(field.value).toISOString().slice(0, 16)
											: ""
									}
									onChange={(e) =>
										isRecurring ? field.onChange(e.target.value) : field.onChange(new Date(e.target.value))
									}
									required
									className="bg-surface-elevated"
									data-testid="start-time-input"
								/>
							)}
						/>

						<Controller
							name={isRecurring ? "eventEndTime" : "endTime"}
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type={isRecurring ? "time" : "datetime-local"}
									label="End Time"
									leftIcon={<Clock size={16} />}
									error={(isRecurring ? errors.eventEndTime?.message : errors.endTime?.message) as string | undefined}
									helperText={isRecurring ? "When each event ends" : "When the event ends"}
									value={
										field.value
											? isRecurring
												? field.value
												: new Date(field.value).toISOString().slice(0, 16)
											: ""
									}
									onChange={(e) =>
										isRecurring ? field.onChange(e.target.value) : field.onChange(new Date(e.target.value))
									}
									required
									className="bg-surface-elevated"
									data-testid="end-time-input"
								/>
							)}
						/>
					</div>
				</div>

				{/* Private Event toggle */}
				<div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
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

				{/* Recurring Event toggle */}
				<div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
					<Controller
						name="isRecurring"
						control={control}
						render={({ field: { value, onChange, ...field } }) => (
							<Checkbox
								{...field}
								checked={value}
								onChange={onChange}
								label="Recurring Event"
								helperText="Create a series of events that repeat on a schedule."
								data-testid="event-recurring-checkbox"
							/>
						)}
					/>
				</div>

				{/* Recurring fields when toggled */}
				{isRecurring && (
					<div className="space-y-4 sm:space-y-6 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
						{/* Recurrence Pattern */}
						<div>
							<label className="text-sm font-medium text-white mb-2 block">
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
										onChange={(e) => field.onChange(new Date(e.target.value))}
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
										onChange={(e) => field.onChange(new Date(e.target.value))}
										required
										className="bg-surface-elevated"
										data-testid="series-end-date-input"
									/>
								)}
							/>
						</div>

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

				{/* Single Event Summary */}
				{!isRecurring && values.startTime && values.endTime && (
					<SingleEventSummary startTime={values.startTime} endTime={values.endTime} />
				)}

				{/* Collapsible Description & Playing Surface */}
				<CollapsibleSection label="Description & Playing Surface" defaultOpen={false} data-testid="description-surface-section">
					<div className="space-y-4">
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
									minRows={4}
									optional
									data-testid="event-description-input"
								/>
							)}
						/>

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
					</div>
				</CollapsibleSection>
			</div>
		</div>
	);
}

// Single Event Summary Component
function SingleEventSummary({ startTime, endTime }: { startTime: Date; endTime: Date }) {
	return (
		<div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
			<div className="flex items-center gap-2 sm:gap-3 mb-3">
				<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent/10 flex items-center justify-center">
					<Clock size={14} className="text-accent sm:hidden" />
					<Clock size={16} className="text-accent hidden sm:block" />
				</div>
				<span className="text-xs sm:text-sm font-semibold text-white">Event Summary</span>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
				<div>
					<span className="text-muted text-xs uppercase tracking-wider block mb-1">Start</span>
					<span className="text-white font-medium">
						{new Date(startTime).toLocaleDateString("en-US", {
							weekday: "short",
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>
				<div>
					<span className="text-muted text-xs uppercase tracking-wider block mb-1">End</span>
					<span className="text-white font-medium">
						{new Date(endTime).toLocaleDateString("en-US", {
							weekday: "short",
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>
				<div>
					<span className="text-muted text-xs uppercase tracking-wider block mb-1">Duration</span>
					<span className="text-accent font-medium">
						{getDuration(new Date(startTime), new Date(endTime))}
					</span>
				</div>
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

	// Calculate duration from time strings
	const getDurationFromTimes = (start: string, end: string) => {
		const [startHour, startMin] = start.split(":").map(Number);
		const [endHour, endMin] = end.split(":").map(Number);
		const startMinutes = startHour * 60 + startMin;
		const endMinutes = endHour * 60 + endMin;
		const diffMinutes = endMinutes - startMinutes;

		if (diffMinutes <= 0) return "Invalid duration";

		const hours = Math.floor(diffMinutes / 60);
		const mins = diffMinutes % 60;

		if (hours === 0) return `${mins}m`;
		if (mins === 0) return `${hours}h`;
		return `${hours}h ${mins}m`;
	};

	const patternLabel = RecurrencePatternOptions.find((o) => o.value === pattern)?.label || pattern;

	return (
		<div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
			<div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
				<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
					<Repeat size={14} className="text-accent sm:hidden" />
					<Repeat size={16} className="text-accent hidden sm:block" />
				</div>
				<div className="min-w-0">
					<span className="text-xs sm:text-sm font-semibold text-white block">Series Preview</span>
					<span className="text-[10px] sm:text-xs text-muted">
						{occurrences.length} events · {patternLabel} · {getDurationFromTimes(startTime, endTime)} each
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
						className="flex items-center justify-between text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-white/5"
					>
						<div className="flex items-center gap-2 sm:gap-3">
							<span className="text-muted w-5 sm:w-6">#{index + 1}</span>
							<span className="text-white">
								{date.toLocaleDateString("en-US", {
									weekday: "short",
									month: "short",
									day: "numeric",
								})}
							</span>
						</div>
						<span className="text-muted text-[10px] sm:text-sm">
							{startTime} - {endTime}
						</span>
					</div>
				))}

				{remainingCount > 0 && (
					<div className="text-center py-2 text-xs sm:text-sm text-muted">
						...and {remainingCount} more event{remainingCount > 1 ? "s" : ""}
					</div>
				)}
			</div>
		</div>
	);
}
