"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

interface WizardNavigationProps {
	isFirstStep: boolean;
	isLastStep: boolean;
	canGoBack: boolean;
	isSubmitting: boolean;
	onBack: () => void;
	onNext: () => void;
	onSubmit: () => void;
	submitLabel?: string;
}

export function WizardNavigation({
	isFirstStep,
	isLastStep,
	canGoBack,
	isSubmitting,
	onBack,
	onNext,
	onSubmit,
	submitLabel = "Create",
}: WizardNavigationProps) {
	return (
		<div className="flex items-center justify-between pt-6 border-t border-border">
			<Button
				type="button"
				variant="ghost"
				onClick={onBack}
				disabled={!canGoBack || isSubmitting}
				className="text-muted-foreground hover:text-foreground">
				<ArrowLeft size={16} className="mr-2" />
				Back
			</Button>

			{isLastStep ? (
				<Button type="button" onClick={onSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
					{isSubmitting ? (
						<>
							<Loader2 size={16} className="mr-2 animate-spin" />
							Creating...
						</>
					) : (
						<>
							<Check size={16} className="mr-2" />
							{submitLabel}
						</>
					)}
				</Button>
			) : (
				<Button type="button" onClick={onNext} disabled={isSubmitting}>
					Next
					<ArrowRight size={16} className="ml-2" />
				</Button>
			)}
		</div>
	);
}
