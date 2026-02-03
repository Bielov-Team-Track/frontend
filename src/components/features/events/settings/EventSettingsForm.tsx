"use client";

import { Button } from "@/components/ui";
import { saveEvent, SeriesUpdateScope, updateSeriesEvent } from "@/lib/api/events";
import { Event } from "@/lib/models/Event";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { EventSettingsProvider, useEventSettingsContext } from "./EventSettingsContext";
import { SeriesEditModal } from "./SeriesEditModal";

interface EventSettingsFormProps {
	event: Event;
	children: ReactNode;
}

function EventSettingsFormContent({ event, children }: EventSettingsFormProps) {
	const { formData, hasChanges, isSubmitting, setIsSubmitting, resetChanges } = useEventSettingsContext();
	const [showSeriesModal, setShowSeriesModal] = useState(false);
	const queryClient = useQueryClient();

	const isSeriesEvent = !!event.seriesId;

	const saveMutation = useMutation({
		mutationFn: async (scope?: SeriesUpdateScope) => {
			// Build the update payload matching UpdateEventDto
			const updatePayload = {
				id: event.id,
				name: formData.name,
				description: formData.description || undefined,
				type: formData.type,
				surface: formData.surface,
				isPublic: !formData.isPrivate,
				startTime: formData.startTime.toISOString(),
				endTime: formData.endTime.toISOString(),
				location: formData.location,
				paymentsConfig: formData.useBudget && formData.budget
					? {
							pricingModel: formData.budget.pricingModel,
							cost: formData.budget.cost || 0,
							payToJoin: formData.budget.payToJoin,
							dropoutDeadlineHours: formData.budget.dropoutDeadlineHours,
						}
					: undefined,
			};

			if (isSeriesEvent && scope) {
				return updateSeriesEvent(event.id, {
					eventUpdate: updatePayload as any,
					scope,
				});
			} else {
				return saveEvent(updatePayload as any);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event", event.id] });
			setShowSeriesModal(false);
			setIsSubmitting(false);
			toast.success("Event updated successfully");
		},
		onError: (error: any) => {
			console.error("Failed to save event:", error);
			setIsSubmitting(false);
			toast.error(error.response?.data?.message || "Failed to save event");
		},
	});

	const handleSave = () => {
		if (!hasChanges) return;

		setIsSubmitting(true);

		if (isSeriesEvent) {
			setShowSeriesModal(true);
		} else {
			saveMutation.mutate();
		}
	};

	const handleSeriesSave = (scope: SeriesUpdateScope) => {
		saveMutation.mutate(scope);
	};

	const handleModalClose = () => {
		setShowSeriesModal(false);
		setIsSubmitting(false);
	};

	return (
		<div className="space-y-6">
			{children}

			{/* Save Button - Fixed at bottom when changes exist */}
			{hasChanges && (
				<div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-background via-background to-transparent">
					<div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-raised border border-white/10">
						<p className="text-sm text-muted">You have unsaved changes</p>
						<div className="flex gap-3">
							<Button
								variant="ghost"
								color="neutral"
								onClick={resetChanges}
								disabled={isSubmitting}
							>
								Discard
							</Button>
							<Button
								color="primary"
								leftIcon={<Save size={16} />}
								onClick={handleSave}
								disabled={isSubmitting}
							>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</div>
				</div>
			)}

			<SeriesEditModal
				isOpen={showSeriesModal}
				onClose={handleModalClose}
				onConfirm={handleSeriesSave}
				isLoading={saveMutation.isPending}
				eventName={event.name}
				occurrenceNumber={event.seriesOccurrenceNumber}
			/>
		</div>
	);
}

export function EventSettingsForm({ event, children }: EventSettingsFormProps) {
	return (
		<EventSettingsProvider event={event}>
			<EventSettingsFormContent event={event}>{children}</EventSettingsFormContent>
		</EventSettingsProvider>
	);
}
