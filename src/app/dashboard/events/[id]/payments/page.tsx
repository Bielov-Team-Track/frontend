"use client";

import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { useEventContext } from "../layout";

export default function EventPaymentsPage() {
	const { event, teams } = useEventContext();

	if (!event) return null;

	const hasBudget = !!event.budget;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-white">Payments</h2>
					<p className="text-sm text-muted">
						{hasBudget ? "Manage event payments and fees" : "This is a free event"}
					</p>
				</div>
			</div>

			{hasBudget ? (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Event Fee Card */}
						<div className="rounded-2xl bg-surface border border-border p-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-bold text-white">Event Fee</h3>
									<p className="text-sm text-muted">Per {event.budget?.pricingModel || "person"}</p>
								</div>
								<div className="text-4xl font-extrabold text-accent">
									{event.budget?.currency || "£"}{event.budget?.cost}
								</div>
							</div>
						</div>

						{/* Your Payment Status */}
						<div className="rounded-2xl bg-surface border border-border p-6">
							<h3 className="text-lg font-bold text-white mb-4">Your Payment</h3>
							<div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
										<CheckCircle className="text-success" size={20} />
									</div>
									<div>
										<div className="font-medium text-white">Payment Complete</div>
										<div className="text-xs text-muted">Paid on Jan 10, 2026</div>
									</div>
								</div>
								<div className="font-bold text-white">
									{event.budget?.currency || "£"}{event.budget?.cost}
								</div>
							</div>
						</div>

						{/* Payment Methods */}
						<div className="rounded-2xl bg-surface border border-border p-6">
							<h3 className="text-lg font-bold text-white mb-4">Accepted Payment Methods</h3>
							<div className="flex flex-wrap gap-3">
								<div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border">
									<CreditCard size={16} className="text-accent" />
									<span className="text-sm text-white">Card</span>
								</div>
								<div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border">
									<span className="text-sm text-white">💵 Cash</span>
								</div>
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Payment Summary */}
						<div className="rounded-2xl bg-surface border border-border p-5">
							<h3 className="text-sm font-bold text-white mb-4">Payment Summary</h3>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted">Total Expected</span>
									<span className="text-sm font-medium text-white">
										{event.budget?.currency || "£"}
										{(event.budget?.cost || 0) * teams.reduce((sum, t) => sum + (t.positions?.length || 0), 0)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted">Collected</span>
									<span className="text-sm font-medium text-success">
										{event.budget?.currency || "£"}0
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted">Outstanding</span>
									<span className="text-sm font-medium text-warning">
										{event.budget?.currency || "£"}
										{(event.budget?.cost || 0) * teams.reduce((sum, t) => sum + (t.positions?.length || 0), 0)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="rounded-2xl bg-surface border border-border p-12 text-center">
					<CreditCard className="w-16 h-16 mx-auto mb-4 text-muted/30" />
					<h3 className="text-lg font-bold text-white mb-2">Free Event</h3>
					<p className="text-muted text-sm">This event has no registration fee.</p>
				</div>
			)}
		</div>
	);
}
