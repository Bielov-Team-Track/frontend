"use client";

import ProfileHistory from "@/app/dashboard/profile/components/ProfileHistory";
import { BackButton, TextArea } from "@/components/ui";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { RegistrationStatus } from "@/lib/models/Club";
import { getDominantHandLabel, getSkillLevelLabel, getVolleyballPositionLabel } from "@/lib/models/Profile";
import { getClubRegistration, updateRegistrationStatus } from "@/lib/api/clubs";
import { getFullUserProfile } from "@/lib/api/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, Calendar, Check, Clock, FileText, GraduationCap, History, User, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function RegistrationDetailClient() {
	const params = useParams();
	const clubId = params.id as string;
	const registrationId = params.registrationId as string;
	const router = useRouter();
	const queryClient = useQueryClient();

	const [publicNote, setPublicNote] = useState("");
	const [privateNote, setPrivateNote] = useState("");

	// Fetch Registration
	const {
		data: registration,
		isLoading: isRegistrationLoading,
		error: registrationError,
	} = useQuery({
		queryKey: ["club-registration", clubId, registrationId],
		queryFn: () => getClubRegistration(clubId, registrationId),
	});

	// Fetch Full Profile (dependent on registration)
	const { data: profile, isLoading: isProfileLoading } = useQuery({
		queryKey: ["user-full-profile", registration?.userId],
		queryFn: () => getFullUserProfile(registration!.userId),
		enabled: !!registration?.userId,
	});

	// Update Status Mutation
	const statusMutation = useMutation({
		mutationFn: ({ status }: { status: RegistrationStatus }) =>
			updateRegistrationStatus(clubId, registrationId, {
				status,
				publicNote: publicNote || undefined,
				privateNote: privateNote || undefined,
			}),
		onSuccess: (_, variables) => {
			toast.success(`Registration ${variables.status.toLowerCase()} successfully`);
			queryClient.invalidateQueries({ queryKey: ["club-registration", clubId, registrationId] });
			queryClient.invalidateQueries({ queryKey: ["club-registrations", clubId] });
			queryClient.invalidateQueries({ queryKey: ["club-registrations-count", clubId] });
			router.push(`/dashboard/clubs/${clubId}`);
		},
		onError: () => {
			toast.error("Failed to update registration status");
		},
	});

	if (isRegistrationLoading || (registration && isProfileLoading)) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	if (registrationError || !registration) {
		return (
			<EmptyState
				icon={FileText}
				title="Registration not found"
				description="The registration you are looking for does not exist or you don't have permission to view it."
				action={{
					label: "Go Back",
					onClick: () => router.back(),
				}}
			/>
		);
	}

	const user = profile?.userProfile;
	const player = profile?.playerProfile;
	const coach = profile?.coachProfile;
	const history = profile?.historyEntries || [];

	const handleStatusChange = (status: RegistrationStatus) => {
		if (confirm(`Are you sure you want to change status to ${status}?`)) {
			statusMutation.mutate({ status });
		}
	};

	return (
		<div className="space-y-6 max-w-7xl mx-auto pb-20">
			{/* Header */}
			<div className="flex flex-col gap-4">
				<BackButton />
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<h1 className="text-3xl font-bold text-white">{user ? `${user.name} ${user.surname}` : "Unknown User"}</h1>
							<StatusBadge status={registration.status} />
						</div>
						<p className="text-muted flex items-center gap-2 text-sm">
							<Calendar size={14} />
							Submitted on {format(new Date(registration.submittedAt), "PPP p")}
						</p>
					</div>
					<div className="flex gap-2">
						{registration.status === RegistrationStatus.Pending && (
							<>
								<Button
									variant="ghost"
									color="success"
									onClick={() => handleStatusChange(RegistrationStatus.Accepted)}
									loading={statusMutation.isPending}
									leftIcon={<Check size={16} />}>
									Accept
								</Button>
								<Button
									variant="ghost"
									color="error"
									onClick={() => handleStatusChange(RegistrationStatus.Declined)}
									loading={statusMutation.isPending}
									leftIcon={<X size={16} />}>
									Decline
								</Button>
								<Button
									variant="ghost"
									onClick={() => handleStatusChange(RegistrationStatus.Waitlist)}
									loading={statusMutation.isPending}
									leftIcon={<Clock size={16} />}>
									Waitlist
								</Button>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column: Profiles */}
				<div className="lg:col-span-2 space-y-6">
					{/* User Info */}
					<Section title="User Information" icon={User}>
						<div className="flex items-start gap-4">
							<div className="w-20 h-20 rounded-full bg-white/10 overflow-hidden shrink-0">
								{user?.imageUrl ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full flex items-center justify-center text-muted">
										<User size={32} />
									</div>
								)}
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 flex-1">
								<DetailItem label="Full Name" value={`${user?.name || ""} ${user?.surname || ""}`} />
								<DetailItem label="Email" value={user?.email} />
								<DetailItem label="Date of Birth" value={user?.dateOfBirth ? format(new Date(user.dateOfBirth), "PPP") : "Not provided"} />
								<DetailItem label="Location" value="Not provided" /> {/* Assuming location might be added later to profile */}
							</div>
						</div>
					</Section>

					{/* Player Profile */}
					{player && (
						<Section title="Player Profile" icon={Activity}>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<DetailItem label="Highest Level Played" value={getSkillLevelLabel(player.highestLevelPlayed)} />
								<DetailItem label="Height" value={player.heightCm ? `${player.heightCm} cm` : undefined} />
								<DetailItem label="Vertical Jump" value={player.verticalJumpCm ? `${player.verticalJumpCm} cm` : undefined} />
								<DetailItem label="Dominant Hand" value={getDominantHandLabel(player.dominantHand)} />
								{player.preferredPosition !== undefined && (
									<DetailItem label="Preferred Position" value={getVolleyballPositionLabel(player.preferredPosition)} />
								)}
								{player.secondaryPositions && player.secondaryPositions.length > 0 && (
									<div className="md:col-span-2">
										<label className="text-xs text-muted block mb-1">Secondary Positions</label>
										<div className="flex flex-wrap gap-2">
											{player.secondaryPositions.map((pos) => (
												<span key={pos} className="text-xs">
													{getVolleyballPositionLabel(pos)}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						</Section>
					)}

					{/* Coach Profile */}
					{coach && (
						<Section title="Coach Profile" icon={GraduationCap}>
							{!coach.yearsOfExperience && !coach.highestLevelCoached && (!coach.qualifications || coach.qualifications.length === 0) ? (
								<div className="text-muted text-center py-4 italic">No coaching experience</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<DetailItem label="Years of Experience" value={coach.yearsOfExperience?.toString()} />
									<DetailItem label="Highest Level Coached" value={getSkillLevelLabel(coach.highestLevelCoached)} />
									{coach.qualifications && coach.qualifications.length > 0 && (
										<div className="md:col-span-2">
											<label className="text-xs text-muted block mb-1">Certifications</label>
											<div className="flex flex-wrap gap-2">
												{coach.qualifications.map((qual) => (
													<span
														key={qual.id}
														className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs">
														{qual.name} ({qual.year})
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</Section>
					)}

					{/* No profiles message */}
					{!player && !coach && (
						<div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
							<div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted mx-auto mb-3">
								<User size={24} />
							</div>
							<p className="text-muted text-sm">No player or coach profile has been created yet.</p>
						</div>
					)}
				</div>

				{/* Right Column: Application Details */}
				<div className="space-y-6">
					{/* Form Answers - Only show when a form is assigned */}
					{registration.formTemplate && (
						<Section title="Registration Form" icon={FileText}>
							{registration.formResponse?.answers && registration.formResponse.answers.length > 0 ? (
								<div className="space-y-4">
									{registration.formResponse.answers.map((answer) => {
										const field = registration.formTemplate?.fields?.find((f) => f.id === answer.formFieldId);
										return (
											<div key={answer.id} className="space-y-1">
												<p className="text-xs text-muted font-medium">{field?.label || "Question"}</p>
												<p className="text-sm text-white bg-white/5 p-2 rounded-lg border border-white/10">{answer.value}</p>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-muted text-center py-4 italic">No answers submitted</div>
							)}
						</Section>
					)}

					{/* Internal Notes */}
					<Section title="Admin Notes" icon={FileText}>
						<div className="space-y-4">
							<div>
								<label className="text-xs text-muted block mb-1">
									Private Note <span className="text-white/40">(Only admins see this)</span>
								</label>
								<TextArea
									value={privateNote}
									onChange={(e) => setPrivateNote(e.target.value)}
									placeholder="Add internal notes about this applicant..."
									className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-hidden focus:border-accent min-h-[100px]"
								/>
							</div>
							<div>
								<label className="text-xs text-muted block mb-1">
									Public Note <span className="text-white/40">(Applicant will see this)</span>
								</label>
								<TextArea
									value={publicNote}
									onChange={(e) => setPublicNote(e.target.value)}
									placeholder="Message to the applicant..."
									className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-hidden focus:border-accent min-h-[100px]"
								/>
							</div>
							<div className="flex justify-end">
								<Button
									size="sm"
									variant="ghost"
									onClick={() => statusMutation.mutate({ status: registration.status })} /* Just update notes */
									loading={statusMutation.isPending}>
									Save Notes
								</Button>
							</div>
						</div>
					</Section>

					{/* History */}
					<Section title="Career History" icon={History}>
						<ProfileHistory historyEntries={history} />
					</Section>
				</div>
			</div>
		</div>
	);
}

// Sub-components

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
	return (
		<div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
			<div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
				<Icon className="text-accent" size={20} />
				<h3 className="font-bold text-white">{title}</h3>
			</div>
			<div className="p-6">{children}</div>
		</div>
	);
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
	return (
		<div>
			<label className="text-xs text-muted block mb-0.5">{label}</label>
			<div className="text-sm text-white font-medium wrap-break-word">{value || "—"}</div>
		</div>
	);
}

function StatusBadge({ status }: { status: RegistrationStatus }) {
	const colors = {
		[RegistrationStatus.Pending]: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
		[RegistrationStatus.Accepted]: "bg-green-500/20 text-green-400 border-green-500/30",
		[RegistrationStatus.Declined]: "bg-red-500/20 text-red-400 border-red-500/30",
		[RegistrationStatus.Waitlist]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
	};

	return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>{status}</span>;
}
