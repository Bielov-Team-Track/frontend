// frontend/src/components/features/clubs/settings/FormsListView.tsx
"use client";

import { Button, DeleteConfirmModal, EmptyState, Input, Loader, Select } from "@/components";
import { deleteFormTemplate, duplicateFormTemplate, updateClubSettings, updateFormTemplate } from "@/lib/api/clubs";
import { FormTemplate } from "@/lib/models/Club";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Search } from "lucide-react";
import { useState } from "react";
import FormCard from "./FormCard";

interface FormsListViewProps {
	clubId: string;
	forms: FormTemplate[];
	isLoading: boolean;
	onCreate: () => void;
	onEdit: (formId: string) => void;
}

type FilterStatus = "all" | "active" | "inactive";
type SortOption = "createdAt" | "name";

export default function FormsListView({ clubId, forms, isLoading, onCreate, onEdit }: FormsListViewProps) {
	const queryClient = useQueryClient();

	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
	const [sortBy, setSortBy] = useState<SortOption>("createdAt");
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [formToDelete, setFormToDelete] = useState<FormTemplate | null>(null);

	const duplicateMutation = useMutation({
		mutationFn: (formId: string) => duplicateFormTemplate(clubId, formId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-forms", clubId] });
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ formId, data }: { formId: string; data: any }) => updateFormTemplate(clubId, formId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-forms", clubId] });
		},
	});

	const setDefaultMutation = useMutation({
		mutationFn: (formId: string) =>
			updateClubSettings(clubId, {
				defaultFormTemplateId: formId,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", clubId] });
			queryClient.invalidateQueries({ queryKey: ["defaultFormTemplate", clubId] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (formId: string) => deleteFormTemplate(clubId, formId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-forms", clubId] });
			setDeleteModalOpen(false);
			setFormToDelete(null);
		},
	});

	// Filter and sort forms
	const filteredForms = forms
		.filter((form) => {
			const matchesSearch = form.name.toLowerCase().includes(search.toLowerCase());
			const matchesStatus = filterStatus === "all" || (filterStatus === "active" && form.isActive) || (filterStatus === "inactive" && !form.isActive);
			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => {
			if (sortBy === "name") {
				return a.name.localeCompare(b.name);
			}
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

	const handleSetDefault = async (formId: string) => {
		// First, unset current default
		const currentDefault = forms.find((f) => f.isDefault);
		if (currentDefault) {
			await updateMutation.mutateAsync({
				formId: currentDefault.id,
				data: { isDefault: false },
			});
		}
		// Set new default
		await updateMutation.mutateAsync({
			formId,
			data: { isDefault: true },
		});
	};

	const handleToggleActive = (formId: string, isActive: boolean) => {
		updateMutation.mutate({ formId, data: { isActive } });
	};

	const handleDelete = (formId: string) => {
		const form = forms.find((f) => f.id === formId);
		if (form) {
			setFormToDelete(form);
			setDeleteModalOpen(true);
		}
	};

	// Show forms list
	return (
		<div className="space-y-6 flex-1">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-bold text-white">Registration Forms</h2>
				<Button variant="default" color="accent" size={"sm"} onClick={onCreate} leftIcon={<Plus size={16} />}>
					New Form
				</Button>
			</div>

			{/* Search and Filters */}
			{isLoading ? (
				<div className="flex items-center justify-center h-64 flex-1">
					<Loader size="lg" />
				</div>
			) : (
				<>
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search forms..." leftIcon={<Search size={16} />} />
						</div>
						<div className="flex gap-2">
							<Select
								inlineLabel="Status"
								value={filterStatus}
								onChange={(val) => setFilterStatus(val as FilterStatus)}
								options={[
									{ value: "all", label: "All Status" },
									{ value: "active", label: "Active" },
									{ value: "inactive", label: "Inactive" },
								]}
							/>
							<Select
								inlineLabel="Sort by"
								value={sortBy}
								onChange={(val) => setSortBy(val! as SortOption)}
								options={[
									{ value: "createdAt", label: "Creation Date" },
									{ value: "name", label: "Name" },
								]}
							/>
						</div>
					</div>

					{/* Forms List */}
					{filteredForms.length === 0 ? (
						forms.length === 0 ? (
							<EmptyState
								icon={FileText}
								title="No registration forms yet"
								description="Create your first form to collect information from new members."
								action={{
									label: "Create Form",
									onClick: onCreate,
									icon: Plus,
								}}
							/>
						) : (
							<div className="text-center py-12">
								<p className="text-muted">No forms match your filters</p>
							</div>
						)
					) : (
						<div className="space-y-3">
							{filteredForms.map((form) => (
								<FormCard
									key={form.id}
									form={form}
									clubId={clubId}
									onEdit={() => onEdit(form.id)}
									onDuplicate={(id) => duplicateMutation.mutate(id)}
									onSetDefault={handleSetDefault}
									onToggleActive={handleToggleActive}
									onDelete={handleDelete}
								/>
							))}
						</div>
					)}

					{/* Delete Confirmation Modal */}
					<DeleteConfirmModal
						isOpen={deleteModalOpen}
						title="Delete Form"
						itemName={formToDelete?.name || ""}
						description={`Are you sure you want to delete "${formToDelete?.name}"? This will also delete all responses collected with this form.`}
						onClose={() => {
							setDeleteModalOpen(false);
							setFormToDelete(null);
						}}
						onConfirm={() => formToDelete && deleteMutation.mutate(formToDelete.id)}
						isLoading={deleteMutation.isPending}
					/>
				</>
			)}
		</div>
	);
}
