import React from "react";
import { Position as PositionModel } from "@/lib/models/Position";
import { Team as TeamModel } from "@/lib/models/Team";
import { Avatar, Button, Loader } from "@/components/ui";
import Link from "next/link";
import { updateParticipantPaymentStatus } from "@/lib/api/events";
import { CheckCircle, MoreHorizontal, AlertCircle } from "lucide-react";

const AuditPostition = ({
	position,
	team,
}: {
	position: PositionModel;
	team: TeamModel;
}) => {
	const [defaultPosition, setDefaultPosition] = React.useState(position);
	const [isMarkingAsPaid, setIsMarkingAsPaid] = React.useState(false);

	const closeDropdown = () => {
		const elem = document.activeElement as HTMLElement;
		if (elem) {
			elem.blur();
		}
	};

	const handleMarkAsCompleted = async () => {
		closeDropdown();
		setIsMarkingAsPaid(true);
		updateParticipantPaymentStatus(
			position.eventParticipantId!,
			"completed",
		).then((participant) => {
			setDefaultPosition({ ...defaultPosition, eventParticipant: participant });
			setIsMarkingAsPaid(false);
		});
	};

	const handleMarkAsPending = async () => {
		closeDropdown();
		setIsMarkingAsPaid(true);
		updateParticipantPaymentStatus(
			position.eventParticipantId!,
			"pending",
		).then((participant) => {
			setDefaultPosition({ ...defaultPosition, eventParticipant: participant });
			setIsMarkingAsPaid(false);
		});
	};

	return (
		<div className="p-4 h-14 rounded-md bg-neutral/5 w-full flex justify-between items-center relative">
			{isMarkingAsPaid && (
				<div className="absolute inset-0 bg-black/30 flex justify-center items-center rounded-md">
					<Loader />
				</div>
			)}
			<div>
				<Link
					href={`/profiles/${defaultPosition.eventParticipant!.userId}`}
					className="flex gap-2 items-center"
				>
					<Avatar profile={defaultPosition.eventParticipant?.userProfile!} />
					<div className="flex flex-col">
						<span className="whitespace-nowrap font-bold text-sm  hover:underline">
							{defaultPosition.eventParticipant?.userProfile?.name}{" "}
							{defaultPosition.eventParticipant?.userProfile?.surname}
						</span>
						<span className="text-neutral/60 text-xs">
							{defaultPosition.name}
						</span>
					</div>
				</Link>
			</div>
			<div className="flex gap-4 items-center">
				{defaultPosition.eventParticipant?.payment?.status === "completed" ? (
					<div className="tooltip" data-tip="Paid">
						<CheckCircle size={16} className="text-success" />
					</div>
				) : (
					<div className="tooltip" data-tip="Pending">
						<AlertCircle size={16} className="text-warning" />
					</div>
				)}
				<div className="dropdown dropdown-end z-50">
					<div tabIndex={0} role="button" className="cursor-pointer">
						<MoreHorizontal size={16} />
					</div>
					<ul
						tabIndex={0}
						className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm"
					>
						{defaultPosition.eventParticipant?.payment?.status ===
						"completed" ? (
							<li>
								<button onClick={() => handleMarkAsPending()}>
									Mark as pending
								</button>
							</li>
						) : (
							<li>
								<button onClick={() => handleMarkAsCompleted()}>
									Mark as paid
								</button>
							</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default AuditPostition;
