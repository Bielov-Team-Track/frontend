"use client";

import { Button } from "@/components";
import { InvitationAcceptForm, InvitationPreview } from "@/components/features/clubs/invitations";
import { Loader } from "@/components/ui";
import { useAuth } from "@/providers";
import { FormFieldAnswerDto, InvitationStatus } from "@/lib/models/Club";
import { CreateOrUpdateCoachProfileDto, CreateOrUpdatePlayerProfileDto } from "@/lib/models/Profile";
import { acceptInvitation, declineInvitation, getInvitationByToken } from "@/lib/api/clubs";
import { getCoachProfile, getPlayerProfile, updateCoachProfile, updatePlayerProfile } from "@/lib/api/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InvitationPageClientProps {
	clubSlug: string;
	token: string;
}

const InvitationPageClient = ({ clubSlug, token }: InvitationPageClientProps) => {
	const router = useRouter();
	const { user, isLoading: authLoading } = useAuth();

	const { data: invitation, isLoading, error } = useQuery({ queryKey: ["invitation", token], queryFn: () => getInvitationByToken(token) });
	const { data: playerProfile } = useQuery({
		queryKey: ["player-profile", user?.id],
		queryFn: () => getPlayerProfile(),
		enabled: !!user && !!invitation?.requirePlayerProfile,
	});
	const { data: coachProfile } = useQuery({
		queryKey: ["coach-profile", user?.id],
		queryFn: () => getCoachProfile(),
		enabled: !!user && !!invitation?.requireCoachProfile,
	});

	const acceptMutation = useMutation({
		mutationFn: async ({
			formAnswers,
			playerData,
			coachData,
		}: {
			formAnswers?: FormFieldAnswerDto[];
			playerData?: CreateOrUpdatePlayerProfileDto;
			coachData?: CreateOrUpdateCoachProfileDto;
		}) => {
			if (playerData) await updatePlayerProfile(playerData);
			if (coachData) await updateCoachProfile(coachData);
			return acceptInvitation(token, formAnswers);
		},
		onSuccess: () => {
			toast.success("Welcome to the club!");
			router.push(`/dashboard/clubs/${invitation?.club.id}`);
		},
		onError: (error: any) => toast.error(error.response?.data?.message || "Failed to accept invitation"),
	});

	const declineMutation = useMutation({
		mutationFn: (reason?: string) => declineInvitation(token, reason),
		onSuccess: () => {
			toast.success("Invitation declined");
			router.push("/clubs");
		},
		onError: (error: any) => toast.error(error.response?.data?.message || "Failed to decline invitation"),
	});

	const handleAccept = async (formAnswers?: FormFieldAnswerDto[], playerData?: CreateOrUpdatePlayerProfileDto, coachData?: CreateOrUpdateCoachProfileDto) =>
		acceptMutation.mutate({ formAnswers, playerData, coachData });
	const handleDecline = async (reason?: string) => declineMutation.mutate(reason);

	if (isLoading || authLoading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);

	if (error || !invitation)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
					<h1 className="text-xl font-bold text-white mb-2">Invitation Not Found</h1>
					<p className="text-muted mb-4">This invitation may have expired or been revoked.</p>
					<Button variant="outline" onClick={() => router.push("/clubs")}>
						Browse Clubs
					</Button>
				</div>
			</div>
		);

	if (invitation.status !== InvitationStatus.Pending)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
					<h1 className="text-xl font-bold text-white mb-2">Invitation {invitation.status}</h1>
					<p className="text-muted mb-4">This invitation has already been {invitation.status.toLowerCase()}.</p>
					<Button variant="outline" onClick={() => router.push("/clubs")}>
						Browse Clubs
					</Button>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen py-12 px-4">
			<div className="max-w-lg mx-auto">
				<InvitationPreview invitation={invitation} />
				<div className="mt-6">
					{!user ? (
						<div className="p-6 bg-base-200 rounded-xl">
							<p className="text-muted text-center mb-4">Sign in to accept this invitation</p>
							<Button
								variant="solid"
								color="primary"
								className="w-full"
								leftIcon={<LogIn size={16} />}
								onClick={() => router.push(`/login?redirect=/clubs/${clubSlug}/invitations/${token}`)}>
								Sign In
							</Button>
						</div>
					) : (
						<div className="p-6 bg-base-200 rounded-xl">
							<InvitationAcceptForm
								invitation={invitation}
								hasPlayerProfile={!!playerProfile}
								hasCoachProfile={!!coachProfile}
								onAccept={handleAccept}
								onDecline={handleDecline}
								isAccepting={acceptMutation.isPending}
								isDeclining={declineMutation.isPending}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default InvitationPageClient;
