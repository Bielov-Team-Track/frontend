"use client";

import { Avatar, Button } from "@/components";
import { InviteeSelectorModal } from "@/components/features/events/forms/steps/registration";
import { UserProfile } from "@/lib/models/User";
import { Clock, Mail, MoreHorizontal, Search, UserMinus, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { useEventContext } from "../layout";

type SubTab = "participants" | "invitations";

export default function EventMembersPage() {
	const { event, participants, isAdmin } = useEventContext();
	const [activeSubTab, setActiveSubTab] = useState<SubTab>("participants");
	const [searchQuery, setSearchQuery] = useState("");
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [inviteProfiles, setInviteProfiles] = useState<UserProfile[]>([]);
	const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);

	if (!event) return null;

	// Filter participants based on search
	const filteredParticipants = participants.filter((p) => {
		const profile = p.userProfile;
		if (!searchQuery) return true;
		const fullName = `${profile.name} ${profile.surname}`.toLowerCase();
		return fullName.includes(searchQuery.toLowerCase());
	});

	// Filter invitations based on search
	const filteredInvitations = mockInvitations.filter((inv) => {
		if (!searchQuery) return true;
		const fullName = `${inv.name} ${inv.surname}`.toLowerCase();
		return fullName.includes(searchQuery.toLowerCase()) || inv.email.toLowerCase().includes(searchQuery.toLowerCase());
	});

	const handleSendInvitations = (profiles: UserProfile[]) => {
		console.log("Send invitations to:", profiles);
	};

	const handleRemoveParticipant = (participantId: string) => {
		// TODO: Implement remove participant API call
		console.log("Remove participant:", participantId);
		setShowMemberMenu(null);
	};

	const handleCancelInvitation = (invitationId: string) => {
		// TODO: Implement cancel invitation API call
		console.log("Cancel invitation:", invitationId);
	};

	const handleResendInvitation = (invitationId: string) => {
		// TODO: Implement resend invitation API call
		console.log("Resend invitation:", invitationId);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl font-bold text-white">Members</h2>
					<p className="text-sm text-muted">Manage event participants and invitations</p>
				</div>
				{isAdmin && (
					<Button variant="outline" color="primary" leftIcon={<UserPlus size={16} />} onClick={() => setShowInviteModal(true)}>
						Invite
					</Button>
				)}
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
					<input
						type="text"
						placeholder="Search members..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
					/>
				</div>

				{/* Sub-tabs */}
				<div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
					<button
						onClick={() => setActiveSubTab("participants")}
						className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
							activeSubTab === "participants" ? "bg-accent text-white" : "text-muted hover:text-white"
						}`}>
						Participants ({participants.length})
					</button>
					<button
						onClick={() => setActiveSubTab("invitations")}
						className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
							activeSubTab === "invitations" ? "bg-accent text-white" : "text-muted hover:text-white"
						}`}>
						Invitations ({mockInvitations.length})
					</button>
				</div>
			</div>

			{/* Content */}
			<div className="rounded-2xl bg-white/5 border border-white/10">
				{activeSubTab === "participants" ? (
					<>
						{filteredParticipants.length > 0 ? (
							<div className="divide-y divide-white/10">
								{filteredParticipants.map(({ userProfile }) => (
									<div key={userProfile.userId} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
										<div className="flex items-center gap-3">
											<Avatar name={`${userProfile.name} ${userProfile.surname}`} src={userProfile.imageUrl} />
											<div>
												<div className="font-medium text-white">
													{userProfile.name} {userProfile.surname}
												</div>
												<div className="text-xs text-muted">{userProfile.teamId ? `Team member` : "Individual"}</div>
											</div>
										</div>

										{isAdmin && (
											<div className="relative">
												<button
													onClick={() => setShowMemberMenu(showMemberMenu === userProfile.userId ? null : userProfile.userId)}
													className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted hover:text-white">
													<MoreHorizontal size={18} />
												</button>

												{showMemberMenu === userProfile.userId && (
													<>
														<div className="fixed inset-0 z-40" onClick={() => setShowMemberMenu(null)} />
														<div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-raised border border-white/10 shadow-xl z-50 py-1">
															<button
																onClick={() => handleRemoveParticipant(userProfile.userId!)}
																className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-white/5 flex items-center gap-3">
																<UserMinus size={16} />
																Remove
															</button>
														</div>
													</>
												)}
											</div>
										)}
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<Users className="w-12 h-12 mx-auto mb-3 text-muted/30" />
								<p className="text-muted">{searchQuery ? "No participants match your search" : "No participants yet"}</p>
							</div>
						)}
					</>
				) : (
					<>
						{filteredInvitations.length > 0 ? (
							<div className="divide-y divide-white/10">
								{filteredInvitations.map((invitation) => (
									<div key={invitation.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
										<div className="flex items-center gap-3">
											<Avatar name={`${invitation.name} ${invitation.surname}`} src={invitation.imageUrl} />
											<div>
												<div className="font-medium text-white">
													{invitation.name} {invitation.surname}
												</div>
												<div className="text-xs text-muted flex items-center gap-2">
													<Mail size={12} />
													{invitation.email}
												</div>
											</div>
										</div>

										<div className="flex items-center gap-3">
											<div className="flex items-center gap-1.5 text-xs text-muted">
												<Clock size={12} />
												Sent {invitation.sentAt}
											</div>
											<span className="px-2 py-1 rounded-lg bg-warning/20 text-warning text-xs font-medium">Pending</span>
											{isAdmin && (
												<div className="flex items-center gap-1">
													<button
														onClick={() => handleResendInvitation(invitation.id)}
														className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted hover:text-white"
														title="Resend invitation">
														<Mail size={16} />
													</button>
													<button
														onClick={() => handleCancelInvitation(invitation.id)}
														className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted hover:text-error"
														title="Cancel invitation">
														<X size={16} />
													</button>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<Mail className="w-12 h-12 mx-auto mb-3 text-muted/30" />
								<p className="text-muted">{searchQuery ? "No invitations match your search" : "No pending invitations"}</p>
							</div>
						)}
					</>
				)}
			</div>

			{/* Invite Modal */}
			<InviteeSelectorModal
				isOpen={showInviteModal}
				onClose={() => setShowInviteModal(false)}
				onConfirm={(users) => handleSendInvitations(users)}
				selectedUsers={inviteProfiles}
			/>
		</div>
	);
}
