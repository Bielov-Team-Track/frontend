"use client";

import { Button, Modal } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import { cancelEvent } from "@/lib/api/events";
import { createEventChat } from "@/lib/api/messages";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";

type EventPageButtonsProps = {
	event: Event;
	participantIds?: string[];
};

const EventPageButtons = ({ event, participantIds = [] }: EventPageButtonsProps) => {
	const router = useRouter();
	const [isCancelling, setIsCancelling] = useState(false);
	const [isCreatingChat, setIsCreatingChat] = useState(false);
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

	const handleMessageParticipants = async () => {
		if (isCreatingChat) return;
		try {
			setIsCreatingChat(true);
			const chat = await createEventChat(
				event.id!,
				undefined, // title - will use event name
				event.name,
				participantIds
			);
			router.push(`/dashboard/messages?chat=${chat.id}`);
		} catch (error) {
			console.error("Failed to create event chat:", error);
			toast.error("Failed to create chat");
		} finally {
			setIsCreatingChat(false);
		}
	};

	return event.canceled ? null : (
		<>
			<div className="flex gap-2">
				<Button
					variant="ghost"
					color="secondary"
					onClick={handleMessageParticipants}
					loading={isCreatingChat}
					disabled={isCreatingChat}>
					<MessageCircle size={16} className="mr-1" />
					Message
				</Button>
				<Button
					variant="ghost"
					color="secondary"
					onClick={() => {
						redirect("/dashboard/audit/" + event.id);
					}}>
					Audit
				</Button>
				<Button variant="ghost" color="primary">
					Edit
				</Button>
				<Button
					variant="ghost"
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
					<AlertTriangle className="text-warning" size={40} />
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
