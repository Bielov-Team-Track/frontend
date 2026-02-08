"use client";

import Modal from "@/components/ui/modal";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { ContextHeaderInfo, WizardConfig, WizardContext, WizardState, WizardStep } from "./types";
import { WizardContextHeader } from "./WizardContextHeader";
import { WizardNavigation } from "./WizardNavigation";
import { WizardStepIndicator } from "./WizardStepIndicator";
import { WizardSuccessScreen } from "./WizardSuccessScreen";

interface WizardModalProps<TData extends FieldValues> {
	isOpen: boolean;
	onClose: () => void;
	config: WizardConfig<TData>;
	form: UseFormReturn<TData>;
	state: WizardState;
	activeSteps: WizardStep<TData>[];
	currentStepConfig: WizardStep<TData>;
	currentStepIndex: number;
	context: WizardContext;
	contextHeaderInfo?: ContextHeaderInfo;
	isFirstStep: boolean;
	isLastStep: boolean;
	canGoBack: boolean;
	onNext: () => void;
	onBack: () => void;
	onSubmit: () => void;
	onEditContext?: () => void;
}

export function WizardModal<TData extends FieldValues>({
	isOpen,
	onClose,
	config,
	form,
	state,
	activeSteps,
	currentStepConfig,
	currentStepIndex,
	context,
	contextHeaderInfo,
	isFirstStep,
	isLastStep,
	canGoBack,
	onNext,
	onBack,
	onSubmit,
	onEditContext,
}: WizardModalProps<TData>) {
	const StepComponent = currentStepConfig?.component;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="xl" className="max-h-[90vh] overflow-hidden" preventOutsideClose>
			{state.isSuccess && state.createdId ? (
				<WizardSuccessScreen config={config.successConfig} createdId={state.createdId} onClose={onClose} />
			) : (
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="px-6 pt-6 pb-4 border-b border-border">
						<h1 className="text-xl font-bold text-foreground">{config.title}</h1>
						<p className="text-sm text-muted-foreground mt-1">{config.subtitle}</p>
					</div>

					{/* Context Header (if applicable) */}
					{contextHeaderInfo && (
						<div className="px-6 pt-4">
							<WizardContextHeader info={contextHeaderInfo} onEdit={onEditContext} />
						</div>
					)}

					{/* Step Indicator */}
					<div className="px-6 py-4">
						<WizardStepIndicator steps={activeSteps} currentStep={currentStepIndex + 1} />
					</div>

					{/* Step Content */}
					<div className="flex-1 overflow-y-auto px-6 py-4">
						{state.error && (
							<div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{state.error}</div>
						)}

						{StepComponent && <StepComponent form={form as any} context={context} />}
					</div>

					{/* Navigation */}
					<div className="px-6 pb-6">
						<WizardNavigation
							isFirstStep={isFirstStep}
							isLastStep={isLastStep}
							canGoBack={canGoBack}
							isSubmitting={state.isSubmitting}
							onBack={onBack}
							onNext={onNext}
							onSubmit={onSubmit}
						/>
					</div>
				</div>
			)}
		</Modal>
	);
}
