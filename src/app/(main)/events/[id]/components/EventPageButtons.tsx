"use client";

import { Button, Modal } from "@/components/ui";
import { useState } from "react";
import { cancelEvent } from "@/lib/requests/events";
import { FaExclamationTriangle } from "react-icons/fa";
import { Event } from "@/lib/models/Event";
import { redirect } from "next/navigation";

type EventPageButtonsProps = {
	event: Event;
};

const EventPageButtons = ({ event }: EventPageButtonsProps) => {
	const [isCancelling, setIsCancelling] = useState(false);
	const [showCancelModal, setShowCancelModal] = useState(false);

	const handleCancelEvent = async () => {
		try {
			setIsCancelling(true);
			await cancelEvent(event.id);
			setShowCancelModal(false);
			// Refresh the page to show updated state
			window.location.reload();
		} catch (error) {
			console.error("Failed to cancel event:", error);
		} finally {
			setIsCancelling(false);
		}
	};

	return event.canceled ? null : (
		<>
			<div className="flex gap-2">
				<Button
					variant="outline"
					color="secondary"
					onClick={() => {
						redirect("/dashboard/audit/" + event.id);
					}}>
					Audit
				</Button>
				<Button variant="outline" color="primary">
					Edit
				</Button>
				<Button
					variant="outline"
					color="error"
					onClick={() => setShowCancelModal(true)}>
					Cancel
				</Button>
			</div>

			<Modal
				isOpen={showCancelModal}
				onClose={() => !isCancelling && setShowCancelModal(false)}
				isLoading={isCancelling}>
				<div className="flex flex-col items-center gap-4 p-6">
					<FaExclamationTriangle className="text-warning text-4xl" />
					<h2 className="text-xl font-bold text-center">
						Cancel Event
					</h2>
					<p className="text-center text-muted">
						Are you sure you want to cancel this event? This action
						cannot be undone. All participants will be notified of
						the cancellation.
					</p>
					<div className="flex gap-3 w-full mt-4">
						<Button
							variant="ghost"
							color="error"
							fullWidth
							onClick={handleCancelEvent}
							loading={isCancelling}>
							Cancel Event
						</Button>
						<Button
							variant="solid"
							color="primary"
							fullWidth
							onClick={() => setShowCancelModal(false)}
							disabled={isCancelling}>
							Keep Event
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default EventPageButtons;
