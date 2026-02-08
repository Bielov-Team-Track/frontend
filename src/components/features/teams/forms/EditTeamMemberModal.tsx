"use client";

import { Button, MultiSelectPills } from "@/components";
import Modal from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { RoleCheckboxGroup } from "@/components/ui/role-checkbox-group";
import { TEAM_ROLE_OPTIONS } from "@/lib/constants/roles";
import { TeamMember, TeamRole, VolleyballPosition } from "@/lib/models/Club";
import { useEffect, useState } from "react";
import { VOLLEYBALL_POSITIONS_OPTIONS } from "../constants";

// Helper to extract role strings from role objects or strings
function extractRoleStrings(roles: any[] | undefined): string[] {
	if (!roles) return [];
	return roles.map((r) => (typeof r === "string" ? r : r?.role)).filter(Boolean);
}

interface EditTeamMemberModalProps {
	isOpen: boolean;
	member: TeamMember | null;
	onClose: () => void;
	onSave: (data: { memberId: string; positions: VolleyballPosition[]; jerseyNumber?: string; roles: TeamRole[] }) => void;
	isLoading?: boolean;
}

export default function EditTeamMemberModal({ isOpen, member, onClose, onSave, isLoading = false }: EditTeamMemberModalProps) {
	const [positions, setPositions] = useState<VolleyballPosition[]>([]);
	const [jerseyNumber, setJerseyNumber] = useState<string>("");
	const [roles, setRoles] = useState<TeamRole[]>([]);

	// Reset form when member changes
	useEffect(() => {
		if (member) {
			setPositions(member.positions || []);
			setJerseyNumber(member.jerseyNumber || "");
			setRoles(extractRoleStrings((member as any).roles) as TeamRole[]);
		}
	}, [member]);

	const handleSubmit = () => {
		if (member) {
			onSave({
				memberId: member.id,
				positions: positions,
				jerseyNumber: jerseyNumber.trim() || undefined,
				roles: roles,
			});
		}
	};

	const handleClose = () => {
		setPositions([]);
		setJerseyNumber("");
		setRoles([]);
		onClose();
	};

	if (!member) return null;

	const memberName = `${member.userProfile?.name || ""} ${member.userProfile?.surname || ""}`.trim();

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Edit Player" size="md" preventOutsideClose>
			<div className="space-y-6">
				{/* Player Info Header */}
				<div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
					<div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-lg font-bold text-muted">
						{member.userProfile?.name?.[0] || "?"}
					</div>
					<div>
						<div className="text-base font-medium text-white">{memberName}</div>
						{member.jerseyNumber && <div className="text-sm text-muted">#{member.jerseyNumber}</div>}
					</div>
				</div>

				{/* Positions */}
				<MultiSelectPills
					label="Positions"
					optional
					options={VOLLEYBALL_POSITIONS_OPTIONS}
					selectedItems={positions}
					onSelectedItemsChange={(items) => setPositions(items as VolleyballPosition[])}
				/>

				{/* Jersey Number */}
				<div>
					<label className="block text-sm font-medium text-white mb-2">Jersey Number (Optional)</label>
					<input
						type="text"
						value={jerseyNumber}
						onChange={(e) => setJerseyNumber(e.target.value)}
						placeholder="e.g. 10"
						className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-hidden focus:border-accent"
					/>
				</div>

				{/* Roles */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-white">Assign Roles (Optional)</Label>
					<RoleCheckboxGroup
						availableRoles={TEAM_ROLE_OPTIONS}
						selectedRoles={roles}
						onChange={setRoles}
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-3 pt-4">
					<Button variant="ghost" color="neutral" fullWidth onClick={handleClose}>
						Cancel
					</Button>
					<Button variant="default" color="accent" fullWidth onClick={handleSubmit} loading={isLoading}>
						Save Changes
					</Button>
				</div>
			</div>
		</Modal>
	);
}
