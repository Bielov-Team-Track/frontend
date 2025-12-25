"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import { MultiSelectPills } from "@/components";
import { ClubMember, VolleyballPosition } from "@/lib/models/Club";
import { VOLLEYBALL_POSITIONS_OPTIONS } from "../constants";

interface AddTeamMemberModalProps {
	isOpen: boolean;
	clubMembers: ClubMember[];
	currentMemberIds: string[];
	onClose: () => void;
	onAdd: (data: {
		userId: string;
		positions: string[];
		jerseyNumber?: string;
	}) => void;
	isLoading?: boolean;
}

export default function AddTeamMemberModal({
	isOpen,
	clubMembers,
	currentMemberIds,
	onClose,
	onAdd,
	isLoading = false,
}: AddTeamMemberModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [positions, setPositions] = useState<VolleyballPosition[]>([]);
	const [jerseyNumber, setJerseyNumber] = useState<string>("");

	const filteredMembers = clubMembers
		.filter((member) => !currentMemberIds.includes(member.id))
		.filter((member) => {
			const name = `${member.userProfile?.name || ""} ${
				member.userProfile?.surname || ""
			}`.toLowerCase();
			return name.includes(searchQuery.toLowerCase());
		});

	const handleSubmit = () => {
		if (selectedUserId) {
			onAdd({
				userId: selectedUserId,
				positions: positions,
				jerseyNumber: jerseyNumber.trim() || undefined,
			});
		}
	};

	const handleClose = () => {
		setSearchQuery("");
		setSelectedUserId(null);
		setPositions([]);
		setJerseyNumber("");
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Add Player" size="md">
			{!selectedUserId ? (
				<div className="space-y-4">
					{/* Search */}
					<div className="relative">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
							size={18}
						/>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search club members..."
							className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent"
						/>
					</div>

					{/* Members List */}
					<div className="max-h-[400px] overflow-y-auto space-y-2">
						{filteredMembers.length === 0 ? (
							<div className="text-center py-8 text-muted">
								<p>No available members found</p>
							</div>
						) : (
							filteredMembers.map((member) => (
								<button
									key={member.id}
									type="button"
									onClick={() => setSelectedUserId(member.userId)}
									className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent hover:bg-accent/10 transition-colors">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-background-dark flex items-center justify-center text-sm font-bold text-muted">
											{member.userProfile?.name?.[0] || "?"}
										</div>
										<div className="text-left">
											<div className="text-sm font-medium text-white">
												{member.userProfile?.name}{" "}
												{member.userProfile?.surname}
											</div>
											<div className="text-xs text-muted">{member.role}</div>
										</div>
									</div>
									<Plus size={18} className="text-muted" />
								</button>
							))
						)}
					</div>
				</div>
			) : (
				<div className="space-y-6">
					<MultiSelectPills
						label="Positions"
						optional
						options={VOLLEYBALL_POSITIONS_OPTIONS}
						selectedItems={positions}
						onSelectedItemsChange={(items) =>
							setPositions(items as VolleyballPosition[])
						}
					/>

					<div>
						<label className="block text-sm font-medium text-white mb-2">
							Jersey Number (Optional)
						</label>
						<input
							type="text"
							value={jerseyNumber}
							onChange={(e) => setJerseyNumber(e.target.value)}
							placeholder="e.g. 10"
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<Button
							variant="ghost"
							color="neutral"
							fullWidth
							onClick={() => setSelectedUserId(null)}>
							Back
						</Button>
						<Button
							variant="solid"
							color="accent"
							fullWidth
							onClick={handleSubmit}
							loading={isLoading}>
							Add Player
						</Button>
					</div>
				</div>
			)}
		</Modal>
	);
}
