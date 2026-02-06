import { PricingModel } from "@/lib/models/EventPaymentConfig";
import { getDuration, getFormattedDate, getFormattedDateWithDay, getFormattedTime } from "@/lib/utils/date";
import { Calendar, CheckCircle2, Clock, Coins, Eye, EyeOff, MapPin, Pencil } from "lucide-react";
import { ReactNode } from "react";
import { useEventFormContext } from "../context/EventFormContext";

interface ReviewSectionProps {
	title: string;
	icon: any;
	onEdit: () => void;
	children: ReactNode;
}

const ReviewSection = ({ title, icon: Icon, onEdit, children }: ReviewSectionProps) => (
	<div className="p-3 sm:p-4 rounded-xl bg-surface border border-border relative group transition-all hover:bg-hover">
		<div className="flex items-center justify-between mb-1.5 sm:mb-2">
			<div className="flex items-center gap-1.5 sm:gap-2">
				<Icon size={12} className="text-accent sm:hidden" />
				<Icon size={14} className="text-accent hidden sm:block" />
				<span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{title}</span>
			</div>
			<button
				onClick={onEdit}
				className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-1.5 rounded-md hover:bg-hover sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
				title="Edit"
				type="button">
				<Pencil size={12} />
			</button>
		</div>
		{children}
	</div>
);

export default function ReviewStep() {
	const { form, wizard } = useEventFormContext();
	const { goToStep } = wizard;
	const values = form.watch();

	const getPaymentConfigSummary = () => {
		if (values.paymentConfig.pricingModel === PricingModel.Individual) {
			return `${values.paymentConfig.cost} per person`;
		} else if (values.paymentConfig.pricingModel === PricingModel.Team) {
			return `${values.paymentConfig.cost} per team`;
		} else if (values.paymentConfig.pricingModel === PricingModel.Event) {
			return `${values.paymentConfig.cost} split between all`;
		}
		return "Self-managed";
	};

	const getDateDisplay = () => {
		if (values.isRecurring) {
			if (!values.firstOccurrenceDate || !values.seriesEndDate) return "No dates set";
			const first = getFormattedDateWithDay(new Date(values.firstOccurrenceDate));
			const last = getFormattedDateWithDay(new Date(values.seriesEndDate));
			return `${first} - ${last} (recurring)`;
		}
		if (!values.startTime || !values.endTime) return "No dates set";
		if (getFormattedDate(values.startTime) === getFormattedDate(values.endTime)) {
			return getFormattedDateWithDay(new Date(values.startTime));
		}
		return `${getFormattedDateWithDay(new Date(values.startTime))} - ${getFormattedDateWithDay(new Date(values.endTime))}`;
	};

	return (
		<div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="review-step">
			<div className="border-b-2 pb-3 sm:pb-4">
				<h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Review & Create</h2>
				<p className="text-muted-foreground text-xs sm:text-sm">Double check everything before creating your event.</p>
			</div>

			{/* Event Preview Card */}
			<div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-surface-elevated border border-border shadow-xl">
				{/* Header Banner */}
				<div className="h-16 sm:h-24 w-full bg-linear-to-br from-accent/30 via-accent/10 to-transparent relative">
					<div className="absolute inset-0 bg-linear-to-t from-surface-elevated via-transparent to-transparent" />
					<button
						onClick={() => goToStep(1)}
						className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-lg text-foreground/80 hover:text-foreground transition-all"
						title="Edit Event Details">
						<Pencil size={12} className="sm:hidden" />
						<Pencil size={14} className="hidden sm:block" />
					</button>
				</div>

				<div className="px-3 sm:px-6 pb-4 sm:pb-6 relative -mt-6 sm:-mt-8">
					{/* Event Title */}
					<div className="mb-4 sm:mb-6">
						<h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{values.name || "Untitled Event"}</h3>
						<p className="text-xs sm:text-sm text-muted-foreground">
							{values.type} • {values.surface} • {values.eventFormat}
						</p>
					</div>

					{/* Details Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
						{/* Date & Time */}
						<ReviewSection title="Date" icon={Calendar} onEdit={() => goToStep(1)}>
							<p className="text-xs sm:text-sm text-foreground font-medium">{getDateDisplay()}</p>
						</ReviewSection>

						<ReviewSection title="Time" icon={Clock} onEdit={() => goToStep(1)}>
							<p className="text-xs sm:text-sm text-foreground font-medium">
								{values.isRecurring
									? `${values.eventStartTime} - ${values.eventEndTime}`
									: values.startTime && values.endTime
										? `${getFormattedTime(new Date(values.startTime))} - ${getFormattedTime(new Date(values.endTime))}`
										: "No times set"}
							</p>
							<p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
								{values.isRecurring && values.eventStartTime && values.eventEndTime
									? getDuration(
											new Date(`2000-01-01T${values.eventStartTime}`),
											new Date(`2000-01-01T${values.eventEndTime}`),
										)
									: values.startTime && values.endTime
										? getDuration(values.startTime, values.endTime)
										: ""}
							</p>
						</ReviewSection>

						{/* Location */}
						{values.location?.address && (
							<ReviewSection title="Location" icon={MapPin} onEdit={() => goToStep(2)}>
								<p className="text-xs sm:text-sm text-foreground font-medium truncate">{values.location.name || values.location.address}</p>
							</ReviewSection>
						)}
					</div>

					{/* Settings Summary */}
					<div className="pt-3 sm:pt-4 border-t border-border relative group">
						<div className="absolute right-0 top-3 sm:top-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
							<button onClick={() => goToStep(4)} className="text-muted-foreground hover:text-foreground p-1 sm:p-1.5" title="Edit Settings">
								<Pencil size={12} />
							</button>
						</div>
						<div className="flex flex-wrap gap-2 sm:gap-3">
							{/* Payment Badge */}
							<div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-surface border border-border">
								<Coins size={10} className="text-accent sm:hidden" />
								<Coins size={12} className="text-accent hidden sm:block" />
								<span className="text-[10px] sm:text-xs text-foreground">{!values.usePaymentConfig ? "Free" : getPaymentConfigSummary()}</span>
							</div>

							{/* Privacy Badge */}
							<div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-surface border border-border">
								{values.isPublic ? (
									<>
										<Eye size={10} className="text-accent sm:hidden" />
										<Eye size={12} className="text-accent hidden sm:block" />
									</>
								) : (
									<>
										<EyeOff size={10} className="text-muted-foreground sm:hidden" />
										<EyeOff size={12} className="text-muted-foreground hidden sm:block" />
									</>
								)}
								<span className="text-[10px] sm:text-xs text-foreground">{values.isPublic ? "Public event" : "Private event"}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Confirmation Notice */}
			<div className="bg-accent/10 border border-accent/20 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
				<CheckCircle2 size={16} className="text-accent mt-0.5 shrink-0 sm:hidden" />
				<CheckCircle2 size={18} className="text-accent mt-0.5 shrink-0 hidden sm:block" />
				<p className="text-xs sm:text-sm text-foreground/80">
					By clicking &quot;Create Event&quot;, your event will be published and visible to{" "}
					{values.isPublic ? "all users" : "invited participants only"}. You can edit details later.
				</p>
			</div>
		</div>
	);
}
