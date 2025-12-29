"use client";

import { FormRenderer } from "@/components/features/clubs/forms/";
import { ProfileRequirementsSection } from "@/components/features/clubs/shared";
import { Button } from "@/components/ui";
import { Club, ClubSettings, FormFieldAnswerDto, FormTemplate } from "@/lib/models/Club";
import { CreateOrUpdateCoachProfileDto, CreateOrUpdatePlayerProfileDto } from "@/lib/models/Profile";
import { Send } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

type Props = {
	club: Club;
	settings: ClubSettings;
	formTemplate?: FormTemplate;
	hasPlayerProfile: boolean;
	hasCoachProfile: boolean;
	onSubmit: (formAnswers?: FormFieldAnswerDto[]) => void;
	onPlayerProfileUpdate: (data: CreateOrUpdatePlayerProfileDto) => Promise<void>;
	onCoachProfileUpdate: (data: CreateOrUpdateCoachProfileDto) => Promise<void>;
	isSubmitting: boolean;
};

export const RegistrationForm = ({
	club,
	settings,
	formTemplate,
	hasPlayerProfile,
	hasCoachProfile,
	onSubmit,
	onPlayerProfileUpdate,
	onCoachProfileUpdate,
	isSubmitting,
}: Props) => {
	const methods = useForm({
		mode: "onChange",
	});
	const {
		handleSubmit,
		formState: { isValid },
	} = methods;

	const needsPlayerProfile = settings.requirePlayerProfile && !hasPlayerProfile;
	const needsCoachProfile = settings.requireCoachProfile && !hasCoachProfile;
	const isFormRequired = formTemplate && formTemplate.fields.length > 0;
	const isFormValid = isFormRequired ? isValid : true;

	const canSubmit = !needsPlayerProfile && !needsCoachProfile && isFormValid;

	const onValidSubmit = (data: any) => {
		if (!canSubmit) return;

		let answers: FormFieldAnswerDto[] | undefined = undefined;

		if (formTemplate && formTemplate.fields.length > 0) {
			answers = Object.entries(data).map(([key, value]) => ({
				formFieldId: key,
				value: String(value),
			}));
		}

		onSubmit(answers);
	};

	return (
		<FormProvider {...methods}>
			<div className="flex flex-col gap-6">
				{settings.requirePlayerProfile === false && settings.requireCoachProfile === false && (!formTemplate || formTemplate.fields.length === 0) ? (
					<div className="flex flex-col gap-2">
						<h2 className="text-xl font-semibold text-white">Join {club.name}</h2>
						<p className="text-sm text-muted">No specific requirements in plce for {club.name}. You can join right now!</p>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						<h2 className="text-xl font-semibold text-white">Join {club.name}</h2>
						<p className="text-sm text-muted">Complete the requirements below to request membership.</p>
					</div>
				)}

				<ProfileRequirementsSection
					requirePlayerProfile={settings.requirePlayerProfile}
					requireCoachProfile={settings.requireCoachProfile}
					hasPlayerProfile={hasPlayerProfile}
					hasCoachProfile={hasCoachProfile}
					onPlayerProfileSave={onPlayerProfileUpdate}
					onCoachProfileSave={onCoachProfileUpdate}
				/>

				{formTemplate && formTemplate.fields.length > 0 && (
					<div className="p-6 bg-white/5 rounded-xl border border-white/10">
						<h3 className="text-lg font-medium text-white mb-4">Registration Questions</h3>
						<FormRenderer fields={formTemplate.fields} />
					</div>
				)}

				<Button
					variant="outline"
					onClick={handleSubmit(onValidSubmit)}
					disabled={!canSubmit || isSubmitting}
					loading={isSubmitting}
					leftIcon={<Send size={16} />}
					className="self-center">
					Submit Registration Request
				</Button>
			</div>
		</FormProvider>
	);
};
