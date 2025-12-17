import React from "react";
import { Check } from "lucide-react";

type Step = {
    id: number;
    label: string;
};

type Props = {
    steps: Step[];
    currentStep: number;
};

const StepIndicator = ({ steps, currentStep }: Props) => {
    return (
        <div className="flex items-center justify-between w-full mb-8 relative">
             {/* Progress Bar Background */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2 rounded-full" />
            
             {/* Active Progress Bar */}
            <div 
                className="absolute top-1/2 left-0 h-0.5 bg-accent -z-10 -translate-y-1/2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                    <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                        <div
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2
                                ${isCompleted ? "bg-accent border-accent text-black" : ""}
                                ${isActive ? "bg-background border-accent text-accent scale-110" : ""}
                                ${!isActive && !isCompleted ? "bg-background border-white/20 text-muted" : ""}
                            `}
                        >
                            {isCompleted ? <Check size={12} /> : step.id}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-white" : "text-muted"}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default StepIndicator;
