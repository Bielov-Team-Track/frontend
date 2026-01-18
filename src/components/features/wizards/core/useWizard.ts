"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useMemo, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { WizardConfig, WizardContext, WizardState, WizardStep } from "./types";

interface UseWizardOptions<TData> {
	config: WizardConfig<TData>;
	context: WizardContext;
	hasClubs: boolean;
	onClose: () => void;
}

interface UseWizardReturn<TData> {
	form: UseFormReturn<TData>;
	state: WizardState;
	activeSteps: WizardStep<TData>[];
	currentStepConfig: WizardStep<TData>;
	currentStepIndex: number;
	totalSteps: number;
	isFirstStep: boolean;
	isLastStep: boolean;
	canGoBack: boolean;
	nextStep: () => Promise<void>;
	prevStep: () => void;
	goToStep: (step: number) => void;
	submit: () => Promise<void>;
	reset: () => void;
}

export function useWizard<TData extends Record<string, any>>({ config, context, hasClubs, onClose }: UseWizardOptions<TData>): UseWizardReturn<TData> {
	const [state, setState] = useState<WizardState>({
		currentStep: 0,
		isSubmitting: false,
		isSuccess: false,
		createdId: null,
		error: null,
	});

	const form = useForm<TData>({
		resolver: yupResolver(config.validationSchema),
		defaultValues: config.defaultValues as any,
		mode: "onChange",
	});

	// Filter steps based on conditions
	const activeSteps = useMemo(() => {
		return config.steps.filter((step) => {
			if (!step.isConditional) return true;
			return step.isConditional(context, hasClubs);
		});
	}, [config.steps, context, hasClubs]);

	const totalSteps = activeSteps.length;
	const currentStepConfig = activeSteps[state.currentStep];
	const isFirstStep = state.currentStep === 0;
	const isLastStep = state.currentStep === totalSteps - 1;

	// Can go back unless on first step or in success state
	const canGoBack = !isFirstStep && !state.isSuccess;

	const nextStep = useCallback(async () => {
		const currentFields = currentStepConfig.fields || [];

		// Validate current step fields
		const isValid = currentFields.length > 0 ? await form.trigger(currentFields as any) : true;

		if (isValid && state.currentStep < totalSteps - 1) {
			setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
		}
	}, [form, currentStepConfig, state.currentStep, totalSteps]);

	const prevStep = useCallback(() => {
		if (state.currentStep > 0) {
			setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
		}
	}, [state.currentStep]);

	const goToStep = useCallback(
		(step: number) => {
			if (step >= 0 && step < totalSteps) {
				setState((prev) => ({ ...prev, currentStep: step }));
			}
		},
		[totalSteps]
	);

	const submit = useCallback(async () => {
		const isValid = await form.trigger();
		if (!isValid) return;

		setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

		try {
			const data = form.getValues();
			const result = await config.onSubmit(data, context);
			setState((prev) => ({
				...prev,
				isSubmitting: false,
				isSuccess: true,
				createdId: result.id,
			}));
		} catch (error: any) {
			setState((prev) => ({
				...prev,
				isSubmitting: false,
				error: error?.message || "Something went wrong",
			}));
		}
	}, [form, config, context]);

	const reset = useCallback(() => {
		form.reset(config.defaultValues as any);
		setState({
			currentStep: 0,
			isSubmitting: false,
			isSuccess: false,
			createdId: null,
			error: null,
		});
	}, [form, config.defaultValues]);

	return {
		form,
		state,
		activeSteps,
		currentStepConfig,
		currentStepIndex: state.currentStep,
		totalSteps,
		isFirstStep,
		isLastStep,
		canGoBack,
		nextStep,
		prevStep,
		goToStep,
		submit,
		reset,
	};
}
