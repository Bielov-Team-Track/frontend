import clsx from "clsx";
import React from "react";
import { Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

export type SectionVariant =
	| "info"
	| "warning"
	| "error"
	| "success"
	| "neutral";

interface SectionProps {
	variant?: SectionVariant;
	title?: string;
	description?: string;
	icon?: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
	actions?: React.ReactNode;
	showIcon?: boolean;
}

const Section: React.FC<SectionProps> = ({
	variant = "neutral",
	title,
	description,
	icon,
	children,
	className = "",
	actions,
	showIcon = true,
}) => {
	const getVariantClasses = () => {
		switch (variant) {
			case "info":
				return "border-info";
			case "warning":
				return "border-warning";
			case "error":
				return "border-error";
			case "success":
				return "border-success";
			default:
				return "bg-base-200 border border-base-300";
		}
	};

	const getDefaultIcon = () => {
		switch (variant) {
			case "info":
				return <Info className="text-info" />;
			case "warning":
				return <AlertTriangle className="text-warning" />;
			case "error":
				return <XCircle className="text-error" />;
			case "success":
				return <CheckCircle className="text-success" />;
		}
	};

	const displayIcon = icon || (showIcon ? getDefaultIcon() : null);

	const baseClasses = "p-4 pl-8 border-l-4 rounded-lg flex items-center gap-8";

	return (
		<div className={clsx(getVariantClasses(), baseClasses, className)}>
			<div className="flex-1">
				<div className="flex items-center gap-3 mb-1">
					{displayIcon && (
						<div className="flex-shrink-0 text-xl">{displayIcon}</div>
					)}
					{title && <h3 className="font-semibold text-xl mb-1">{title}</h3>}
				</div>

				{description && (
					<p className="text-sm opacity-70 mb-2">{description}</p>
				)}

				{children && <div className="mt-2">{children}</div>}
			</div>

			{actions && <div className="flex-shrink-0">{actions}</div>}
		</div>
	);
};

export default Section;
