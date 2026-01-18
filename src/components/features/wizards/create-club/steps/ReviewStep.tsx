"use client";

import { Avatar } from "@/components/ui";
import { UserProfile } from "@/lib/models/User";
import { Check, Eye, EyeOff, ImageIcon, Mail, Phone, Shield } from "lucide-react";
import { WizardStepProps } from "../../core/types";
import { ClubFormData } from "../types";

export function ReviewStep({ form }: WizardStepProps<ClubFormData>) {
	const values = form.watch();

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Review & Create</h2>
				<p className="text-muted-foreground text-sm">Double check everything before creating your club.</p>
			</div>

			{/* Preview Card */}
			<div className="rounded-xl border border-border bg-card overflow-hidden">
				{/* Banner */}
				<div className="h-32 w-full bg-muted relative">
					{values.bannerPreview ? (
						<img src={values.bannerPreview} alt="Banner" className="w-full h-full object-cover" />
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<ImageIcon className="text-muted-foreground/30" size={48} />
						</div>
					)}
					<div className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent" />
				</div>

				<div className="px-6 pb-6 relative">
					{/* Logo */}
					<div className="flex justify-between items-end -mt-10 mb-4">
						<div className="w-20 h-20 rounded-xl border-4 border-card bg-muted overflow-hidden shadow-lg flex items-center justify-center">
							{values.logoPreview ? (
								<img src={values.logoPreview} alt="Logo" className="w-full h-full object-cover" />
							) : (
								<Shield className="text-muted-foreground/30" />
							)}
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<h3 className="text-xl font-bold">{values.name || "Untitled Club"}</h3>
							<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
								{values.isPublic ? (
									<>
										<Eye size={14} />
										<span>Public Club</span>
									</>
								) : (
									<>
										<EyeOff size={14} />
										<span>Private Club</span>
									</>
								)}
							</div>
						</div>

						{values.description && <p className="text-sm text-muted-foreground">{values.description}</p>}

						<div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2">
								<Mail size={14} className="text-muted-foreground" />
								<span className="text-sm">{values.contactEmail || "N/A"}</span>
							</div>
							<div className="flex items-center gap-2">
								<Phone size={14} className="text-muted-foreground" />
								<span className="text-sm">{values.contactPhone || "N/A"}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Invitees */}
				{values.invitees && values.invitees.length > 0 && (
					<div className="px-6 pb-6 border-t border-border pt-4">
						<div className="text-sm font-medium mb-2">Inviting {values.invitees.length} members</div>
						<div className="flex -space-x-2">
							{values.invitees.slice(0, 5).map((user: UserProfile) => (
								<Avatar key={user.userId} src={user.imageUrl} name={user.name + " " + user.surname} size="sm" className="ring-2 ring-card" />
							))}
							{values.invitees.length > 5 && (
								<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-card">
									+{values.invitees.length - 5}
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
				<Check className="text-primary mt-0.5 shrink-0" size={16} />
				<p className="text-sm text-muted-foreground">
					By clicking "Create Club", you agree to our Terms of Service. You will automatically be assigned as the owner.
				</p>
			</div>
		</div>
	);
}
