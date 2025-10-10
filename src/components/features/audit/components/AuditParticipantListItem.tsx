import { EventParticipant } from "@/lib/models/EventParticipant";
import {
	FaCheck as CheckIcon,
	FaExclamation as ExclamationIcon,
} from "react-icons/fa";
import { Avatar, Button } from "@/components";
import { Event } from "@/lib/models/Event";
import { useState } from "react";
import { updateParticipantPaymentStatus } from "@/lib/requests/events";

type AuditParticipantListItemProps = {
	participant: EventParticipant;
	event: Event;
	onPaymentMarked?: () => void;
};

const AuditParticipantListItem = ({
	participant,
	event,
	onPaymentMarked,
}: AuditParticipantListItemProps) => {
	const [isMarking, setIsMarking] = useState(false);

	const handleMarkAsPaid = async () => {
		setIsMarking(true);
		try {
			await updateParticipantPaymentStatus(participant.id, "completed");
			onPaymentMarked?.();
		} catch (error) {
			console.error("Error marking participant as paid:", error);
		} finally {
			setIsMarking(false);
		}
	};

	return participant.payment?.status === "completed" ? (
		<PaidParticipantListItem participant={participant} event={event} />
	) : (
		<UnpaidParticipantListItem
			participant={participant}
			event={event}
			handleMarkAsPaid={handleMarkAsPaid}
			isMarking={isMarking}
		/>
	);
};

const PaidParticipantListItem = ({
	participant,
}: AuditParticipantListItemProps) => {
	return (
		<div className="flex justify-between items-center /60 rounded-lg p-4">
			<div className="flex gap-2 items-center">
				<CheckIcon className="text-green-500" />
				<Avatar profile={participant.userProfile} />
				<div>
					{participant.userProfile.name} {participant.userProfile.surname}
				</div>
			</div>
			<div className="text-muted">Paid</div>
		</div>
	);
};

const UnpaidParticipantListItem = ({
	participant,
	event,
	handleMarkAsPaid,
	isMarking,
}: AuditParticipantListItemProps & {
	handleMarkAsPaid: () => void;
	isMarking: boolean;
}) => {
	return (
		<div className="flex justify-between items-center bg-warning/10 rounded-lg p-4 border border-warning/20">
			<div className="flex gap-2 items-center">
				<ExclamationIcon className="text-warning" />
				<Avatar profile={participant.userProfile} />
				<div>
					<div className="font-medium">
						{participant.userProfile.name} {participant.userProfile.surname}
					</div>
					{participant.payment && (
						<div className="text-xs text-muted">
							Amount: £{participant.payment.amount.toFixed(2)}
						</div>
					)}
				</div>
			</div>
			<div>
				<Button onClick={handleMarkAsPaid} disabled={isMarking}>
					{isMarking ? (
						<>
							<span className="loading loading-spinner loading-xs"></span>
							Marking...
						</>
					) : (
						"Mark as Paid"
					)}
				</Button>
			</div>
		</div>
	);
};

export default AuditParticipantListItem;
