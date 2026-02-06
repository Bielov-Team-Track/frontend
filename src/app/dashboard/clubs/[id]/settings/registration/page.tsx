"use client";

import FormsListView from "@/components/features/clubs/settings/forms/FormsListView";
import { SettingsAlert, SettingsCard, SettingsHeader } from "@/components/layout/settings-layout";
import { Checkbox, TextArea } from "@/components/ui";
import Loader from "@/components/ui/loader";
import { getClub, getClubFormTemplates, updateClubSettings } from "@/lib/api/clubs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

// Lazy load FormBuilder - heavy component with drag-and-drop
const FormBuilderInline = dynamic(
	() => import("@/components/features/clubs/settings/forms/FormBuilderInline"),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center py-12">
				<Loader size="lg" />
			</div>
		),
	}
);

interface FormValues {
	requirePlayerProfile: boolean;
	requireCoachProfile: boolean;
	allowPublicRegistration: boolean;
	welcomeMessage: string;
	pendingMessage: string;
	waitlistMessage: string;
	declinedMessage: string;
}

export default function ClubRegistrationSettingsPage() {
	const params = useParams();
	const clubId = params.id as string;
	const queryClient = useQueryClient();

	const [isEditing, setIsEditing] = useState(false);
	const [editingFormId, setEditingFormId] = useState<string | null>(null);

	const { data: club } = useQuery({
		queryKey: ["club", clubId],
		queryFn: () => getClub(clubId),
	});

	const { data: forms = [], isLoading: formsLoading } = useQuery({
		queryKey: ["club-forms", clubId],
		queryFn: () => getClubFormTemplates(clubId),
	});

	const {
		control,
		handleSubmit,
		formState: { isDirty },
	} = useForm<FormValues>({
		values: club
			? {
					requirePlayerProfile: club.settings?.requirePlayerProfile || false,
					requireCoachProfile: club.settings?.requireCoachProfile || false,
					allowPublicRegistration: club.settings?.allowPublicRegistration || false,
					welcomeMessage: club.settings?.welcomeMessage || "",
					pendingMessage: club.settings?.pendingMessage || "",
					waitlistMessage: club.settings?.waitlistMessage || "",
					declinedMessage: club.settings?.declinedMessage || "",
				}
			: undefined,
	});

	const updateMutation = useMutation({
		mutationFn: async (data: FormValues) => {
			return updateClubSettings(clubId, {
				requirePlayerProfile: data.requirePlayerProfile,
				requireCoachProfile: data.requireCoachProfile,
				allowPublicRegistration: data.allowPublicRegistration,
				welcomeMessage: data.welcomeMessage || undefined,
				pendingMessage: data.pendingMessage || undefined,
				waitlistMessage: data.waitlistMessage || undefined,
				declinedMessage: data.declinedMessage || undefined,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", clubId] });
		},
	});

	const handleCreateForm = () => {
		setEditingFormId(null);
		setIsEditing(true);
	};

	const handleEditForm = (formId: string) => {
		setEditingFormId(formId);
		setIsEditing(true);
	};

	const handleCloseEditor = () => {
		setIsEditing(false);
		setEditingFormId(null);
	};

	const handleFormSaved = (newFormId?: string) => {
		queryClient.invalidateQueries({ queryKey: ["club-forms", clubId] });
		if (newFormId) {
			setEditingFormId(newFormId);
		}
	};

	const getAlertStatus = () => {
		if (updateMutation.isSuccess) return "success";
		if (updateMutation.isError) return "error";
		return "idle";
	};

	if (!club) return null;

	// Show form builder when editing
	if (isEditing) {
		return (
			<FormBuilderInline
				clubId={clubId}
				formId={editingFormId}
				forms={forms}
				onBack={handleCloseEditor}
				onFormSaved={handleFormSaved}
				onSelectForm={handleEditForm}
				onCreateNew={handleCreateForm}
			/>
		);
	}

	return (
		<div className="space-y-6">
			<form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
				<SettingsHeader
					title="Registration Settings"
					isDirty={isDirty}
					onSave={handleSubmit((data) => updateMutation.mutate(data))}
					isLoading={updateMutation.isPending}
				/>

				<SettingsAlert status={getAlertStatus()} />

				<div className="space-y-6 mt-6">
					{/* Public Registration */}
					<SettingsCard title="Public Registration">
						<Controller
							name="allowPublicRegistration"
							control={control}
							render={({ field: { value, onChange } }) => (
								<Checkbox
									checked={value}
									onChange={onChange}
									label="Allow people to register with the club"
									helperText="If checked, people will be able to register with the club. If not, they can only join via invitation."
								/>
							)}
						/>
						<Controller
							name="requirePlayerProfile"
							control={control}
							render={({ field: { value, onChange } }) => (
								<Checkbox
									checked={value}
									onChange={onChange}
									label="Require player profile information"
									helperText="Users must fill in their player profile before joining."
								/>
							)}
						/>
						<Controller
							name="requireCoachProfile"
							control={control}
							render={({ field: { value, onChange } }) => (
								<Checkbox
									checked={value}
									onChange={onChange}
									label="Require coach profile information"
									helperText="Users must fill in their coach profile before joining."
								/>
							)}
						/>
					</SettingsCard>

					{/* Custom Messages */}
					<SettingsCard title="Custom Registration Messages" description="Customize messages shown to users based on their registration status. Leave empty for defaults.">
						<Controller
							name="welcomeMessage"
							control={control}
							render={({ field }) => (
								<TextArea
									{...field}
									label="Welcome Message (Accepted)"
									placeholder="Congratulations! Your registration has been accepted."
									helperText="Shown when a registration is accepted"
									rows={3}
								/>
							)}
						/>
						<Controller
							name="pendingMessage"
							control={control}
							render={({ field }) => (
								<TextArea
									{...field}
									label="Pending Message"
									placeholder="Your registration is pending review."
									helperText="Shown when a registration is pending"
									rows={3}
								/>
							)}
						/>
						<Controller
							name="waitlistMessage"
							control={control}
							render={({ field }) => (
								<TextArea
									{...field}
									label="Waitlist Message"
									placeholder="You have been added to the waitlist."
									helperText="Shown when added to waitlist"
									rows={3}
								/>
							)}
						/>
						<Controller
							name="declinedMessage"
							control={control}
							render={({ field }) => (
								<TextArea
									{...field}
									label="Declined Message"
									placeholder="Unfortunately, we are unable to accept your registration."
									helperText="Shown when registration is declined"
									rows={3}
								/>
							)}
						/>
					</SettingsCard>
				</div>
			</form>

			{/* Forms List (outside the form) */}
			<FormsListView clubId={clubId} forms={forms} isLoading={formsLoading} onCreate={handleCreateForm} onEdit={handleEditForm} />
		</div>
	);
}
