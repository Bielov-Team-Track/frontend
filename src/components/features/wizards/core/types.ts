import { FieldValues, UseFormReturn } from "react-hook-form";
import type { ObjectSchema } from "yup";

// Wizard context passed to determine conditional steps and behavior
export interface WizardContext {
	clubId?: string;
	teamId?: string;
	groupId?: string;
	source: "events" | "club" | "team" | "group" | "dashboard" | "search";
}

// Configuration for success screen after wizard completion
export interface WizardSuccessConfig {
	title: string;
	message: string;
	linkText: string;
	getLinkHref: (id: string) => string;
}

// Individual step configuration
export interface WizardStep<TData extends FieldValues> {
	id: string;
	label: string;
	component: React.ComponentType<WizardStepProps<TData>>;
	fields?: string[]; // Fields to validate for this step
	isConditional?: (context: WizardContext, hasClubs: boolean) => boolean;
}

// Props passed to each step component
export interface WizardStepProps<TData extends FieldValues> {
	form: UseFormReturn<TData>;
	context: WizardContext;
}

// Full wizard configuration
export interface WizardConfig<TData extends FieldValues> {
	id: string;
	title: string;
	subtitle: string;
	steps: WizardStep<TData>[];
	defaultValues: TData;
	validationSchema: ObjectSchema<TData>;
	onSubmit: (data: TData, context: WizardContext) => Promise<void>;
	successConfig: WizardSuccessConfig;
}

// Wizard state
export interface WizardState {
	currentStep: number;
	isSubmitting: boolean;
	isSuccess: boolean;
	createdId: string | null;
	error: string | null;
}

// Context header display info
export interface ContextHeaderInfo {
	clubName?: string;
	teamName?: string;
	groupName?: string;
	isEditable: boolean;
}
