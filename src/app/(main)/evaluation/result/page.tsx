"use client";

import { Activity, Calendar, Download, Share2, TrendingUp } from "lucide-react";

const REPORT = {
	date: "12 Oct 2025",
	eventName: "Season Opener Evaluation",
	overallScore: 84, // Out of 100
	rank: "A", // S, A, B, C, D
	stats: {
		serve: 8,
		receive: 6,
		set: 4,
		spike: 9,
		block: 7,
		speed: 8,
	},
	coachName: "Coach David",
	notes: "Denys showed incredible offensive power today. Spiking reach has improved by 2cm since last month. Focus needs to shift to defensive positioning and receive consistency.",
};

export default function PlayerReportCard() {
	return (
		<div className="min-h-screen bg-background text-white font-sans p-4 md:p-8 flex justify-center pb-20">
			{/* --- THE CARD CONTAINER --- */}
			<div className="w-full max-w-4xl bg-background border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
				{/* Background Effects */}
				<div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
				<div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

				{/* Header */}
				<div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Performance Report</h1>
						<div className="flex items-center gap-3 text-sm text-muted">
							<span className="flex items-center gap-1">
								<Calendar size={14} /> {REPORT.date}
							</span>
							<span className="w-1 h-1 bg-muted rounded-full"></span>
							<span>{REPORT.eventName}</span>
						</div>
					</div>
					<div className="flex gap-2 self-start md:self-auto">
						<button className="btn btn-sm btn-ghost hover:bg-white/5 text-muted hover:text-white">
							<Download size={18} />
						</button>
						<button className="btn btn-sm btn-ghost hover:bg-white/5 text-muted hover:text-white">
							<Share2 size={18} />
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-0">
					{/* --- LEFT COL: THE RADAR & OVERALL (5 cols) --- */}
					<div className="md:col-span-5 p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center justify-center bg-[#161616]">
						{/* Overall Rating Badge */}
						<div className="relative mb-8 text-center">
							<div className="w-32 h-32 rounded-full border-4 border-[#2A2A2A] bg-background flex items-center justify-center relative shadow-[0_0_30px_rgba(249,115,22,0.2)]">
								<div>
									<div className="text-5xl font-black text-white tracking-tighter">{REPORT.overallScore}</div>
									<div className="text-[10px] text-muted uppercase font-bold mt-1 tracking-widest">OVR</div>
								</div>
							</div>
							<div className="absolute -top-2 -right-2 w-10 h-10 bg-accent text-white font-bold text-lg flex items-center justify-center rounded-lg border-4 border-[#161616] shadow-lg">
								{REPORT.rank}
							</div>
						</div>

						{/* CSS-only Radar Chart (Simplified for Demo) */}
						<div className="relative w-64 h-64">
							{/* The Chart Background (Hexagon Lines) */}
							<svg viewBox="0 0 100 100" className="w-full h-full text-gray-700 overflow-visible">
								{/* Levels */}
								<polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
								<polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />

								{/* The Data Polygon (Dynamic) */}
								{/* Note: In a real app, calculate these points based on REPORT.stats */}
								<polygon
									points="50,10 90,30 85,70 50,90 20,72.5 10,40"
									fill="hsl(var(--accent) / 0.2)"
									stroke="hsl(var(--accent))"
									strokeWidth="2"
								/>

								{/* Labels */}
								<text x="50" y="-2" textAnchor="middle" fill="#aaa" fontSize="6">
									SPIKE
								</text>
								<text x="98" y="25" textAnchor="start" fill="#aaa" fontSize="6">
									BLOCK
								</text>
								<text x="98" y="80" textAnchor="start" fill="#aaa" fontSize="6">
									SERVE
								</text>
								<text x="50" y="105" textAnchor="middle" fill="#aaa" fontSize="6">
									REC
								</text>
								<text x="2" y="80" textAnchor="end" fill="#aaa" fontSize="6">
									SPEED
								</text>
								<text x="2" y="25" textAnchor="end" fill="#aaa" fontSize="6">
									SET
								</text>
							</svg>
						</div>
					</div>

					{/* --- RIGHT COL: DETAILED BREAKDOWN (7 cols) --- */}
					<div className="md:col-span-7 p-8">
						{/* Stats Grid */}
						<h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
							<Activity size={16} className="text-accent" /> Detailed Metrics
						</h3>

						<div className="space-y-4 mb-8">
							{Object.entries(REPORT.stats).map(([key, value]) => (
								<div key={key} className="group">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-muted capitalize font-medium">{key}</span>
										<span className="text-white font-bold">{value}/10</span>
									</div>
									<div className="h-2 bg-track rounded-full overflow-hidden">
										<div
											className="h-full bg-linear-to-r from-accent/80 to-accent transition-all duration-1000 ease-out"
											style={{
												width: `${value * 10}%`,
											}}></div>
									</div>
								</div>
							))}
						</div>

						{/* Coach Feedback Box */}
						<div className="bg-white/5 rounded-xl p-5 border border-white/5">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-8 h-8 rounded-full bg-surface-elevated border border-white/10"></div>
								<div>
									<div className="text-sm font-bold text-white">{REPORT.coachName}</div>
									<div className="text-xs text-muted">Head Coach</div>
								</div>
							</div>
							<div className="relative">
								<span className="absolute -top-2 -left-1 text-4xl text-white/10 font-serif">“</span>
								<p className="text-muted text-sm leading-relaxed relative z-10 italic">{REPORT.notes}</p>
							</div>
						</div>

						{/* Footer Action */}
						<div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="text-xs text-muted text-center sm:text-left">Stats automatically updated on profile.</div>
							<button className="flex items-center gap-2 text-sm text-accent font-bold hover:underline">
								View History <TrendingUp size={16} />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
