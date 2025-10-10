import {
	FaVolleyballBall,
	FaCalendar,
	FaClock,
	FaMapMarkerAlt,
} from "react-icons/fa";
import {
	getDuration,
	getFormattedDate,
	getFormattedDateWithDay,
	getFormattedTime,
} from "@/lib/utils/date";
import { Map } from "@/components";
import { useEventFormContext } from "../context/EventFormContext";
import { PricingModel } from "@/lib/models/EventBudget";

export function ReviewStep() {
	const { form } = useEventFormContext();
	const values = form.watch();

	const getBudgetSummary = () => {
		let summary = "";

		if (values.budget.pricingModel === PricingModel.Individual) {
			summary += values.budget.cost + " per person";
		} else if (values.budget.pricingModel === PricingModel.Team) {
			summary += values.budget.cost + " per team";
		} else if (values.budget.pricingModel === PricingModel.Event) {
			summary += values.budget.cost + " split between all participants";
		}

		if (values.budget.dropoutDeadlineHours) {
			summary += `, dropout deadline ${values.budget.dropoutDeadlineHours} hours before event`;
		}

		if (values.budget.minUnitsForBudget) {
			summary += `, minimum ${values.budget.minUnitsForBudget} participants required`;
		}

		return summary;
	};

	return (
		<div className="space-y-6">
			<div className="text-center mb-8">
				<FaVolleyballBall className="w-12 h-12 text-primary mx-auto mb-3" />
				<h2 className="text-xl font-semibold  mb-2">Review & Create</h2>
				<p className="/60">Review your event details and create</p>
			</div>

			<div className="space-y-6">
				{/* Event Summary */}
				<div className="bg-base-50 rounded-lg p-6 space-y-4">
					<h3 className="font-semibold text-lg  mb-4">Event Summary</h3>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<span className="font-medium">🏐 {values.name}</span>
						</div>

						<div className="flex items-center gap-2">
							<span>
								📅{" "}
								{getFormattedDate(values.startTime) ==
								getFormattedDate(values.endTime)
									? getFormattedDateWithDay(new Date(values.startTime))
									: getFormattedDateWithDay(new Date(values.startTime)) +
										" - " +
										getFormattedDateWithDay(new Date(values.endTime))}
							</span>
						</div>

						<div className="flex items-center gap-2">
							<span>
								🕕 {getFormattedTime(new Date(values.endTime))} -{" "}
								{getFormattedTime(new Date(values.startTime))},{" "}
								{getDuration(values.startTime, values.endTime)}
							</span>
						</div>

						{values.location?.address && (
							<div className="flex items-center gap-2">
								<span>
									🗺️ Location: {values.location.name || values.location.address}
								</span>
							</div>
						)}

						<div className="flex items-center gap-2">
							<span>
								🪙 Payments:{" "}
								{!values.useBudget ? "self-managed" : getBudgetSummary()}
							</span>
						</div>
					</div>
				</div>

				<div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
					<p className="text-muted text-sm">
						<strong>Please review:</strong> Make sure all information is correct
						before creating your event. You can edit some details later, but
						major changes may affect participants.
					</p>
				</div>
			</div>
		</div>
	);
}
