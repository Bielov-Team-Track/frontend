"use client";

import { Checkbox, Input, TextArea } from "@/components/ui";
import { Controller } from "react-hook-form";
import { WizardStepProps } from "../../core/types";
import { ClubFormData } from "../types";

export function BasicInfoStep({ form }: WizardStepProps<ClubFormData>) {
	const {
		register,
		control,
		formState: { errors },
	} = form;

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Basic Information</h2>
				<p className="text-muted-foreground text-sm">Tell us about your club.</p>
			</div>

			<div className="space-y-4">
				<Input label="Club Name" placeholder="e.g., Spikers United" error={errors.name?.message} required {...register("name")} />

				<TextArea
					label="Description"
					placeholder="Describe your club's mission, skill levels, etc..."
					error={errors.description?.message}
					rows={4}
					optional
					{...register("description")}
				/>

				<div className="p-4 rounded-lg bg-muted/30 border border-border">
					<Controller
						name="isPublic"
						control={control}
						render={({ field }) => (
							<Checkbox
								checked={field.value}
								onChange={field.onChange}
								label="Make this club public"
								helperText="Public clubs are visible to everyone. Private clubs require an invite."
							/>
						)}
					/>
				</div>
			</div>
		</div>
	);
}
