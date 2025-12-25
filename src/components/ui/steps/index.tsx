"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export interface Step {
	id: number | string;
	title: string;
}

export interface StepsProps {
	steps: Step[];
	currentStep: number;
	className?: string;
	vertical?: boolean;
	size?: "xs" | "sm" | "md" | "lg";
	onStepClick?: (stepIndex: number) => void;
}

const Steps: React.FC<StepsProps> = ({
	steps,
	currentStep,
	className,
	vertical = false,
	size = "md",
	onStepClick,
}) => {
	const [previousStep, setPreviousStep] = useState(currentStep);
	const [isAnimating, setIsAnimating] = useState(false);
	const [animatingSteps, setAnimatingSteps] = useState<Set<number>>(new Set());
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (currentStep !== previousStep) {
			const isForward = currentStep > previousStep;
			setIsAnimating(true);

			// Determine which steps need animation
			const stepsToAnimate = new Set<number>();
			if (isForward) {
				// Forward: animate steps from previousStep+1 to currentStep
				for (let i = previousStep + 1; i <= currentStep; i++) {
					stepsToAnimate.add(i);
				}
			} else {
				// Backward: animate steps from previousStep down to currentStep+1
				for (let i = previousStep; i > currentStep; i--) {
					stepsToAnimate.add(i);
				}
			}
			setAnimatingSteps(stepsToAnimate);

			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Animation duration: line (300ms) + step (200ms) + buffer
			timeoutRef.current = setTimeout(() => {
				setIsAnimating(false);
				setAnimatingSteps(new Set());
				setPreviousStep(currentStep);
			}, 550);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [currentStep, previousStep]);

	const isForward = currentStep > previousStep;

	const sizeClass = {
		xs: "steps-xs",
		sm: "steps-sm",
		md: "",
		lg: "steps-lg",
	}[size];

	return (
		<ul
			className={cn(
				"steps steps-animated w-full",
				vertical && "steps-vertical",
				sizeClass,
				className
			)}
		>
			{steps.map((step, index) => {
				const stepNumber = index + 1;
				const isCompleted = stepNumber <= currentStep;
				const isCurrent = stepNumber === currentStep;
				const isStepAnimating = animatingSteps.has(stepNumber);

				// Determine animation class
				let animationClass = "";
				if (isAnimating && isStepAnimating) {
					if (isForward) {
						animationClass = "step-animate-forward";
					} else {
						animationClass = "step-animate-backward";
					}
				}

				return (
					<li
						key={step.id}
						className={cn(
							"step",
							isCompleted && "step-primary",
							animationClass
						)}
						onClick={() => onStepClick?.(stepNumber)}
						style={{ cursor: onStepClick ? "pointer" : "default" }}
					>
						<span
							className={cn(
								"transition-all duration-300",
								isCurrent ? "font-semibold" : "text-muted"
							)}
						>
							{step.title}
						</span>
					</li>
				);
			})}
		</ul>
	);
};

Steps.displayName = "Steps";

export default Steps;
