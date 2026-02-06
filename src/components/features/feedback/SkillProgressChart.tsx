"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";

/**
 * Skill data point matching backend SkillDataPointDto
 */
export interface SkillDataPoint {
	date: Date;
	score: number;
	eventName?: string;
}

/**
 * Skill trend data matching backend SkillTrendDto
 */
export interface SkillTrend {
	skill: string;
	dataPoints: SkillDataPoint[];
	currentLevel?: number;
	previousLevel?: number;
	change?: number;
}

interface SkillProgressChartProps {
	trends: SkillTrend[];
	className?: string;
}

/**
 * Line chart displaying skill progress over time
 *
 * NOTE: Requires recharts package to be installed:
 * npm install recharts
 *
 * @example
 * ```tsx
 * const trends: SkillTrend[] = [
 *   {
 *     skill: "Serving",
 *     dataPoints: [
 *       { date: new Date("2024-01-01"), score: 65 },
 *       { date: new Date("2024-01-08"), score: 70 },
 *       { date: new Date("2024-01-15"), score: 75 }
 *     ],
 *     currentLevel: 75,
 *     previousLevel: 65,
 *     change: 10
 *   }
 * ];
 *
 * <SkillProgressChart trends={trends} />
 * ```
 */
export function SkillProgressChart({ trends, className }: SkillProgressChartProps) {
	// Transform data for recharts format
	// Get all unique dates across all trends
	const allDates = [...new Set(trends.flatMap(t => t.dataPoints.map(dp => dp.date.toISOString().split('T')[0])))].sort();

	const chartData = allDates.map((date) => {
		const dataPoint: Record<string, string | number> = { date };
		trends.forEach((trend) => {
			const point = trend.dataPoints.find(dp => dp.date.toISOString().split('T')[0] === date);
			dataPoint[trend.skill] = point?.score ?? 0;
		});
		return dataPoint;
	});

	// Skill colors for line differentiation
	const skillColors = [
		"#3b82f6", // blue
		"#10b981", // green
		"#f59e0b", // amber
		"#ef4444", // red
		"#8b5cf6", // purple
		"#ec4899", // pink
	];

	return (
		<div className={cn("w-full", className)}>
			{/* Chart Container */}
			<div className="bg-card border border-border rounded-xl p-6">
				<h3 className="text-lg font-semibold text-foreground mb-4">Skill Progress</h3>

				{/* Placeholder - Replace with Recharts when installed */}
				<div className="h-64 flex items-center justify-center bg-surface rounded-lg border border-dashed border-border">
					<div className="text-center space-y-2">
						<TrendingUp className="w-12 h-12 text-muted-foreground mx-auto" />
						<p className="text-sm text-muted-foreground">
							Recharts not installed. Install with:
						</p>
						<code className="text-xs text-accent bg-surface px-3 py-1 rounded">
							npm install recharts
						</code>
					</div>
				</div>

				{/* Uncomment when recharts is installed:
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis
							dataKey="date"
							stroke="#9ca3af"
							tick={{ fill: '#9ca3af' }}
							tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
						/>
						<YAxis
							stroke="#9ca3af"
							tick={{ fill: '#9ca3af' }}
							domain={[0, 100]}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: '#1f2937',
								border: '1px solid #374151',
								borderRadius: '8px',
							}}
							labelStyle={{ color: '#f9fafb' }}
						/>
						<Legend
							wrapperStyle={{ paddingTop: '20px' }}
						/>
						{trends.map((trend, index) => (
							<Line
								key={trend.skill}
								type="monotone"
								dataKey={trend.skill}
								stroke={skillColors[index % skillColors.length]}
								strokeWidth={2}
								dot={{ fill: skillColors[index % skillColors.length], r: 4 }}
								activeDot={{ r: 6 }}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
				*/}

				{/* Legend */}
				<div className="flex flex-wrap gap-4 mt-4">
					{trends.map((trend, index) => (
						<div key={trend.skill} className="flex items-center gap-2">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: skillColors[index % skillColors.length] }}
							/>
							<span className="text-sm text-muted">{trend.skill}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

interface SkillChangeIndicatorProps {
	skillName: string;
	currentScore: number;
	previousScore?: number;
	className?: string;
}

/**
 * Displays current skill score with change indicator
 *
 * @example
 * ```tsx
 * <SkillChangeIndicator
 *   skillName="Serving"
 *   currentScore={75}
 *   previousScore={70}
 * />
 * // Shows: "Serving 75 ↑ +5"
 * ```
 */
export function SkillChangeIndicator({
	skillName,
	currentScore,
	previousScore,
	className,
}: SkillChangeIndicatorProps) {
	const change = previousScore !== undefined ? currentScore - previousScore : 0;
	const hasChange = previousScore !== undefined && change !== 0;

	const changeColor =
		change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-muted";

	const ChangeIcon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : null;

	return (
		<div
			className={cn(
				"flex items-center gap-3 px-4 py-3 rounded-lg",
				"bg-surface border border-border",
				className
			)}
		>
			{/* Skill Name */}
			<span className="text-sm font-medium text-white flex-1">{skillName}</span>

			{/* Current Score */}
			<span className="text-2xl font-bold text-white tabular-nums">{currentScore}</span>

			{/* Change Indicator */}
			{hasChange && (
				<div className={cn("flex items-center gap-1 text-sm font-medium", changeColor)}>
					{ChangeIcon && <ChangeIcon size={16} />}
					<span className="tabular-nums">
						{change > 0 ? "+" : ""}
						{change}
					</span>
				</div>
			)}
		</div>
	);
}

export default SkillProgressChart;
