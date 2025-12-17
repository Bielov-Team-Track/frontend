import FormBuilderInline from "@/components/features/clubs/settings/forms/FormBuilderInline";
import SettingsSidebar, { SettingsSection } from "@/components/features/clubs/settings/SettingsSidebar";
import { Button, Checkbox } from "@/components/ui";
import { Club } from "@/lib/models/Club";
import { getClubFormTemplates, updateClubSettings } from "@/lib/requests/clubs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import FormsListView from "../forms/FormsListView";

export type RegistrationSectionProps = {
	club: Club;
	onTabChange?: (tabId: SettingsSection) => void;
	activeTab?: SettingsSection;
};

interface FormValues {
	requirePlayerProfile: boolean;
	requireCoachProfile: boolean;
	allowPublicRegistration: boolean;
}

export default function RegistrationSection({ club, onTabChange, activeTab }: RegistrationSectionProps) {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [editingFormId, setEditingFormId] = useState<string | null>(null);

	console.log("RegistrationSection settings", club);

	const { data: forms = [], isLoading: formsLoading } = useQuery({
		queryKey: ["club-forms", club.id],
		queryFn: () => getClubFormTemplates(club.id),
	});

	const {
		control,
		handleSubmit,
		formState: { isDirty },
	} = useForm<FormValues>({
		defaultValues: {
			requirePlayerProfile: club?.settings?.requirePlayerProfile || false,
			requireCoachProfile: club?.settings?.requireCoachProfile || false,
			allowPublicRegistration: club?.settings?.allowPublicRegistration || false,
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (data: FormValues) => {
			return updateClubSettings(club.id, {
				requirePlayerProfile: data.requirePlayerProfile,
				requireCoachProfile: data.requireCoachProfile,
				allowPublicRegistration: data.allowPublicRegistration,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", club.id] });
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
		queryClient.invalidateQueries({ queryKey: ["club-forms", club.id] });
		if (newFormId) {
			setEditingFormId(newFormId);
		}
	};

	const hasChanges = isDirty;

	if (isEditing) {
		return (
			<FormBuilderInline
				clubId={club.id}
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
		<div className="flex gap-2 flex-1">
			<SettingsSidebar clubId={club?.id} onTabChange={onTabChange} activeTab={activeTab} />
			<div className="flex flex-col gap-2 flex-1">
				<form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="flex flex-col relative">
					<div className="sticky h-16 top-0 z-10 bg-background-dark py-4 mb-6 flex justify-between items-center">
						<h2 className="text-lg font-bold text-white">Registration Settings</h2>
						{hasChanges && (
							<Button type="submit" variant="solid" color="accent" size="sm" loading={updateMutation.isPending} leftIcon={<Save size={16} />}>
								Save Changes
							</Button>
						)}
					</div>

					<section className="space-y-4 flex-1">
						<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
							<Controller
								name="allowPublicRegistration"
								control={control}
								render={({ field: { value, onChange, ref } }) => (
									<Checkbox
										ref={ref}
										checked={value}
										onChange={onChange}
										label="Allow people to register with the club"
										helperText="if checked, people witll be able to register with the club, if not - they will be able to join via invitation only."
									/>
								)}
							/>
							<Controller
								name="requireCoachProfile"
								control={control}
								render={({ field: { value, onChange, ref } }) => (
									<Checkbox
										ref={ref}
										checked={value}
										onChange={onChange}
										label="Require user to have filled in player profile information."
										helperText="only applies for registration and invitations."
									/>
								)}
							/>
							<Controller
								name="requirePlayerProfile"
								control={control}
								render={({ field: { value, onChange, ref } }) => (
									<Checkbox
										ref={ref}
										checked={value}
										onChange={onChange}
										label="Require user to have filled in coach profile information."
										helperText="only applies for registration and invitations."
									/>
								)}
							/>
						</div>
					</section>
				</form>
				{updateMutation.isSuccess && (
					<div className="rounded-xl bg-green-500/20 border border-green-500/30 p-4 text-green-400 text-sm">Settings saved successfully!</div>
				)}
				{updateMutation.isError && (
					<div className="rounded-xl bg-red-500/20 border border-red-500/30 p-4 text-red-400 text-sm">Failed to save settings. Please try again.</div>
				)}
				<FormsListView clubId={club?.id} forms={forms} isLoading={formsLoading} onCreate={handleCreateForm} onEdit={handleEditForm} />
			</div>
		</div>
	);
}
