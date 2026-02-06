import { Input } from "@/components/ui";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TimeOffsetUnit, TimeOffsetUnitOptions } from "@/lib/models/Event";
import { Calendar, Clock } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEventFormContext } from "../../context/EventFormContext";

export function RegistrationTimingFields() {
	const { form } = useEventFormContext();
	const {
		control,
		watch,
		formState: { errors },
	} = form;

	const isRecurring = watch("isRecurring");
	const startTime = watch("startTime");

	// Format date for datetime-local input
	const formatDateTimeLocal = (date: Date | null | undefined): string => {
		if (!date) return "";
		const d = new Date(date);
		const offset = d.getTimezoneOffset();
		const adjusted = new Date(d.getTime() - offset * 60 * 1000);
		return adjusted.toISOString().slice(0, 16);
	};

	// For recurring events, show relative offset inputs
	if (isRecurring) {
		return <RelativeRegistrationTiming />;
	}

	// For single events, show absolute datetime inputs
	return (
		<div className="space-y-4">
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

// Relative timing component for recurring events
function RelativeRegistrationTiming() {
	const { form } = useEventFormContext();
	const {
		control,
		formState: { errors },
	} = form;

	return (
		<div className="space-y-6">
			{/* Info banner */}
			<div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
				<p className="text-sm text-accent">
					For recurring events, registration timing is relative to each event&apos;s start time.
				</p>
			</div>

			{/* Registration Opens */}
			<div>
				<label className="text-sm font-medium text-foreground mb-2 block">
					Registration Opens
				</label>
				<div className="flex items-center gap-3">
					<Controller
						name="registrationOpenOffset.value"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								type="number"
								min={0}
								placeholder="7"
								className="w-24 bg-surface-elevated"
								onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
							/>
						)}
					/>
					<Controller
						name="registrationOpenOffset.unit"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className="w-32 bg-surface-elevated">
									<SelectValue placeholder="days" />
								</SelectTrigger>
								<SelectContent>
									{TimeOffsetUnitOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					<span className="text-muted text-sm">before event</span>
				</div>
				{errors.registrationOpenOffset?.value?.message && (
					<p className="text-destructive text-xs mt-1">
						{errors.registrationOpenOffset.value.message}
					</p>
				)}
				<p className="text-muted text-xs mt-1">
					Leave at 0 to open registration immediately when series is created
				</p>
			</div>

			{/* Registration Deadline */}
			<div>
				<label className="text-sm font-medium text-foreground mb-2 block">
					Registration Deadline
				</label>
				<div className="flex items-center gap-3">
					<Controller
						name="registrationDeadlineOffset.value"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								type="number"
								min={0}
								placeholder="1"
								className="w-24 bg-surface-elevated"
								onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
							/>
						)}
					/>
					<Controller
						name="registrationDeadlineOffset.unit"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className="w-32 bg-surface-elevated">
									<SelectValue placeholder="hours" />
								</SelectTrigger>
								<SelectContent>
									{TimeOffsetUnitOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					<span className="text-muted text-sm">before event</span>
				</div>
				{errors.registrationDeadlineOffset?.value?.message && (
					<p className="text-destructive text-xs mt-1">
						{errors.registrationDeadlineOffset.value.message}
					</p>
				)}
				<p className="text-muted text-xs mt-1">
					Leave at 0 to close registration at event start time
				</p>
			</div>

			{/* Preview example */}
			<OffsetPreviewExample />
		</div>
	);
}

// Preview showing example of how offsets work
function OffsetPreviewExample() {
	const { form } = useEventFormContext();
	const openOffset = form.watch("registrationOpenOffset");
	const deadlineOffset = form.watch("registrationDeadlineOffset");

	// Example event date for preview
	const exampleEventDate = new Date();
	exampleEventDate.setDate(exampleEventDate.getDate() + 7); // Next week
	exampleEventDate.setHours(18, 0, 0, 0); // 6 PM

	const calculateOffsetDate = (
		eventDate: Date,
		offset: { value: number; unit: TimeOffsetUnit } | undefined,
		before: boolean
	): Date => {
		if (!offset || offset.value === 0) return new Date(eventDate);

		const result = new Date(eventDate);
		const multiplier = before ? -1 : 1;

		switch (offset.unit) {
			case TimeOffsetUnit.Minutes:
				result.setMinutes(result.getMinutes() + offset.value * multiplier);
				break;
			case TimeOffsetUnit.Hours:
				result.setHours(result.getHours() + offset.value * multiplier);
				break;
			case TimeOffsetUnit.Days:
				result.setDate(result.getDate() + offset.value * multiplier);
				break;
		}

		return result;
	};

	const registrationOpens = calculateOffsetDate(exampleEventDate, openOffset, true);
	const registrationCloses = calculateOffsetDate(exampleEventDate, deadlineOffset, true);

	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	return (
		<div className="p-4 rounded-xl bg-surface border border-border">
			<p className="text-xs text-muted uppercase tracking-wider mb-3">Example Preview</p>
			<div className="space-y-2 text-sm">
				<div className="flex justify-between">
					<span className="text-muted">Event starts:</span>
					<span className="text-foreground">{formatDate(exampleEventDate)}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted">Registration opens:</span>
					<span className="text-accent">{formatDate(registrationOpens)}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted">Registration closes:</span>
					<span className="text-yellow-400">{formatDate(registrationCloses)}</span>
				</div>
			</div>
		</div>
	);
}
