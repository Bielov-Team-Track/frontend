import { FaCheck } from "react-icons/fa";
import { STEP_CONFIG, getActiveSteps } from "../config/stepConfig";
import { useEventFormContext } from "../context/EventFormContext";

export function ProgressIndicator() {
	const { wizard } = useEventFormContext();
	const { currentStep } = wizard;

	const activeSteps = getActiveSteps();

	return (
		<div className="mb-12">
			<div className="flex items-center justify-between relative">
				{/* Connector Line */}
				<div className="absolute left-0 top-1/2 sm:top-1/3 -translate-y-1/2 w-full h-0.5 bg-white/10 -z-10" />

				{activeSteps.map((stepNumber) => {
					const stepConfig = STEP_CONFIG[stepNumber];
					const isActive = stepNumber === currentStep;
					const isCompleted = stepNumber < currentStep;

					return (
						<div
							key={stepConfig.key}
							className="flex flex-col items-center gap-2 bg-background-dark px-1 sm:px-2">
							<div
								className={`
									w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center
									text-xs md:text-sm font-bold border-2 transition-all duration-300
									${
										isActive
											? "border-accent bg-accent text-white scale-110 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
											: isCompleted
											? "border-accent bg-accent text-white"
											: "border-white/20 bg-background-dark text-muted"
									}
								`}>
								{isCompleted ? (
									<FaCheck size={12} />
								) : (
									stepNumber
								)}
							</div>
							<span
								className={`
									text-[10px] md:text-xs font-medium hidden sm:block text-center max-w-[60px] md:max-w-none
									${isActive ? "text-accent" : "text-muted"}
								`}>
								{stepConfig.label}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
