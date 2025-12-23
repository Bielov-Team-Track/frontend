import { Controller } from "react-hook-form";
import { Input } from "@/components/ui";
import { Calendar, Clock } from "lucide-react";
import { getDuration } from "@/lib/utils/date";
import { useEventFormContext } from "../context/EventFormContext";

export function TimeAndDateStep() {
	const { form } = useEventFormContext();
	const {
		control,
		formState: { errors },
		watch,
	} = form;
	const values = watch();

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-white mb-1">Time & Date</h2>
				<p className="text-muted text-sm">When will your event take place?</p>
			</div>

			<div className="space-y-4">
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
								value={
									field.value
										? new Date(field.value).toISOString().slice(0, 16)
										: ""
								}
								onChange={(e) => field.onChange(new Date(e.target.value))}
								required
								variant="bordered"
								className="bg-background-light"
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
								leftIcon={<Clock size={16} />}
								error={errors.endTime?.message}
								helperText="Choose when your event ends"
								value={
									field.value
										? new Date(field.value).toISOString().slice(0, 16)
										: ""
								}
								onChange={(e) => field.onChange(new Date(e.target.value))}
								required
								variant="bordered"
								className="bg-background-light"
							/>
						)}
					/>
				</div>

				{values.startTime && values.endTime && (
					<div className="p-4 rounded-xl bg-white/5 border border-white/10">
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
									{new Date(values.startTime).toLocaleDateString("en-US", {
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
									{new Date(values.endTime).toLocaleDateString("en-US", {
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
									{getDuration(new Date(values.startTime), new Date(values.endTime))}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
