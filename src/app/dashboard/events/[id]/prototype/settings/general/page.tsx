"use client";

import { Button } from "@/components";
import { Edit, MessageCircle } from "lucide-react";
import { useEventContext } from "../../layout";

export default function EventGeneralSettingsPage() {
	const { event } = useEventContext();

	if (!event) return null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-white">General Settings</h2>
				<p className="text-sm text-muted">Manage your event configuration</p>
			</div>

			{/* Quick Actions */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-6">
				<h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
				<div className="space-y-3">
					<Button variant="ghost" color="neutral" fullWidth leftIcon={<Edit size={16} />} className="justify-start">
						Edit Event Details
					</Button>
					<Button variant="ghost" color="neutral" fullWidth leftIcon={<MessageCircle size={16} />} className="justify-start">
						Message All Participants
					</Button>
				</div>
			</div>

			{/* Event Info */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-6">
				<h3 className="text-lg font-bold text-white mb-4">Event Information</h3>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-muted mb-1">Event Name</label>
						<div className="text-white">{event.name}</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted mb-1">Type</label>
						<div className="text-white">{event.type || "Not specified"}</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted mb-1">Description</label>
						<div className="text-white">{event.description || "No description provided"}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
