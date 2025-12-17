"use client";

import { Button } from "@/components";
import { FieldType, FormFieldAnswerDto, InvitationPreview } from "@/lib/models/Club";
import { CreateOrUpdateCoachProfileDto, CreateOrUpdatePlayerProfileDto } from "@/lib/models/Profile";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormRenderer } from "../forms";
import { ProfileRequirementsSection } from "../shared";

interface InvitationAcceptFormProps {
	invitation: InvitationPreview;
	hasPlayerProfile: boolean;
	hasCoachProfile: boolean;
	onAccept: (
		formAnswers?: FormFieldAnswerDto[],
		playerProfile?: CreateOrUpdatePlayerProfileDto,
		coachProfile?: CreateOrUpdateCoachProfileDto
	) => Promise<void>;
	onDecline: (reason?: string) => Promise<void>;
	isAccepting?: boolean;
	isDeclining?: boolean;
}

const InvitationAcceptForm = ({ invitation, hasPlayerProfile, hasCoachProfile, onAccept, onDecline, isAccepting, isDeclining }: InvitationAcceptFormProps) => {
	const [playerProfileData, setPlayerProfileData] = useState<CreateOrUpdatePlayerProfileDto>();
	const [coachProfileData, setCoachProfileData] = useState<CreateOrUpdateCoachProfileDto>();
	const [showDeclineReason, setShowDeclineReason] = useState(false);
	const [declineReason, setDeclineReason] = useState("");

	const methods = useForm();

	const playerComplete = hasPlayerProfile || !!playerProfileData;
	const coachComplete = hasCoachProfile || !!coachProfileData;
	const requirementsComplete = (!invitation.requirePlayerProfile || playerComplete) && (!invitation.requireCoachProfile || coachComplete);

	const handleAccept = async () => {
		const formData = methods.getValues();
		let formAnswers: FormFieldAnswerDto[] | undefined;
		if (invitation.formTemplate?.fields) {
			formAnswers = invitation.formTemplate.fields.map((field) => {
				let value = formData[field.id];
				if (field.type === FieldType.Checkbox && Array.isArray(value)) value = JSON.stringify(value);
				return { formFieldId: field.id, value: value?.toString() || "" };
			});
		}
		await onAccept(formAnswers, playerProfileData, coachProfileData);
	};

	const handleDecline = async () => {
		if (showDeclineReason) {
			await onDecline(declineReason || undefined);
		} else {
			setShowDeclineReason(true);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<ProfileRequirementsSection
				requirePlayerProfile={invitation.requirePlayerProfile}
				requireCoachProfile={invitation.requireCoachProfile}
				hasPlayerProfile={hasPlayerProfile}
				hasCoachProfile={hasCoachProfile}
				playerProfileData={playerProfileData}
				coachProfileData={coachProfileData}
				onPlayerProfileSave={setPlayerProfileData}
				onCoachProfileSave={setCoachProfileData}
			/>

			{invitation.formTemplate?.fields && invitation.formTemplate.fields.length > 0 && (
				<div className="p-4 bg-white/5 rounded-xl border border-white/10">
					<h3 className="text-lg font-semibold text-white mb-4">{invitation.formTemplate.name}</h3>
					<FormProvider {...methods}>
						<FormRenderer fields={invitation.formTemplate.fields} />
					</FormProvider>
				</div>
			)}

			{showDeclineReason && (
				<div className="p-4 bg-white/5 rounded-xl border border-white/10">
					<label className="text-sm font-medium text-white mb-2 block">Reason for declining (optional)</label>
					<textarea
						value={declineReason}
						onChange={(e) => setDeclineReason(e.target.value)}
						placeholder="Let them know why you're declining..."
						className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted resize-none"
						rows={3}
					/>
				</div>
			)}

			<div className="flex flex-col sm:flex-row gap-3">
				<Button
					variant="solid"
					color="primary"
					onClick={handleAccept}
					isLoading={isAccepting}
					disabled={!requirementsComplete || isDeclining}
					className="flex-1">
					Join Club
				</Button>
				<Button
					variant={showDeclineReason ? "solid" : "ghost"}
					color={showDeclineReason ? "error" : "neutral"}
					onClick={handleDecline}
					isLoading={isDeclining}
					disabled={isAccepting}>
					{showDeclineReason ? "Confirm Decline" : "Decline"}
				</Button>
				{showDeclineReason && (
					<Button variant="ghost" onClick={() => setShowDeclineReason(false)} disabled={isDeclining}>
						Cancel
					</Button>
				)}
			</div>

			{!requirementsComplete && <p className="text-sm text-amber-400 text-center">Please complete all required profile sections before joining.</p>}
		</div>
	);
};

export default InvitationAcceptForm;
