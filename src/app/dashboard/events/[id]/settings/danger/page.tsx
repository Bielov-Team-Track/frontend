"use client";

import { Button } from "@/components";
import { AlertTriangle, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { useEventContext } from "../../layout";

export default function EventDangerSettingsPage() {
	const { event } = useEventContext();
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [confirmText, setConfirmText] = useState("");

	if (!event) return null;

	const handleCancelEvent = () => {
		// TODO: Implement cancel event API call
		setShowCancelModal(false);
	};

	const handleDeleteEvent = () => {
		// TODO: Implement delete event API call
		setShowDeleteModal(false);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-error flex items-center gap-2">
					<AlertTriangle size={24} />
					Danger Zone
				</h2>
				<p className="text-sm text-muted">Irreversible actions for this event</p>
			</div>

			{/* Cancel Event */}
			<div className="rounded-2xl bg-error/5 border border-error/20 p-6">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<h3 className="text-lg font-bold text-white mb-1">Cancel Event</h3>
						<p className="text-sm text-muted">
							Canceling will notify all registered participants and mark the event as canceled.
							The event will remain visible but participants won't be able to join.
						</p>
					</div>
					<Button
						variant="outline"
						color="error"
						leftIcon={<XCircle size={16} />}
						onClick={() => setShowCancelModal(true)}
						disabled={event.canceled}>
						{event.canceled ? "Already Canceled" : "Cancel Event"}
					</Button>
				</div>
			</div>

			{/* Delete Event */}
			<div className="rounded-2xl bg-error/5 border border-error/20 p-6">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<h3 className="text-lg font-bold text-white mb-1">Delete Event</h3>
						<p className="text-sm text-muted">
							Permanently remove this event and all associated data including teams, participants,
							and payment records. This action cannot be undone.
						</p>
					</div>
					<Button
						variant="solid"
						color="error"
						leftIcon={<Trash2 size={16} />}
						onClick={() => setShowDeleteModal(true)}>
						Delete Event
					</Button>
				</div>
			</div>

			{/* Cancel Modal */}
			{showCancelModal && (
				<>
					<div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowCancelModal(false)} />
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div className="bg-raised border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
									<XCircle className="text-warning" size={20} />
								</div>
								<h3 className="text-lg font-bold text-white">Cancel Event?</h3>
							</div>
							<p className="text-sm text-muted mb-6">
								Are you sure you want to cancel this event? All participants will be notified and
								no new registrations will be accepted.
							</p>
							<div className="flex justify-end gap-3">
								<Button variant="ghost" color="neutral" onClick={() => setShowCancelModal(false)}>
									Keep Event
								</Button>
								<Button variant="solid" color="error" onClick={handleCancelEvent}>
									Cancel Event
								</Button>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Delete Modal */}
			{showDeleteModal && (
				<>
					<div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowDeleteModal(false)} />
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div className="bg-raised border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
									<Trash2 className="text-error" size={20} />
								</div>
								<h3 className="text-lg font-bold text-white">Delete Event?</h3>
							</div>
							<p className="text-sm text-muted mb-4">
								This action is permanent and cannot be undone. All event data will be lost.
							</p>
							<div className="mb-6">
								<label className="block text-sm font-medium text-white mb-2">
									Type <span className="text-error font-mono">{event.name}</span> to confirm
								</label>
								<input
									type="text"
									value={confirmText}
									onChange={(e) => setConfirmText(e.target.value)}
									placeholder="Enter event name..."
									className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-error/50"
								/>
							</div>
							<div className="flex justify-end gap-3">
								<Button variant="ghost" color="neutral" onClick={() => setShowDeleteModal(false)}>
									Cancel
								</Button>
								<Button
									variant="solid"
									color="error"
									onClick={handleDeleteEvent}
									disabled={confirmText !== event.name}>
									Delete Permanently
								</Button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
