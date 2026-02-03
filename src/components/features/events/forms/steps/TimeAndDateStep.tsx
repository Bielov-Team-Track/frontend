import { Input } from "@/components/ui";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecurrencePattern, RecurrencePatternOptions } from "@/lib/models/Event";
import { getDuration } from "@/lib/utils/date";
import { Calendar, Clock, Repeat } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../context/EventFormContext";
import { calculateSeriesOccurrences } from "../utils/eventFormUtils";

export function TimeAndDateStep() {
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

	const handleModeChange = (mode: string) => {
		const newIsRecurring = mode === "recurring";
		setValue("isRecurring", newIsRecurring);

		// Reset the other mode's fields when switching
		if (newIsRecurring) {
			// Clear single event fields
			setValue("startTime", undefined);
			setValue("endTime", undefined);
			// Set default recurring values if not set
			if (!values.recurrencePattern) {
				setValue("recurrencePattern", "weekly");
			}
			if (!values.firstOccurrenceDate) {
				setValue("firstOccurrenceDate", new Date(Date.now() + 24 * 60 * 60 * 1000));
			}
			if (!values.seriesEndDate) {
				const threeMonthsLater = new Date();
				threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
				setValue("seriesEndDate", threeMonthsLater);
			}
		} else {
			// Clear recurring fields
			setValue("recurrencePattern", undefined);
			setValue("firstOccurrenceDate", undefined);
			setValue("seriesEndDate", undefined);
			// Set default single event values
			const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
			const tomorrowPlus2Hours = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000);
			setValue("startTime", tomorrow);
			setValue("endTime", tomorrowPlus2Hours);
		}
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="time-date-step">
			<div className="border-b-2 pb-4">
				<h2 className="text-xl font-bold text-white mb-1">Time & Date</h2>
				<p className="text-muted text-sm">When will your event take place?</p>
			</div>

			<div className="space-y-6">
				{/* Event Mode Tabs */}
				<Tabs
					value={isRecurring ? "recurring" : "single"}
					onValueChange={handleModeChange}
				>
					<TabsList className="w-full">
						<TabsTrigger value="single" className="flex-1 gap-2" data-testid="single-event-tab">
							<Calendar size={16} />
							Single Event
						</TabsTrigger>
						<TabsTrigger value="recurring" className="flex-1 gap-2" data-testid="recurring-event-tab">
							<Repeat size={16} />
							Recurring Event
						</TabsTrigger>
					</TabsList>

					{/* Single Event Mode */}
					<TabsContent value="single" className="mt-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Controller
								name="startTime"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="datetime-local"
										label="Start Date & Time"
										leftIcon={<Calendar size={16} />}
										error={errors.startTime?.message}
										helperText="Choose when your event begins"
										value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
										onChange={(e) => field.onChange(new Date(e.target.value))}
										required
										className="bg-background-light"
										data-testid="start-datetime-input"
									/>
								)}
							/>

							<Controller
								name="endTime"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="datetime-local"
										label="End Date & Time"
										leftIcon={<Calendar size={16} />}
										error={errors.endTime?.message}
										helperText="Choose when your event ends"
										value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
										onChange={(e) => field.onChange(new Date(e.target.value))}
										required
										className="bg-background-light"
										data-testid="end-datetime-input"
									/>
								)}
							/>
						</div>

						{/* Single Event Summary */}
						{!isRecurring && values.startTime && values.endTime && (
							<SingleEventSummary startTime={values.startTime} endTime={values.endTime} />
						)}
					</TabsContent>

					{/* Recurring Event Mode */}
					<TabsContent value="recurring" className="mt-6 space-y-6">
						{/* Recurrence Pattern */}
						<div>
							<label className="text-sm font-medium text-white mb-2 block">
								Recurrence Pattern
							</label>
							<Controller
								name="recurrencePattern"
								control={control}
								render={({ field }) => (
									<Select
										value={field.value ?? ""}
										onValueChange={field.onChange}
									>
										<SelectTrigger className="w-full bg-background-light">
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
								<p className="text-destructive text-xs mt-1">{errors.recurrencePattern.message}</p>
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
										error={errors.firstOccurrenceDate?.message}
										helperText="When the first event occurs"
										value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
										onChange={(e) => field.onChange(new Date(e.target.value))}
										required
										className="bg-background-light"
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
										error={errors.seriesEndDate?.message}
										helperText="When to stop creating events"
										value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
										onChange={(e) => field.onChange(new Date(e.target.value))}
										required
										className="bg-background-light"
									/>
								)}
							/>
						</div>

						{/* Time Range (for each occurrence) */}
						<div>
							<label className="text-sm font-medium text-white mb-2 block">
								Event Time (each occurrence)
							</label>
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
											error={errors.eventStartTime?.message}
											helperText="When each event starts"
											required
											className="bg-background-light"
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
											error={errors.eventEndTime?.message}
											helperText="When each event ends"
											required
											className="bg-background-light"
										/>
									)}
								/>
							</div>
						</div>

						{/* Series Preview */}
						{seriesOccurrences.length > 0 && (
							<SeriesPreview
								occurrences={seriesOccurrences}
								startTime={values.eventStartTime}
								endTime={values.eventEndTime}
								pattern={values.recurrencePattern!}
							/>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

// Single Event Summary Component
function SingleEventSummary({ startTime, endTime }: { startTime: Date; endTime: Date }) {
	return (
		<div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-4">
			<div className="flex items-center gap-3 mb-3">
				<div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
					<Clock size={16} className="text-accent" />
				</div>
				<span className="text-sm font-semibold text-white">Event Summary</span>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
		<div className="p-4 rounded-xl bg-white/5 border border-white/10">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
					<Repeat size={16} className="text-accent" />
				</div>
				<div>
					<span className="text-sm font-semibold text-white block">Series Preview</span>
					<span className="text-xs text-muted">
						{occurrences.length} events · {patternLabel} · {getDurationFromTimes(startTime, endTime)} each
					</span>
				</div>
			</div>

			{/* Warning if too many events */}
			{occurrences.length > 52 && (
				<div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
					<p className="text-sm text-yellow-400">
						This series will create {occurrences.length} events. Consider a shorter date range.
					</p>
				</div>
			)}

			{/* Occurrence list */}
			<div className="space-y-2">
				{displayOccurrences.map((date, index) => (
					<div
						key={index}
						className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-white/5"
					>
						<div className="flex items-center gap-3">
							<span className="text-muted w-6">#{index + 1}</span>
							<span className="text-white">
								{date.toLocaleDateString("en-US", {
									weekday: "short",
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</span>
						</div>
						<span className="text-muted">
							{startTime} - {endTime}
						</span>
					</div>
				))}

				{remainingCount > 0 && (
					<div className="text-center py-2 text-sm text-muted">
						...and {remainingCount} more event{remainingCount > 1 ? "s" : ""}
					</div>
				)}
			</div>
		</div>
	);
}
