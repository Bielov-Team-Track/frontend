import {
	Calendar,
	Clock,
	MapPin,
	Users,
	Coins,
	Eye,
	EyeOff,
	UserCheck,
	CheckCircle2,
	Pencil,
} from "lucide-react";
import {
	getDuration,
	getFormattedDate,
	getFormattedDateWithDay,
	getFormattedTime,
} from "@/lib/utils/date";
import { useEventFormContext } from "../context/EventFormContext";
import { PricingModel } from "@/lib/models/EventBudget";
import { EventFormat } from "@/lib/models/Event";
import { ReactNode } from "react";

interface ReviewSectionProps {
	title: string;
	icon: any;
	onEdit: () => void;
	children: ReactNode;
}

const ReviewSection = ({ title, icon: Icon, onEdit, children }: ReviewSectionProps) => (
	<div className="p-4 rounded-xl bg-white/5 border border-white/5 relative group transition-all hover:bg-white/10">
		<div className="flex items-center justify-between mb-2">
			<div className="flex items-center gap-2">
				<Icon size={14} className="text-accent" />
				<span className="text-xs text-muted uppercase tracking-wider">{title}</span>
			</div>
			<button
				onClick={onEdit}
				className="text-muted hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
				title="Edit"
				type="button"
			>
				<Pencil size={12} />
			</button>
		</div>
		{children}
	</div>
);

export function ReviewStep() {
	const { form, wizard } = useEventFormContext();
	const { goToStep } = wizard;
	const values = form.watch();

	const getBudgetSummary = () => {
		if (values.budget.pricingModel === PricingModel.Individual) {
			return `${values.budget.cost} per person`;
		} else if (values.budget.pricingModel === PricingModel.Team) {
			return `${values.budget.cost} per team`;
		} else if (values.budget.pricingModel === PricingModel.Event) {
			return `${values.budget.cost} split between all`;
		}
		return "Self-managed";
	};

	const getDateDisplay = () => {
		if (getFormattedDate(values.startTime) === getFormattedDate(values.endTime)) {
			return getFormattedDateWithDay(new Date(values.startTime));
		}
		return `${getFormattedDateWithDay(new Date(values.startTime))} - ${getFormattedDateWithDay(new Date(values.endTime))}`;
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-white mb-1">Review & Create</h2>
				<p className="text-muted text-sm">
					Double check everything before creating your event.
				</p>
			</div>

			{/* Event Preview Card */}
			<div className="relative w-full rounded-2xl overflow-hidden bg-background-light border border-white/10 shadow-xl">
				{/* Header Banner */}
				<div className="h-24 w-full bg-gradient-to-br from-accent/30 via-accent/10 to-transparent relative">
					<div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent" />
					<button
						onClick={() => goToStep(1)}
						className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-lg text-white/80 hover:text-white transition-all"
						title="Edit Event Details"
					>
						<Pencil size={14} />
					</button>
				</div>

				<div className="px-6 pb-6 relative -mt-8">
					{/* Event Title */}
					<div className="mb-6">
						<h3 className="text-2xl font-bold text-white mb-1">
							{values.name || "Untitled Event"}
						</h3>
						<p className="text-sm text-muted">
							{values.type} • {values.surface} • {values.eventFormat}
						</p>
					</div>

					{/* Details Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
						{/* Date & Time */}
						<ReviewSection
							title="Date"
							icon={Calendar}
							onEdit={() => goToStep(2)}
						>
							<p className="text-sm text-white font-medium">{getDateDisplay()}</p>
						</ReviewSection>

						<ReviewSection
							title="Time"
							icon={Clock}
							onEdit={() => goToStep(2)}
						>
							<p className="text-sm text-white font-medium">
								{getFormattedTime(new Date(values.startTime))} - {getFormattedTime(new Date(values.endTime))}
							</p>
							<p className="text-xs text-muted mt-0.5">
								{getDuration(values.startTime, values.endTime)}
							</p>
						</ReviewSection>

						{/* Location */}
						{values.location?.address && (
							<ReviewSection
								title="Location"
								icon={MapPin}
								onEdit={() => goToStep(3)}
							>
								<p className="text-sm text-white font-medium">
									{values.location.name || values.location.address}
								</p>
							</ReviewSection>
						)}

						{/* Participants */}
						<ReviewSection
							title="Participants"
							icon={Users}
							onEdit={() => goToStep(4)}
						>
							<p className="text-sm text-white font-medium">
								{values.eventFormat === EventFormat.Open
									? values.capacity
										? `Up to ${values.capacity} people`
										: "Unlimited"
									: `${values.teamsNumber} teams`}
							</p>
						</ReviewSection>
					</div>

					{/* Settings Summary */}
					<div className="pt-4 border-t border-white/5 relative group">
						<div className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								onClick={() => goToStep(4)}
								className="text-muted hover:text-white p-1.5"
								title="Edit Settings"
							>
								<Pencil size={12} />
							</button>
						</div>
						<div className="flex flex-wrap gap-3">
							{/* Payment Badge */}
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
								<Coins size={12} className="text-accent" />
								<span className="text-xs text-white">
									{!values.useBudget ? "Self-managed payments" : getBudgetSummary()}
								</span>
							</div>

							{/* Privacy Badge */}
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
								{values.isPrivate ? (
									<EyeOff size={12} className="text-muted" />
								) : (
									<Eye size={12} className="text-accent" />
								)}
								<span className="text-xs text-white">
									{values.isPrivate ? "Private event" : "Public event"}
								</span>
							</div>

							{/* Approval Badge */}
							{values.approveGuests && (
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
									<UserCheck size={12} className="text-accent" />
									<span className="text-xs text-white">Approval required</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Confirmation Notice */}
			<div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
				<CheckCircle2 size={18} className="text-accent mt-0.5 shrink-0" />
				<p className="text-sm text-white/80">
					By clicking &quot;Create Event&quot;, your event will be published and visible to{" "}
					{values.isPrivate ? "invited participants only" : "all users"}. You can edit details later.
				</p>
			</div>
		</div>
	);
}
