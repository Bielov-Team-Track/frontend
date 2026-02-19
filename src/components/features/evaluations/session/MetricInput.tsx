"use client";

import { Slider } from "@/components/ui";
import type { EvaluationMetric } from "@/lib/models/Evaluation";
import { Minus, Plus } from "lucide-react";

export interface MetricInputProps {
	metric: EvaluationMetric;
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
}

function clamp(val: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, val));
}

export default function MetricInput({ metric, value, onChange, disabled }: MetricInputProps) {
	const type = metric.type as "Checkbox" | "Slider" | "Number" | "Ratio";

	// ---------------------------------------------------------------------------
	// Checkbox
	// ---------------------------------------------------------------------------
	if (type === "Checkbox") {
		const checked = value === 1;
		return (
			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium text-white">{metric.name}</span>
				<button
					type="button"
					disabled={disabled}
					onClick={() => onChange(checked ? 0 : 1)}
					className={[
						"w-full py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all",
						"disabled:opacity-50 disabled:cursor-not-allowed",
						checked
							? "border-success bg-success/15 text-success"
							: "border-border bg-surface text-muted hover:border-border/80 hover:bg-hover",
					].join(" ")}
					aria-pressed={checked}
				>
					{checked ? "Pass" : "Fail"}
				</button>
			</div>
		);
	}

	// ---------------------------------------------------------------------------
	// Slider
	// ---------------------------------------------------------------------------
	if (type === "Slider") {
		return (
			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium text-white">{metric.name}</span>
				<Slider
					value={value}
					min={0}
					max={metric.maxPoints}
					step={1}
					disabled={disabled}
					onValueChange={(val) => onChange(val ?? 0)}
					showValue
					color="primary"
					size="md"
				/>
				<div className="flex justify-between text-xs text-muted">
					<span>0</span>
					<span>{metric.maxPoints} pts</span>
				</div>
			</div>
		);
	}

	// ---------------------------------------------------------------------------
	// Number (stepper)
	// ---------------------------------------------------------------------------
	if (type === "Number") {
		const decrement = () => onChange(clamp(value - 1, 0, metric.maxPoints));
		const increment = () => onChange(clamp(value + 1, 0, metric.maxPoints));

		return (
			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium text-white">{metric.name}</span>
				<div className="flex items-center gap-3">
					<button
						type="button"
						disabled={disabled || value <= 0}
						onClick={decrement}
						className="w-10 h-10 rounded-lg border border-border bg-surface flex items-center justify-center text-white hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
						aria-label="Decrease"
					>
						<Minus size={16} />
					</button>
					<div className="flex-1 flex flex-col items-center">
						<span className="text-2xl font-bold text-white tabular-nums">{value}</span>
						<span className="text-xs text-muted">/ {metric.maxPoints}</span>
					</div>
					<button
						type="button"
						disabled={disabled || value >= metric.maxPoints}
						onClick={increment}
						className="w-10 h-10 rounded-lg border border-border bg-surface flex items-center justify-center text-white hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
						aria-label="Increase"
					>
						<Plus size={16} />
					</button>
				</div>
			</div>
		);
	}

	// ---------------------------------------------------------------------------
	// Ratio (numerator / denominator where denominator = maxPoints)
	// ---------------------------------------------------------------------------
	if (type === "Ratio") {
		const numerator = value;
		const denominator = metric.maxPoints;

		const handleNumeratorChange = (raw: string) => {
			const parsed = parseInt(raw, 10);
			if (isNaN(parsed)) return;
			onChange(clamp(parsed, 0, denominator));
		};

		return (
			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium text-white">{metric.name}</span>
				<div className="flex items-center gap-3">
					<input
						type="number"
						min={0}
						max={denominator}
						value={numerator}
						disabled={disabled}
						onChange={(e) => handleNumeratorChange(e.target.value)}
						className="w-20 h-10 text-center rounded-lg border border-border bg-surface text-white text-lg font-semibold focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Successful attempts"
					/>
					<span className="text-xl text-muted font-medium">out of</span>
					<div className="w-20 h-10 flex items-center justify-center rounded-lg border border-border/50 bg-surface/50">
						<span className="text-lg font-semibold text-muted">{denominator}</span>
					</div>
				</div>
				<p className="text-xs text-muted">{numerator} / {denominator} successful</p>
			</div>
		);
	}

	// Fallback for unknown type
	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm font-medium text-white">{metric.name}</span>
			<span className="text-xs text-muted">Unsupported metric type: {metric.type}</span>
		</div>
	);
}
