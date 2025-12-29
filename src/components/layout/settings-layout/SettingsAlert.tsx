"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type AlertStatus = "idle" | "success" | "error" | "pending";

interface SettingsAlertProps {
	status: AlertStatus;
	successMessage?: string;
	errorMessage?: string;
	autoHideDuration?: number;
	className?: string;
}

export function SettingsAlert({
	status,
	successMessage = "Settings saved successfully!",
	errorMessage = "Failed to save. Please try again.",
	autoHideDuration = 5000,
	className,
}: SettingsAlertProps) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (status === "success" || status === "error") {
			setVisible(true);

			if (status === "success" && autoHideDuration > 0) {
				const timer = setTimeout(() => setVisible(false), autoHideDuration);
				return () => clearTimeout(timer);
			}
		} else {
			setVisible(false);
		}
	}, [status, autoHideDuration]);

	if (!visible || status === "idle" || status === "pending") {
		return null;
	}

	return (
		<div
			className={cn(
				"rounded-xl border p-4 text-sm mb-4 animate-in fade-in duration-200",
				status === "success" && "bg-green-500/20 border-green-500/30 text-green-400",
				status === "error" && "bg-red-500/20 border-red-500/30 text-red-400",
				className
			)}>
			{status === "success" ? successMessage : errorMessage}
		</div>
	);
}
