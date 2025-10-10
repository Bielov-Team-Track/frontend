"use client";

import React, { useState } from "react";
import {
	FiPlus as PlusIcon,
	FiX as RemoveIcon,
	FiMoreVertical as MenuIcon,
} from "react-icons/fi";
import { Button, Loader } from "@/components/ui";
import { usePosition } from "@/hooks/usePosition";
import { useAuth } from "@/lib/auth/authContext";
import PositionWithUser from "./PositionWithUser";
import { Position as PositionModel } from "@/lib/models/Position";
import { Team } from "@/lib/models/Team";
import { Modal } from "@/components/ui";
import { UserSearch } from "@/components/features/users";
import { deletePosition } from "@/lib/requests/positions";
import { Unit } from "@/lib/models/EventBudget";
import AuditPosition from "../../audit/components/AuditPosition";

type PositionProps = {
	position: PositionModel;
	team: Team;
	payToJoin?: boolean;
	open?: boolean;
	editable?: boolean;
	audit?: boolean;
	onPositionRemoved?: (positionId: string) => void;
};

function Position({
	position: defaultPosition,
	team,
	open = false,
	editable = false,
	audit = false,
	onPositionRemoved,
}: PositionProps) {
	const { userProfile } = useAuth();

	const { position, isLoading, assignPosition, takePosition, leavePosition } =
		usePosition(defaultPosition, userProfile);

	const handlePayment = async () => {
		// Implement payment logic here
		// After successful payment, call takePosition
		await takePosition();
	};

	return (
		<div className="relative">
			{isLoading && (
				<Loader className="absolute inset-0 bg-black/55 rounded-md z-50" />
			)}
			{position.eventParticipant?.userProfile ? (
				audit ? (
					<AuditPosition position={position} team={team} />
				) : (
					<PositionWithUser
						onPositionLeave={leavePosition}
						position={position}
						userId={userProfile?.userId!}
						editable={editable}
						open={open}
						team={team}
					/>
				)
			) : (
				<AvailablePosition
					position={position}
					team={team}
					editable={editable}
					open={open}
					takePosition={takePosition}
					handlePayment={handlePayment}
					assignPosition={assignPosition}
					onPositionRemoved={onPositionRemoved}
				/>
			)}
		</div>
	);
}

type PositionMenuProps = {
	position: any;
	team: any;
	editable: boolean;
	open: boolean;
	takePosition: () => void;
	handlePayment: () => void;
	assignPosition: (user: any) => void;
	onPositionRemoved?: (positionId: string) => void;
};

const AvailablePosition = ({
	position,
	team,
	editable,
	open,
	takePosition,
	handlePayment,
	assignPosition,
	onPositionRemoved,
}: PositionMenuProps) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);

	const handlePositionRemoval = async () => {
		try {
			setIsRemoving(true);
			await deletePosition(position.id);
			setShowRemoveConfirm(false);
			if (onPositionRemoved) {
				onPositionRemoved(position.id);
			}
		} catch (error) {
			console.error("Failed to remove position:", error);
		} finally {
			setIsRemoving(false);
		}
	};

	return (
		<>
			{/* Dropdown Menu */}
			<div className="dropdown dropdown-end w-full">
				<div
					tabIndex={0}
					role="button"
					className="p-4 h-14 rounded-md bg-black/30 w-full flex justify-between items-center cursor-pointer hover:bg-black/30 transition-colors"
				>
					<span className="text-muted text-sm">{position.name}</span>
					{(open || editable) && (
						<span className="text-muted text-xs">Available</span>
					)}
				</div>

				<ul
					tabIndex={0}
					className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
				>
					{!showRemoveConfirm ? (
						<>
							{/* Take position option for all users */}
							<li>
								<button
									onClick={
										team.event.budget?.payToJoin &&
										team.event.registrationUnit === Unit.Individual
											? handlePayment
											: takePosition
									}
								>
									<PlusIcon />
									{team.event.budget?.payToJoin &&
									team.event.registrationUnit === Unit.Individual
										? `Pay ${team.event.budget.cost} to join`
										: "Take position"}
								</button>
							</li>

							{/* Admin/Captain only options */}
							{editable && (
								<>
									<li>
										<button onClick={() => setIsModalOpen(true)}>
											Assign player
										</button>
									</li>
									<li>
										<button
											className="text-error"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setShowRemoveConfirm(true);
												// Keep dropdown open by refocusing
												const dropdown = e.currentTarget.closest(".dropdown");
												const trigger = dropdown?.querySelector(
													'[tabindex="0"]',
												) as HTMLElement;
												if (trigger) {
													setTimeout(() => trigger.focus(), 0);
												}
											}}
										>
											<RemoveIcon /> Remove position
										</button>
									</li>
								</>
							)}
						</>
					) : (
						// Remove confirmation in dropdown
						<>
							<li className="menu-title">
								<span className="text-error text-sm">Remove position?</span>
							</li>
							<li>
								<button
									className="text-error"
									onClick={handlePositionRemoval}
									disabled={isRemoving}
								>
									{isRemoving ? "Removing..." : "Yes, remove"}
								</button>
							</li>
							<li>
								<button onClick={() => setShowRemoveConfirm(false)}>
									Cancel
								</button>
							</li>
						</>
					)}
				</ul>
			</div>

			{/* User Assignment Modal */}
			<Modal
				isLoading={false}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			>
				<div className="px-4 py-12">
					<UserSearch onUserSelect={assignPosition} />
				</div>
			</Modal>
		</>
	);
};

export default Position;
