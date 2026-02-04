"use client";

import { RegistrationForm } from "@/components/features/clubs/registrations/RegistrationForm";
import { Avatar, Button, Loader } from "@/components/ui";
import { createRegistration, getClub, getClubSettings, getFormTemplate, getMyRegistration } from "@/lib/api/clubs";
import { createOrUpdateCoachProfile, createOrUpdatePlayerProfile, getCoachProfile, getPlayerProfile } from "@/lib/api/user";
import { ClubRegistration, FormFieldAnswerDto, RegistrationStatus } from "@/lib/models/Club";
import { useAuth } from "@/providers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, ImageOff, MapPin, PartyPopper, Shield, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
	clubSlug: string;
};

const RegisterPageClient = ({ clubSlug: clubId }: Props) => {
	const router = useRouter();
	const { userProfile } = useAuth();
	const [bannerError, setBannerError] = useState(false);
	const queryClient = useQueryClient();

	const { data: club, isLoading: isLoadingClub } = useQuery({
		queryKey: ["club", clubId],
		queryFn: () => getClub(clubId),
	});

	const { data: settings, isLoading: isLoadingSettings } = useQuery({
		queryKey: ["clubSettings", club?.id],
		queryFn: () => getClubSettings(club!.id),
		enabled: !!club?.id,
	});

	const { data: existingRegistration, isLoading: isLoadingRegistration } = useQuery({
		queryKey: ["myRegistration", club?.id],
		queryFn: () => getMyRegistration(club!.id),
		enabled: !!club?.id && !!userProfile,
	});

	const { data: playerProfile } = useQuery({
		queryKey: ["playerProfile"],
		queryFn: () => getPlayerProfile(userProfile?.id!),
		enabled: !!userProfile,
	});

	const { data: coachProfile } = useQuery({
		queryKey: ["coachProfile"],
		queryFn: () => getCoachProfile(userProfile?.id!),
		enabled: !!userProfile,
	});

	const { data: defaultFormTemplate } = useQuery({
		queryKey: ["defaultFormTemplate", club?.id],
		queryFn: () => getFormTemplate(club!.id, settings?.defaultFormTemplateId!),
		enabled: !!settings?.defaultFormTemplateId,
	});

	const submitMutation = useMutation({
		mutationFn: (formAnswers?: FormFieldAnswerDto[]) => createRegistration(club!.id, { formAnswers }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
		},
	});

	const updatePlayerMutation = useMutation({
		mutationFn: createOrUpdatePlayerProfile,
	});

	const updateCoachMutation = useMutation({
		mutationFn: createOrUpdateCoachProfile,
	});

	if (isLoadingClub || isLoadingSettings || isLoadingRegistration) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-background">
				<Loader size="lg" />
			</div>
		);
	}

	if (!club) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-4 text-center">
				<Shield className="w-20 h-20 text-muted/50 mb-6" />
				<h1 className="text-3xl font-bold mb-3">Club Not Found</h1>
				<p className="text-muted mb-8 max-w-md">The club you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
				<Link href="/clubs">
					<Button variant="outline" size="lg">
						Browse Clubs
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background pb-20">
			{/* --- HERO SECTION --- */}
			<div className="relative w-full">
				<div className="h-64 md:h-80 w-full relative overflow-hidden bg-background-light">
					{club.bannerUrl && !bannerError ? (
						<motion.img
							initial={{ scale: 1.1, opacity: 0 }}
							animate={{ scale: 1, opacity: 0.6 }}
							transition={{ duration: 1 }}
							src={club.bannerUrl}
							alt="Club Banner"
							className="w-full h-full object-cover"
							onError={() => setBannerError(true)}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-linear-to-r from-accent/10 to-primary/10">
							<ImageOff size={48} className="text-white/10" />
						</div>
					)}
					<div className="absolute inset-0 bg-linear-to-t from-background-dark via-background-dark/40 to-transparent" />

					<div className="absolute top-6 left-6 z-10">
						<Link href={`/clubs/${clubId}`}>
							<Button
								variant="ghost"
								className="bg-black/20 backdrop-blur-md text-white hover:bg-black/40 border border-white/10"
								leftIcon={<ArrowLeft size={16} />}>
								Back to Club
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* --- MAIN CONTENT --- */}
			<div className="max-w-4xl mx-auto px-4 relative z-10 -mt-24">
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="flex flex-col items-center text-center mb-10">
					<div className="relative group shrink-0 mb-6">
						<Avatar src={club.logoUrl} size="2xl" variant="club" />
					</div>

					<div>
						<h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">{club.name}</h1>
						<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted-foreground">
							{club.location && (
								<span className="flex items-center gap-1.5 bg-hover px-3 py-1 rounded-full border border-border text-sm">
									<MapPin size={14} /> {club.location}
								</span>
							)}
							<span className="flex items-center gap-1.5 bg-hover px-3 py-1 rounded-full border border-border text-sm">
								<Users size={14} /> {club.memberCount || 0} Members
							</span>
						</div>
					</div>

					{club.description && (
						<div className="max-w-2xl mx-auto mb-10">
							<p className="text-lg text-muted/80 leading-relaxed font-light">{club.description}</p>
						</div>
					)}
				</motion.div>

				{/* Registration Content */}
				<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="w-full">
					{!userProfile ? (
						<div className="max-w-md mx-auto p-10 rounded-3xl bg-hover border border-border text-center backdrop-blur-xs">
							<h2 className="text-2xl font-bold text-white mb-3">Join {club.name}</h2>
							<p className="text-muted mb-8">Sign in or create an account to start your registration.</p>
							<Button
								variant="outline"
								color="primary"
								size="lg"
								className="w-full"
								onClick={() => router.push(`/login?redirect=/clubs/${clubId}/register`)}>
								Sign In to Register
							</Button>
						</div>
					) : existingRegistration ? (
						<RegistrationStatusView registration={existingRegistration} clubName={club.name} clubId={clubId} settings={settings} />
					) : settings && !settings.allowPublicRegistration ? (
						<div className="max-w-lg mx-auto p-10 rounded-3xl bg-hover border border-border text-center">
							<Shield size={64} className="mx-auto mb-6 text-muted/50" />
							<h2 className="text-2xl font-bold text-white mb-3">Registration Closed</h2>
							<p className="text-muted mb-8">
								This club is not accepting new public registrations at the moment. Please contact the club administrator for an invitation.
							</p>
							<Link href={`/clubs/${clubId}`}>
								<Button variant="link" color={"neutral"} size="lg" leftIcon={<ArrowLeft size={16} />}>
									Return to Club Page
								</Button>
							</Link>
						</div>
					) : (
						<div className="p-6 md:p-10 rounded-3xl bg-hover border border-border shadow-xl backdrop-blur-xs">
							<div className="mb-8 text-center border-b border-border pb-8">
								<h2 className="text-2xl font-bold text-white mb-2">Registration Form</h2>
								<p className="text-muted">Please provide the required details to join the team.</p>
							</div>

							<RegistrationForm
								club={club}
								settings={settings!}
								formTemplate={defaultFormTemplate}
								hasPlayerProfile={!!playerProfile}
								hasCoachProfile={!!coachProfile}
								onSubmit={(formAnswers) => submitMutation.mutate(formAnswers)}
								onPlayerProfileUpdate={async (data) => {
									await updatePlayerMutation.mutateAsync(data);
								}}
								onCoachProfileUpdate={async (data) => {
									await updateCoachMutation.mutateAsync(data);
								}}
								isSubmitting={submitMutation.isPending}
							/>
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default RegisterPageClient;

// --- STATUS VIEWS ---

interface RegistrationStatusViewProps {
	registration: ClubRegistration;
	clubName: string;
	clubId: string;
	settings?: {
		welcomeMessage?: string;
		pendingMessage?: string;
		waitlistMessage?: string;
		declinedMessage?: string;
	};
}

function RegistrationStatusView({ registration, clubName, clubId, settings }: RegistrationStatusViewProps) {
	if (registration.status === RegistrationStatus.Accepted) {
		const defaultMessage = "Congratulations! Your registration has been accepted. You are now an official member of the team.";
		const message = settings?.welcomeMessage || defaultMessage;

		return (
			<div className="max-w-2xl mx-auto p-10 rounded-3xl bg-hover border border-border text-center relative overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] -z-10" />
				<div className="inline-flex items-center justify-center p-5 bg-success/10 rounded-full mb-6 relative">
					<PartyPopper size={48} className="text-success" />
				</div>
				<h2 className="text-3xl font-bold text-white mb-4">Welcome to {clubName}!</h2>
				<p className="text-lg text-muted mb-8 max-w-lg mx-auto leading-relaxed">{message}</p>

				{registration.publicNote && (
					<div className="bg-hover border-l-4 border-l-success border-border rounded-r-xl p-6 mb-8 text-left max-w-lg mx-auto">
						<h4 className="text-xs font-bold text-success uppercase tracking-wider mb-2">Message from Club</h4>
						<p className="text-white italic font-light">&quot;{registration.publicNote}&quot;</p>
					</div>
				)}

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link href={`/dashboard/clubs/${clubId}`}>
						<Button variant="ghost" color="neutral" rightIcon={<ArrowRight size={16} />}>
							Go to Dashboard
						</Button>
					</Link>
					<Link href={`/clubs/${clubId}`}>
						<Button variant="default" color="primary">
							View Club Page
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (registration.status === RegistrationStatus.Pending) {
		const defaultMessage =
			"Your registration is currently Pending Review. The club administrators have been notified and will review your application shortly.";
		const message = settings?.pendingMessage || defaultMessage;

		return (
			<div className="max-w-xl mx-auto p-10 rounded-3xl bg-hover border border-border text-center backdrop-blur-xs">
				<div className="inline-flex items-center justify-center p-5 bg-warning/10 rounded-full mb-6">
					<Clock size={48} className="text-warning" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-3">Request Submitted</h2>
				<p className="text-muted mb-8 text-lg">{message}</p>

				<div className="flex justify-center">
					<Link href={`/clubs/${clubId}`}>
						<Button variant="link" color={"neutral"} size="lg" leftIcon={<ArrowLeft size={16} />}>
							Return to Club Page
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (registration.status === RegistrationStatus.Waitlist) {
		const defaultMessage =
			"Thank you for your interest. The club is currently full, but you have been added to the Waitlist. We will notify you as soon as a spot becomes available.";
		const message = settings?.waitlistMessage || defaultMessage;

		return (
			<div className="max-w-xl mx-auto p-10 rounded-3xl bg-hover border border-border text-center backdrop-blur-xs">
				<div className="inline-flex items-center justify-center p-5 bg-info/10 rounded-full mb-6">
					<Users size={48} className="text-info" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-3">Added to Waitlist</h2>
				<p className="text-muted mb-8 text-lg">{message}</p>

				{registration.publicNote && (
					<div className="bg-hover border-l-4 border-l-info border-border rounded-r-xl p-6 mb-8 text-left max-w-lg mx-auto">
						<h4 className="text-xs font-bold text-info uppercase tracking-wider mb-2">Note from Club</h4>
						<p className="text-white italic font-light">&quot;{registration.publicNote}&quot;</p>
					</div>
				)}

				<div className="flex justify-center">
					<Link href={`/clubs/${clubId}`}>
						<Button variant="link" color={"neutral"} size="lg" leftIcon={<ArrowLeft size={16} />}>
							Return to Club Page
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (registration.status === RegistrationStatus.Declined) {
		const defaultMessage = `We appreciate your interest in joining ${clubName}. Unfortunately, we are unable to accept your registration at this time.`;
		const message = settings?.declinedMessage || defaultMessage;

		return (
			<div className="max-w-xl mx-auto p-10 rounded-3xl bg-hover border border-border text-center backdrop-blur-xs">
				<div className="inline-flex items-center justify-center p-5 bg-error/10 rounded-full mb-6">
					<XCircle size={48} className="text-error" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-3">Registration Declined</h2>
				<p className="text-muted mb-8 text-lg">{message}</p>

				{registration.publicNote && (
					<div className="bg-hover border-l-4 border-l-error border-border rounded-r-xl p-6 mb-8 text-left max-w-lg mx-auto">
						<h4 className="text-xs font-bold text-error uppercase tracking-wider mb-2">Reason / Note</h4>
						<p className="text-white italic font-light">&quot;{registration.publicNote}&quot;</p>
					</div>
				)}

				<div className="flex justify-center">
					<Link href={`/clubs/${clubId}`}>
						<Button variant="link" color={"neutral"} size="lg" leftIcon={<ArrowLeft size={16} />}>
							Return to Club Page
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return null;
}
