"use client";

import { RegistrationForm } from "@/components/features/clubs/registrations/RegistrationForm";
import { Button, Loader } from "@/components/ui";
import { useAuth } from "@/lib/auth/authContext";
import { FormFieldAnswerDto } from "@/lib/models/Club";
import { createRegistration, getClub, getClubSettings, getFormTemplate, getMyRegistration } from "@/lib/requests/clubs";
import { createOrUpdateCoachProfile, createOrUpdatePlayerProfile, getCoachProfile, getPlayerProfile } from "@/lib/requests/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, ImageOff, MapPin, Shield, Users } from "lucide-react";
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
	const [logoError, setLogoError] = useState(false);

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
		queryFn: () => getPlayerProfile(userProfile?.userId!),
		enabled: !!userProfile,
	});

	const { data: coachProfile } = useQuery({
		queryKey: ["coachProfile"],
		queryFn: () => getCoachProfile(userProfile?.userId!),
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
			router.push(`/clubs/${clubId}?registered=true`);
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
			<div className="flex justify-center py-24 min-h-screen bg-background-dark">
				<Loader size="lg" />
			</div>
		);
	}

	if (!club) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-white">
				<Shield className="w-16 h-16 text-muted mb-4" />
				<h1 className="text-2xl font-bold mb-2">Club Not Found</h1>
				<p className="text-muted mb-6">The club you&apos;re looking for doesn&apos;t exist.</p>
				<Link href="/clubs">
					<Button variant="outline">Browse Clubs</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background-dark pb-20">
			{/* --- HERO SECTION --- */}
			<div className="relative w-full">
				{/* Banner Image */}
				<div className="h-48 md:h-64 w-full relative overflow-hidden bg-background-light">
					{club.bannerUrl && !bannerError ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={club.bannerUrl} alt="Club Banner" className="w-full h-full object-cover opacity-60" onError={() => setBannerError(true)} />
					) : (
						<div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-accent/20 to-primary/20">
							<ImageOff size={48} className="text-white/20" />
						</div>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent" />

					<div className="absolute top-4 left-4 z-10">
						<Link href={`/clubs/${clubId}`}>
							<Button variant="ghost" className="bg-black/30 backdrop-blur-sm text-white hover:bg-black/50" leftIcon={<ArrowLeft size={16} />}>
								Back to Club
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* --- MAIN CONTENT --- */}
			<div className="max-w-3xl mx-auto px-4 relative z-10">
				{/* Club Header */}
				<div className="flex flex-col items-center text-center mb-8">
					<div className="relative group shrink-0 -mt-16 md:-mt-20 mb-4">
						<div className="h-32 w-32 rounded-2xl border-4 border-background-dark bg-background-light overflow-hidden shadow-2xl flex items-center justify-center">
							{club.logoUrl && !logoError ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={club.logoUrl} alt="Logo" className="w-full h-full object-cover" onError={() => setLogoError(true)} />
							) : (
								<Shield className="text-muted/50 w-12 h-12" />
							)}
						</div>
					</div>

					<div className="mb-6">
						<h1 className="text-3xl font-bold text-white mb-2">{club.name}</h1>
						<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted">
							{club.location && (
								<span className="flex items-center gap-1">
									<MapPin size={14} /> {club.location}
								</span>
							)}
							<span className="flex items-center gap-1">
								<Users size={14} /> {club.memberCount || 0} Members
							</span>
						</div>
					</div>

					{club.description && (
						<div className="max-w-xl mx-auto mb-8">
							<p className="text-muted text-sm leading-relaxed">{club.description}</p>
						</div>
					)}
				</div>

				{/* Registration Content */}
				<div className="w-full">
					{!userProfile ? (
						<div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
							<h2 className="text-xl font-bold text-white mb-2">Join {club.name}</h2>
							<p className="text-muted mb-6">Sign in to start your registration process.</p>
							<Button variant="solid" color="primary" onClick={() => router.push(`/login?redirect=/clubs/${clubId}/register`)}>
								Sign In to Register
							</Button>
						</div>
					) : existingRegistration ? (
						<div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
							<CheckCircle size={48} className="mx-auto mb-4 text-accent" />
							<h2 className="text-xl font-bold text-white mb-2">Request Submitted</h2>
							<p className="text-muted mb-6">
								Your registration request is currently{" "}
								<span className="font-semibold text-white">{existingRegistration.status.toLowerCase()}</span>.
							</p>
							<Link href={`/clubs/${clubId}`}>
								<Button variant="outline" leftIcon={<ArrowLeft size={16} />}>
									Return to Club Page
								</Button>
							</Link>
						</div>
					) : settings && !settings.allowPublicRegistration ? (
						<div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
							<Shield size={48} className="mx-auto mb-4 text-muted" />
							<h2 className="text-xl font-bold text-white mb-2">Registration Closed</h2>
							<p className="text-muted mb-6">This club does not accept public registration requests at this time.</p>
							<Link href={`/clubs/${clubId}`}>
								<Button variant="outline" leftIcon={<ArrowLeft size={16} />}>
									Return to Club Page
								</Button>
							</Link>
						</div>
					) : (
						<div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10">
							<div className="mb-6 text-center">
								<h2 className="text-xl font-bold text-white">Registration</h2>
								<p className="text-sm text-muted">Complete the form below to join the club.</p>
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
				</div>
			</div>
		</div>
	);
};

export default RegisterPageClient;
