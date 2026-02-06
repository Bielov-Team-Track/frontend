"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface Step {
	id: number | string;
	label: string;
	icon?: React.ReactNode;
}

export interface StepsProps extends VariantProps<typeof stepCircleVariants> {
	steps: Step[];
	currentStep: number;
	className?: string;
	orientation?: "horizontal" | "vertical";
	onStepClick?: (stepIndex: number) => void;
	/** Step numbers (1-indexed) that have validation errors */
	errorSteps?: number[];
}

const stepCircleVariants = cva("flex items-center justify-center rounded-full transition-all duration-300 shrink-0", {
	variants: {
		size: {
			sm: "size-6 text-xs",
			md: "size-8 text-sm",
			lg: "size-10 text-base",
		},
		state: {
			completed: "bg-primary text-primary-foreground",
			current: "bg-primary text-primary-foreground",
			future: "bg-surface-elevated text-muted-foreground",
		},
	},
	defaultVariants: {
		size: "md",
		state: "future",
	},
});

const stepLabelVariants = cva("transition-all duration-300", {
	variants: {
		size: {
			sm: "text-xs",
			md: "text-sm",
			lg: "text-base",
		},
		state: {
			completed: "font-semibold text-foreground",
			current: "font-semibold text-foreground",
			future: "font-normal text-muted-foreground",
		},
	},
	compoundVariants: [
		{ size: "sm", state: "current", className: "text-sm" },
		{ size: "md", state: "current", className: "text-base" },
		{ size: "lg", state: "current", className: "text-lg" },
	],
	defaultVariants: {
		size: "md",
		state: "future",
	},
});

const connectorHeightMap = {
	sm: "h-0.5",
	md: "h-0.5",
	lg: "h-[3px]",
} as const;

const connectorWidthMap = {
	sm: "w-0.5",
	md: "w-0.5",
	lg: "w-[3px]",
} as const;

const iconSizeMap = {
	sm: "size-3.5",
	md: "size-4",
	lg: "size-5",
} as const;

const Steps: React.FC<StepsProps> = ({ steps, currentStep, className, orientation = "horizontal", size = "md", onStepClick, errorSteps = [] }) => {
	const errorStepSet = new Set(errorSteps);
	const [previousStep, setPreviousStep] = useState(currentStep);
	const [isAnimating, setIsAnimating] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (currentStep !== previousStep) {
			setIsAnimating(true);

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				setIsAnimating(false);
				setPreviousStep(currentStep);
			}, 300);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [currentStep, previousStep]);

	const isForward = currentStep > previousStep;

	const getStepState = (stepNumber: number): "completed" | "current" | "future" => {
		if (stepNumber < currentStep) return "completed";
		if (stepNumber === currentStep) return "current";
		return "future";
	};

	const getConnectorFillScale = (connectorIndex: number): number => {
		const stepAfterConnector = connectorIndex + 2;

		if (isAnimating) {
			if (isForward) {
				if (stepAfterConnector <= previousStep) return 1;
				if (stepAfterConnector <= currentStep) return 1;
				return 0;
			} else {
				if (stepAfterConnector <= currentStep) return 1;
				if (stepAfterConnector <= previousStep) return 0;
				return 0;
			}
		}

		return stepAfterConnector <= currentStep ? 1 : 0;
	};

	const renderStepContent = (step: Step, stepNumber: number, state: "completed" | "current" | "future") => {
		const iconClass = iconSizeMap[size || "md"];

		if (state === "completed") {
			return <Check className={iconClass} strokeWidth={3} />;
		}

		if (step.icon) {
			return <span className={iconClass}>{step.icon}</span>;
		}

		return stepNumber;
	};

	const isHorizontal = orientation === "horizontal";
	const sizeKey = size || "md";

	if (isHorizontal) {
		return (
			<div className={cn("flex flex-col w-full", className)}>
				{/* Circles and connectors row */}
				<div className="flex items-center w-full">
					{steps.map((step, index) => {
						const stepNumber = index + 1;
						const state = getStepState(stepNumber);
						const isLast = index === steps.length - 1;

						const hasError = errorStepSet.has(stepNumber);

						return (
							<React.Fragment key={step.id}>
								{/* Circle */}
								<div className="relative">
									<div
										className={cn(
											stepCircleVariants({ size, state }),
											onStepClick && "cursor-pointer",
											hasError && "ring-2 ring-error ring-offset-1 ring-offset-surface",
										)}
										onClick={() => onStepClick?.(stepNumber)}>
										{renderStepContent(step, stepNumber, state)}
									</div>
									{hasError && (
										<span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-error border border-surface" />
									)}
								</div>

								{/* Connector */}
								{!isLast && (
									<div className={cn("flex-1 mx-2 relative bg-surface-elevated", connectorHeightMap[sizeKey])}>
										<div
											className={cn("absolute inset-0 bg-primary transition-transform duration-300 ease-out origin-left")}
											style={{
												transform: `scaleX(${getConnectorFillScale(index)})`,
											}}
										/>
									</div>
								)}
							</React.Fragment>
						);
					})}
				</div>

				{/* Labels row */}
				<div className="flex w-full mt-2">
					{steps.map((step, index) => {
						const stepNumber = index + 1;
						const state = getStepState(stepNumber);
						const isLast = index === steps.length - 1;
						const hasError = errorStepSet.has(stepNumber);

						return (
							<React.Fragment key={`label-${step.id}`}>
								{/* Label container - same width as circle */}
								<div
									className={cn("hidden sm:flex justify-center", onStepClick && "cursor-pointer", currentStep === stepNumber && "flex")}
									style={{
										width: sizeKey === "sm" ? "24px" : sizeKey === "lg" ? "40px" : "32px",
									}}
									onClick={() => onStepClick?.(stepNumber)}>
									<span className={cn(stepLabelVariants({ size, state }), "text-center whitespace-nowrap", hasError && "text-error")}>{step.label}</span>
								</div>

								{/* Spacer matching connector */}
								{!isLast && <div className="flex-1 mx-2" />}
							</React.Fragment>
						);
					})}
				</div>
			</div>
		);
	}

	// Vertical layout
	return (
		<div className={cn("flex flex-col", className)}>
			{steps.map((step, index) => {
				const stepNumber = index + 1;
				const state = getStepState(stepNumber);
				const isLast = index === steps.length - 1;
				const hasError = errorStepSet.has(stepNumber);

				return (
					<React.Fragment key={step.id}>
						{/* Step row */}
						<div className={cn("flex items-center gap-3", onStepClick && "cursor-pointer")} onClick={() => onStepClick?.(stepNumber)}>
							{/* Circle */}
							<div className="relative">
								<div
									className={cn(
										stepCircleVariants({ size, state }),
										hasError && "ring-2 ring-error ring-offset-1 ring-offset-surface",
									)}>
									{renderStepContent(step, stepNumber, state)}
								</div>
								{hasError && (
									<span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-error border border-surface" />
								)}
							</div>

							{/* Label */}
							<span className={cn(stepLabelVariants({ size, state }), hasError && "text-error")}>{step.label}</span>
						</div>

						{/* Connector */}
						{!isLast && (
							<div
								className="flex justify-center"
								style={{
									width: sizeKey === "sm" ? "24px" : sizeKey === "lg" ? "40px" : "32px",
								}}>
								<div className={cn("my-2 relative bg-surface-elevated min-h-6", connectorWidthMap[sizeKey])}>
									<div
										className={cn("absolute inset-0 bg-primary transition-transform duration-300 ease-out origin-top")}
										style={{
											transform: `scaleY(${getConnectorFillScale(index)})`,
										}}
									/>
								</div>
							</div>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
};

Steps.displayName = "Steps";

export default Steps;
