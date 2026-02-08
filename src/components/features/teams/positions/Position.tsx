"use client";

import { UserSearch } from "@/components/features/users";
import { Loader, Modal } from "@/components/ui";
import { usePosition } from "@/hooks/usePosition";
import { deletePosition } from "@/lib/api/positions";
import { Unit } from "@/lib/models/EventPaymentConfig";
import { Position as PositionModel } from "@/lib/models/Position";
import { Team } from "@/lib/models/Team";
import { UserProfile } from "@/lib/models/User";
import { useAuth } from "@/providers";
import { MoreHorizontal, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import AuditPosition from "../../audit/components/AuditPosition";
import PositionWithUser from "./PositionWithUser";

type PositionProps = {
	position: PositionModel;
	team: Team;
	payToJoin?: boolean;
	open?: boolean;
	editable?: boolean;
	audit?: boolean;
	onPositionRemoved?: (positionId: string) => void;
};

function Position({ position: defaultPosition, team, open = false, editable = false, audit = false, onPositionRemoved }: PositionProps) {
	const { userProfile } = useAuth();

	const { position, isLoading, assignPosition, takePosition, leavePosition } = usePosition(defaultPosition, userProfile);

	const handlePayment = async () => {
		// Implement payment logic here
		// After successful payment, call takePosition
		await takePosition();
	};

	return (
		<div className="relative group/position">
			{isLoading && <Loader className="absolute inset-0 bg-overlay rounded-xl z-50" />}
			{position.eventParticipant?.userProfile ? (
				audit ? (
					<AuditPosition position={position} team={team} />
				) : (
					<PositionWithUser
						onPositionLeave={leavePosition}
						position={position}
						userId={userProfile?.id!}
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
	position: PositionModel;
	team: Team;
	editable: boolean;
	open: boolean;
	takePosition: () => void;
	handlePayment: () => void;
	assignPosition: (user: UserProfile) => void;
	onPositionRemoved?: (positionId: string) => void;
};

const AvailablePosition = ({ position, team, editable, open, takePosition, handlePayment, assignPosition, onPositionRemoved }: PositionMenuProps) => {
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
					className="p-3 rounded-xl bg-surface border border-border w-full flex justify-between items-center cursor-pointer hover:bg-hover hover:border-border transition-all group-hover/position:border-border">
					<span className="text-gray-300 text-sm font-medium">{position.name}</span>
					<div className="flex items-center gap-2">
						{(open || editable) && <span className="text-muted text-[10px] uppercase font-bold tracking-wider">Available</span>}
						<MoreHorizontal size={14} className="text-muted opacity-0 group-hover/position:opacity-100 transition-opacity" />
					</div>
				</div>

				<ul tabIndex={0} className="dropdown-content z-1 menu p-2 shadow-lg bg-surface-elevated border border-border rounded-xl w-52 mt-1">
					{!showRemoveConfirm ? (
						<>
							{/* Take position option for all users */}
							<li>
								<button
									onClick={team.event.paymentConfig?.payToJoin && team.event.registrationUnit === Unit.Individual ? handlePayment : takePosition}
									className="text-xs hover:bg-hover hover:text-foreground text-gray-300 gap-2">
									<Plus size={14} />
									{team.event.paymentConfig?.payToJoin && team.event.registrationUnit === Unit.Individual
										? `Pay ${team.event.paymentConfig.cost} to join`
										: "Take position"}
								</button>
							</li>

							{/* Admin/Captain only options */}
							{editable && (
								<>
									<li>
										<button onClick={() => setIsModalOpen(true)} className="text-xs hover:bg-hover hover:text-foreground text-gray-300 gap-2">
											<UserPlus size={14} /> Assign player
										</button>
									</li>
									<li>
										<button
											className="text-xs hover:bg-red-500/10 hover:text-error text-error gap-2"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setShowRemoveConfirm(true);
												// Keep dropdown open by refocusing
												const dropdown = e.currentTarget.closest(".dropdown");
												const trigger = dropdown?.querySelector('[tabindex="0"]') as HTMLElement;
												if (trigger) {
													setTimeout(() => trigger.focus(), 0);
												}
											}}>
											<Trash2 size={14} /> Remove position
										</button>
									</li>
								</>
							)}
						</>
					) : (
						// Remove confirmation in dropdown
						<>
							<li className="menu-title px-4 py-2">
								<span className="text-error text-xs font-bold">Remove position?</span>
							</li>
							<li>
								<button className="text-xs bg-red-500/10 text-error hover:bg-red-500/20" onClick={handlePositionRemoval} disabled={isRemoving}>
									{isRemoving ? "Removing..." : "Yes, remove"}
								</button>
							</li>
							<li>
								<button onClick={() => setShowRemoveConfirm(false)} className="text-xs text-gray-400 hover:text-foreground">
									Cancel
								</button>
							</li>
						</>
					)}
				</ul>
			</div>

			{/* User Assignment Modal */}
			<Modal isLoading={false} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Player">
				<div className="p-4">
					<p className="text-sm text-muted mb-4">
						Select a player to assign to the <span className="text-foreground font-bold">{position.name}</span> position.
					</p>
					<UserSearch onUserSelect={assignPosition} />
				</div>
			</Modal>
		</>
	);
};

export default Position;
