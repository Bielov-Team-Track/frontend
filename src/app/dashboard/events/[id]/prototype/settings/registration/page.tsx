"use client";

import { Unit } from "@/lib/models/EventBudget";
import { useEventContext } from "../../layout";

export default function EventRegistrationSettingsPage() {
	const { event, teams, participants } = useEventContext();

	if (!event) return null;

	const totalSpots = teams.reduce((sum, t) => sum + (t.positions?.length || 0), 0);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-white">Registration Settings</h2>
				<p className="text-sm text-muted">Configure how participants can join this event</p>
			</div>

			{/* Registration Mode */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-6">
				<h3 className="text-lg font-bold text-white mb-4">Registration Mode</h3>
				<div className="space-y-4">
					<div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
						<div>
							<div className="font-medium text-white">Registration Type</div>
							<p className="text-sm text-muted">How participants join this event</p>
						</div>
						<span className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-sm font-medium">
							{event.registrationUnit === Unit.Team ? "Team-based" : "Individual"}
						</span>
					</div>
				</div>
			</div>

			{/* Capacity */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-6">
				<h3 className="text-lg font-bold text-white mb-4">Capacity</h3>
				<div className="space-y-4">
					<div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
						<div>
							<div className="font-medium text-white">Current Participants</div>
							<p className="text-sm text-muted">Number of registered participants</p>
						</div>
						<span className="text-2xl font-bold text-white">
							{participants.length}
							{totalSpots > 0 && <span className="text-muted">/{totalSpots}</span>}
						</span>
					</div>
					<div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
						<div>
							<div className="font-medium text-white">Teams</div>
							<p className="text-sm text-muted">Number of teams in this event</p>
						</div>
						<span className="text-2xl font-bold text-white">{teams.length}</span>
					</div>
				</div>
			</div>

			{/* Pricing */}
			{event.budget && (
				<div className="rounded-2xl bg-white/5 border border-white/10 p-6">
					<h3 className="text-lg font-bold text-white mb-4">Pricing</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
							<div>
								<div className="font-medium text-white">Registration Fee</div>
								<p className="text-sm text-muted">Per {event.budget.pricingModel || "person"}</p>
							</div>
							<span className="text-2xl font-bold text-accent">
								{event.budget.currency || "£"}{event.budget.cost}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
