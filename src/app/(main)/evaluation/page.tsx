"use client";

import { Brain, Dumbbell, Save, Target } from "lucide-react";
import { useMemo, useState } from "react";

// --- Types & Configuration ---

type AttributeCategory = "Physical" | "Technical" | "Mental";

interface Drill {
	id: string;
	name: string;
	description: string;
	// A drill can impact multiple specific skills within categories
	impacts: {
		category: AttributeCategory;
		skill: string; // e.g., 'Vertical Jump', 'Passing', 'Decision Making'
		weight: number; // 0.1 to 1.0 (How much this drill counts towards that skill)
	}[];
}

const DRILLS: Drill[] = [
	{
		id: "d1",
		name: "Box Jumps (Max Height)",
		description: "Max vertical leap measurement.",
		impacts: [{ category: "Physical", skill: "Explosiveness", weight: 1.0 }],
	},
	{
		id: "d2",
		name: "Butterfly Passing Loop",
		description: "Continuous passing movement. Focus on footwork and platform.",
		impacts: [
			{ category: "Technical", skill: "Passing", weight: 0.8 },
			{ category: "Physical", skill: "Agility", weight: 0.2 },
		],
	},
	{
		id: "d3",
		name: "Serve Receive: Pressure",
		description: "Receiving hard floaters while fatigued.",
		impacts: [
			{ category: "Technical", skill: "Receive", weight: 0.7 },
			{ category: "Mental", skill: "Composure", weight: 0.3 },
		],
	},
	{
		id: "d4",
		name: "Scrimmage: Transition Play",
		description: "6v6 Free ball transition. Scoring decision making.",
		impacts: [
			{ category: "Mental", skill: "Game IQ", weight: 0.6 },
			{ category: "Technical", skill: "Hitting", weight: 0.4 },
		],
	},
];

const PLAYERS = [
	{
		id: "1",
		name: "Denys Bielov",
		number: 7,
		position: "Opposite",
		avatar: "/api/placeholder/50/50",
	},
	{
		id: "2",
		name: "Sarah Jenks",
		number: 12,
		position: "Setter",
		avatar: "/api/placeholder/50/51",
	},
	{
		id: "3",
		name: "Mike Spiker",
		number: 4,
		position: "Outside",
		avatar: "/api/placeholder/50/52",
	},
];

export default function EvaluationPage() {
	const [selectedPlayerId, setSelectedPlayerId] = useState("1");

	// State: Scores per drill { 'd1': 8.5, 'd2': 6.0 }
	const [drillScores, setDrillScores] = useState<Record<string, number>>({});

	const handleScore = (drillId: string, score: number) => {
		setDrillScores((prev) => ({ ...prev, [drillId]: score }));
	};

	// --- CALCULATOR ENGINE ---
	// Calculates the aggregate Physical/Technical/Mental scores based on drill inputs
	const stats = useMemo(() => {
		const totals: Record<string, { sum: number; weight: number }> = {
			Physical: { sum: 0, weight: 0 },
			Technical: { sum: 0, weight: 0 },
			Mental: { sum: 0, weight: 0 },
		};

		Object.entries(drillScores).forEach(([drillId, score]) => {
			const drill = DRILLS.find((d) => d.id === drillId);
			if (!drill) return;

			drill.impacts.forEach((impact) => {
				if (!totals[impact.category]) return;
				totals[impact.category].sum += score * impact.weight;
				totals[impact.category].weight += impact.weight;
			});
		});

		// Normalize to 0-10 scale
		return {
			Physical: totals.Physical.weight ? (totals.Physical.sum / totals.Physical.weight).toFixed(1) : "-",
			Technical: totals.Technical.weight ? (totals.Technical.sum / totals.Technical.weight).toFixed(1) : "-",
			Mental: totals.Mental.weight ? (totals.Mental.sum / totals.Mental.weight).toFixed(1) : "-",
		};
	}, [drillScores]);

	return (
		<div className="h-screen bg-background text-white font-sans flex flex-col lg:flex-row overflow-hidden">
			{/* --- 1. ROSTER SIDEBAR --- */}
			<div className="w-full lg:w-72 bg-[#161616] border-b lg:border-r border-white/5 flex flex-col z-20 shrink-0 h-48 lg:h-full">
				<div className="p-4 lg:p-6 border-b border-white/5 bg-[#161616] sticky top-0 z-10">
					<h1 className="font-bold text-white text-lg">Evaluation Day</h1>
					<p className="text-xs text-muted">Select a player to grade</p>
				</div>
				<div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
					{PLAYERS.map((player) => (
						<div
							key={player.id}
							onClick={() => setSelectedPlayerId(player.id)}
							className={`
                flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border
                ${
					selectedPlayerId === player.id
						? "bg-accent/10 border-accent/50 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]"
						: "border-transparent hover:bg-white/5"
				}
              `}>
							<div className="w-10 h-10 rounded-full bg-surface-elevated overflow-hidden flex items-center justify-center shrink-0">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={player.avatar}
									className="w-full h-full object-cover"
									alt=""
									onError={(e) => {
										e.currentTarget.style.display = "none";
										e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center");
										const icon = document.createElement("div");
										icon.innerHTML =
											'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted/50"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
										e.currentTarget.parentElement?.appendChild(icon);
									}}
								/>
							</div>
							<div>
								<div className={`text-sm font-bold ${selectedPlayerId === player.id ? "text-white" : "text-muted"}`}>{player.name}</div>
								<div className="text-xs text-muted/60">
									#{player.number} • {player.position}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* --- 2. MAIN: DRILL LIST --- */}
			<div className="flex-1 flex flex-col bg-background relative overflow-hidden">
				<div className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-background/95 backdrop-blur-sm z-10 shrink-0">
					<h2 className="text-base lg:text-lg font-bold text-white truncate mr-4">Drills & Assessments</h2>
					<button className="btn btn-sm bg-accent text-white border-none gap-2 hover:bg-accent/90 shadow-[0_0_15px_rgba(249,115,22,0.3)] shrink-0">
						<Save size={16} /> <span className="hidden sm:inline">Save Evaluation</span>
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 custom-scrollbar pb-20">
					{/* Drills Loop */}
					{DRILLS.map((drill, index) => (
						<div
							key={drill.id}
							className="bg-[#161616] border border-white/5 rounded-2xl p-4 lg:p-6 shadow-lg transition-all hover:border-white/10">
							{/* Header */}
							<div className="flex justify-between items-start mb-4">
								<div className="flex items-start gap-4">
									<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-muted border border-white/5 shrink-0">
										{index + 1}
									</div>
									<div>
										<h3 className="text-base lg:text-lg font-bold text-white">{drill.name}</h3>
										<p className="text-xs lg:text-sm text-muted mt-1">{drill.description}</p>

										{/* Drill Impact Tags */}
										<div className="flex flex-wrap gap-2 mt-3">
											{drill.impacts.map((impact, i) => (
												<span
													key={i}
													className={`
                             text-[10px] uppercase font-bold px-2 py-1 rounded border flex items-center gap-1.5
                             ${impact.category === "Physical" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : ""}
                             ${impact.category === "Technical" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : ""}
                             ${impact.category === "Mental" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : ""}
                           `}>
													{impact.category === "Physical" && <Dumbbell size={10} />}
													{impact.category === "Technical" && <Target size={10} />}
													{impact.category === "Mental" && <Brain size={10} />}
													{impact.skill}
												</span>
											))}
										</div>
									</div>
								</div>

								{/* Score Display (Big Number) */}
								<div className="text-right ml-2 shrink-0">
									<div className={`text-2xl lg:text-3xl font-black ${getScoreColor(drillScores[drill.id] || 0)}`}>
										{drillScores[drill.id] || 0}
									</div>
									<div className="text-[10px] text-muted uppercase tracking-wider">Score</div>
								</div>
							</div>

							{/* Input Slider */}
							<div className="mt-2 bg-white/5 rounded-xl p-4">
								<input
									type="range"
									min="0"
									max="10"
									step="0.5"
									value={drillScores[drill.id] || 0}
									onChange={(e) => handleScore(drill.id, parseFloat(e.target.value))}
									className="w-full h-3 bg-placeholder rounded-lg appearance-none cursor-pointer accent-accent hover:accent-orange-400"
								/>
								<div className="flex justify-between text-xs text-muted mt-2 font-medium px-1">
									<span>0 (Poor)</span>
									<span>5 (Average)</span>
									<span>10 (Elite)</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* --- 3. RIGHT: LIVE STAT BREAKDOWN --- */}
			<div className="hidden xl:flex w-80 bg-[#1E1E1E] border-l border-white/5 flex-col shadow-2xl z-20 shrink-0">
				<div className="p-6 border-b border-white/5 bg-linear-to-b from-white/5 to-transparent">
					<h2 className="text-xl font-bold text-white mb-1">Live Analysis</h2>
					<p className="text-sm text-muted">Real-time category calculation</p>
				</div>

				<div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
					{/* Physical */}
					<StatCard label="Physical" score={stats.Physical} icon={Dumbbell} color="text-blue-400" bg="bg-blue-500" desc="Agility, Jump, Power" />

					{/* Technical */}
					<StatCard
						label="Technical"
						score={stats.Technical}
						icon={Target}
						color="text-emerald-400"
						bg="bg-emerald-500"
						desc="Pass, Set, Spike, Block"
					/>

					{/* Mental */}
					<StatCard label="Mental" score={stats.Mental} icon={Brain} color="text-purple-400" bg="bg-purple-500" desc="IQ, Composure, Leadership" />

					{/* Total Weighted Score */}
					<div className="mt-8 p-6 rounded-2xl bg-linear-to-br from-gray-800 to-black border border-white/10 text-center shadow-lg">
						<div className="text-xs text-muted uppercase font-bold tracking-widest mb-2">Estimated OVR</div>
						<div className="text-5xl font-black text-white tracking-tighter">
							{/* Simple average for demo */}
							{(
								(Number(stats.Physical === "-" ? 0 : stats.Physical) +
									Number(stats.Technical === "-" ? 0 : stats.Technical) +
									Number(stats.Mental === "-" ? 0 : stats.Mental)) /
								(Object.values(drillScores).length > 0 ? 3 : 1)
							).toFixed(0)}
						</div>
						<div className="mt-2 inline-block px-3 py-1 rounded bg-accent text-white text-xs font-bold">PROSPECT</div>
					</div>
				</div>
			</div>

			{/* Mobile Stat Overlay / Bottom Sheet could go here */}
		</div>
	);
}

// --- SUB COMPONENTS ---

function StatCard({ label, score, icon: Icon, color, bg, desc }: any) {
	const isRated = score !== "-";
	const numScore = Number(score);
	const width = isRated ? `${numScore * 10}%` : "0%";

	return (
		<div>
			<div className="flex items-center gap-2 mb-2">
				<Icon size={18} className={color} />
				<span className="font-bold text-white text-lg">{label}</span>
				<span className={`ml-auto font-mono font-bold text-xl ${isRated ? "text-white" : "text-muted-foreground"}`}>{score}</span>
			</div>

			{/* Progress Bar */}
			<div className="h-2.5 w-full bg-surface-elevated rounded-full overflow-hidden mb-2">
				<div className={`h-full ${bg} transition-all duration-500 ease-out`} style={{ width }} />
			</div>
			<p className="text-xs text-muted">{desc}</p>
		</div>
	);
}

function getScoreColor(score: number) {
	if (score >= 8) return "text-accent"; // Elite
	if (score >= 6) return "text-green-400";
	if (score >= 4) return "text-yellow-500";
	return "text-red-500";
}
