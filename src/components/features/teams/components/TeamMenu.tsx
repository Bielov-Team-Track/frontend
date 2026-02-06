"use client";

import { UserSearch } from "@/components/features/users";
import { Modal } from "@/components/ui";
import useUser from "@/hooks/useUser";
import { assignCaptain as assignCaptainRequest, removeCaptain as removeCaptainRequest } from "@/lib/api/teams";
import { Team } from "@/lib/models/Team";
import { UserProfile } from "@/lib/models/User";
import { Crown, MoreHorizontal, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";

type TeamMenuProps = {
	team: Team;
	onCaptainAssigned: (user: UserProfile) => void;
	onCaptainRemoved: () => void;
};

function TeamMenu({ team, onCaptainAssigned, onCaptainRemoved }: TeamMenuProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { userProfile } = useUser();

	if (!team) {
		return null;
	}

	const assignCaptain = (selectedUser: UserProfile) => {
		setIsLoading(true);
		assignCaptainRequest(team.id!, selectedUser?.id!)
			.then(() => {
				setIsLoading(false);
				setIsModalOpen(false);
				onCaptainAssigned && onCaptainAssigned(selectedUser);
			})
			.catch(() => {
				setIsLoading(false);
			});
	};

	const removeCaptain = () => {
		setIsLoading(true);
		removeCaptainRequest(team.id!)
			.then(() => {
				setIsLoading(false);
				onCaptainRemoved && onCaptainRemoved();
			})
			.catch(() => {
				setIsLoading(false);
			});
	};

	return (
		<>
			<div className="dropdown dropdown-end">
				<div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle text-muted hover:text-foreground">
					<MoreHorizontal size={16} />
				</div>
				<ul tabIndex={0} className="dropdown-content z-1 menu p-2 shadow-lg bg-surface-elevated border border-border rounded-xl w-48 mt-1">
					<li>
						<button onClick={() => setIsModalOpen(true)} className="text-xs hover:bg-hover hover:text-foreground text-gray-300 gap-2">
							{team.captain ? <UserPlus size={14} /> : <Crown size={14} />}
							{team.captain ? "Change Captain" : "Assign Captain"}
						</button>
					</li>
					{team.captain && (
						<li>
							<button onClick={() => removeCaptain()} className="text-xs hover:bg-red-500/10 hover:text-error text-error gap-2">
								<UserMinus size={14} /> Remove Captain
							</button>
						</li>
					)}
				</ul>
			</div>

			<Modal isLoading={isLoading} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Captain">
				<div className="p-4">
					<p className="text-sm text-muted mb-4">
						Search for a user to make them the captain of <span className="text-foreground font-bold">{team.name}</span>.
					</p>
					<UserSearch onUserSelect={assignCaptain} />
				</div>
			</Modal>
		</>
	);
}

export default TeamMenu;
