"use client";

import { Avatar } from "@/components/ui";
import { UserProfile } from "@/lib/models/User";
import { Calendar, DollarSign, Eye, EyeOff, MapPin, Users } from "lucide-react";
import { WizardStepProps } from "../../core/types";
import { EventFormData } from "../types";

export function ReviewStep({ form }: WizardStepProps<EventFormData>) {
	const values = form.watch();

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (date: Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Review</h2>
				<p className="text-muted-foreground text-sm">Double check everything before creating your event.</p>
			</div>

			{/* Event Card Preview */}
			<div className="rounded-xl border border-border bg-card overflow-hidden">
				{/* Header */}
				<div className="p-4 border-b border-border">
					<h3 className="text-lg font-bold">{values.name || "Untitled Event"}</h3>
					<div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
						<span className="capitalize">{values.type}</span>
						<span>-</span>
						<span className="capitalize">{values.surface}</span>
					</div>
				</div>

				{/* Details */}
				<div className="p-4 space-y-3">
					{/* Date & Time */}
					<div className="flex items-start gap-3">
						<Calendar size={16} className="text-primary mt-0.5" />
						<div>
							<div className="font-medium">{formatDate(values.startTime)}</div>
							<div className="text-sm text-muted-foreground">
								{formatTime(values.startTime)} - {formatTime(values.endTime)}
							</div>
						</div>
					</div>

					{/* Location */}
					<div className="flex items-start gap-3">
						<MapPin size={16} className="text-primary mt-0.5" />
						<div>
							<div className="font-medium">{values.location?.name || "No location"}</div>
							{values.location?.address && <div className="text-sm text-muted-foreground">{values.location.address}</div>}
						</div>
					</div>

					{/* Capacity */}
					<div className="flex items-center gap-3">
						<Users size={16} className="text-primary" />
						<span>{values.capacity ? `${values.capacity} players max` : "Unlimited capacity"}</span>
					</div>

					{/* Visibility */}
					<div className="flex items-center gap-3">
						{values.isPrivate ? (
							<>
								<EyeOff size={16} className="text-primary" />
								<span>Private event</span>
							</>
						) : (
							<>
								<Eye size={16} className="text-primary" />
								<span>Public event</span>
							</>
						)}
					</div>

					{/* Budget */}
					{values.useBudget && values.budget?.cost && (
						<div className="flex items-center gap-3">
							<DollarSign size={16} className="text-primary" />
							<span>${values.budget.cost} per person</span>
						</div>
					)}
				</div>

				{/* Invitees */}
				{values.invitees && values.invitees.length > 0 && (
					<div className="p-4 border-t border-border">
						<div className="text-sm font-medium mb-2">Inviting {values.invitees.length} people</div>
						<div className="flex -space-x-2">
							{values.invitees.slice(0, 5).map((user: UserProfile) => (
								<Avatar
									key={user.userId}
									src={user.imageUrl}
									name={user.name + " " + user.surname}
									size="sm"
									className="ring-2 ring-background"
								/>
							))}
							{values.invitees.length > 5 && (
								<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-background">
									+{values.invitees.length - 5}
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{values.description && (
				<div className="p-4 rounded-lg bg-muted/30 border border-border">
					<div className="text-sm font-medium mb-1">Description</div>
					<p className="text-sm text-muted-foreground">{values.description}</p>
				</div>
			)}
		</div>
	);
}
