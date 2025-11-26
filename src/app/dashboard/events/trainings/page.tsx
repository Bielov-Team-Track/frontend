"use client";

import {
	Calendar,
	Clock,
	Dumbbell,
	Filter,
	GripVertical,
	MapPin,
	MoreHorizontal,
	Play,
	Plus,
	Trash2,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";

// --- Types ---
interface Drill {
	id: string;
	name: string;
	duration: number; // minutes
	category: string;
	intensity: "Low" | "Medium" | "High";
	tags: string[];
}

interface TimelineItem extends Drill {
	instanceId: string; // unique ID for the timeline
}

// --- Mock Data ---
const EVENT_DETAILS = {
	title: "Tuesday Night Elite Training",
	date: "Oct 14, 2025",
	time: "19:00 - 20:30",
	totalDuration: 90, // minutes
	location: "Sport Central, Hall A",
	participants: [
		{ id: 1, img: "/api/placeholder/30/30" },
		{ id: 2, img: "/api/placeholder/30/31" },
		{ id: 3, img: "/api/placeholder/30/32" },
		{ id: 4, img: "/api/placeholder/30/33" },
	],
	participantCount: 12,
};

const SKILLS = [
	"Serving",
	"Passing",
	"Setting",
	"Attacking",
	"Blocking",
	"Defense",
	"Conditioning",
];

const DRILL_LIBRARY: Drill[] = [
	{
		id: "d1",
		name: "Butterfly Passing",
		duration: 15,
		category: "Warmup",
		intensity: "Low",
		tags: ["Passing", "Conditioning"],
	},
	{
		id: "d2",
		name: "Box Hitting",
		duration: 20,
		category: "Technical",
		intensity: "Medium",
		tags: ["Attacking"],
	},
	{
		id: "d3",
		name: "King of the Court",
		duration: 30,
		category: "Game",
		intensity: "High",
		tags: ["Attacking", "Defense"],
	},
	{
		id: "d4",
		name: "Serving Under Pressure",
		duration: 10,
		category: "Technical",
		intensity: "Medium",
		tags: ["Serving", "Mental"],
	},
	{
		id: "d5",
		name: "3-Man Weave",
		duration: 15,
		category: "Warmup",
		intensity: "Medium",
		tags: ["Passing", "Conditioning"],
	},
	{
		id: "d6",
		name: "Block Transition",
		duration: 20,
		category: "Technical",
		intensity: "High",
		tags: ["Blocking", "Defense"],
	},
];

export default function TrainingSessionPage() {
	// State
	const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
	const [timeline, setTimeline] = useState<TimelineItem[]>([]);

	// Computed
	const plannedDuration = timeline.reduce(
		(acc, item) => acc + item.duration,
		0
	);
	const remainingTime = EVENT_DETAILS.totalDuration - plannedDuration;
	const progressPercent = Math.min(
		(plannedDuration / EVENT_DETAILS.totalDuration) * 100,
		100
	);

	// Filter Drills based on selected Skills
	const recommendedDrills = useMemo(() => {
		if (selectedSkills.length === 0) return DRILL_LIBRARY;
		return DRILL_LIBRARY.filter((drill) =>
			drill.tags.some((tag) => selectedSkills.includes(tag))
		);
	}, [selectedSkills]);

	// Handlers
	const toggleSkill = (skill: string) => {
		setSelectedSkills((prev) =>
			prev.includes(skill)
				? prev.filter((s) => s !== skill)
				: [...prev, skill]
		);
	};

	const addToTimeline = (drill: Drill) => {
		const newItem = {
			...drill,
			instanceId: Math.random().toString(36).substr(2, 9),
		};
		setTimeline((prev) => [...prev, newItem]);
	};

	const removeFromTimeline = (instanceId: string) => {
		setTimeline((prev) =>
			prev.filter((item) => item.instanceId !== instanceId)
		);
	};

	return (
		<div className="min-h-screen bg-base-100 text-gray-100 font-sans pb-20">
			{/* --- SHARED HEADER COMPONENT (The Shell) --- */}
			<div className="bg-[#1A1A1A] border-b border-white/5 pt-8 pb-6 px-4 md:px-8">
				<div className="max-w-desktop mx-auto">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20 text-xs font-bold uppercase">
									Training
								</span>
								<span className="text-gray-500 text-sm font-medium flex items-center gap-1">
									<Clock size={14} />{" "}
									{EVENT_DETAILS.totalDuration} mins
								</span>
							</div>
							<h1 className="text-3xl font-bold text-white mb-2">
								{EVENT_DETAILS.title}
							</h1>

							<div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
								<span className="flex items-center gap-1">
									<Calendar size={14} /> {EVENT_DETAILS.date}
								</span>
								<span className="flex items-center gap-1">
									<MapPin size={14} />{" "}
									{EVENT_DETAILS.location}
								</span>

								{/* Participants Preview */}
								<div className="flex items-center gap-2 pl-4 border-l border-white/10">
									<div className="flex -space-x-2">
										{EVENT_DETAILS.participants.map((p) => (
											<img
												key={p.id}
												src={p.img}
												className="w-6 h-6 rounded-full border border-[#1A1A1A] bg-gray-700"
												alt=""
											/>
										))}
									</div>
									<span className="text-xs">
										+{EVENT_DETAILS.participantCount - 4}{" "}
										going
									</span>
								</div>
							</div>
						</div>

						{/* Header Actions */}
						<div className="flex gap-3 w-full md:w-auto">
							<button className="flex-1 md:flex-none btn bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2">
								<Users size={18} /> Invite
							</button>
							<button className="flex-1 md:flex-none btn bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2">
								<MoreHorizontal size={18} />
							</button>
							<button className="flex-1 md:flex-none btn bg-accent hover:bg-accent/90 text-white border-none shadow-[0_0_15px_rgba(249,115,22,0.3)] gap-2 px-6">
								<Play size={18} fill="currentColor" /> Start
								Session
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* --- SPECIFIC TRAINING MODULE --- */}
			<div className="max-w-desktop mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* LEFT COLUMN: DRILL FINDER (4 Cols) */}
				<div className="lg:col-span-4 space-y-6">
					{/* 1. Skill Selector */}
					<div className="bg-[#1E1E1E] rounded-2xl border border-white/5 p-5">
						<h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
							<Filter size={16} className="text-accent" /> Focus
							Areas
						</h3>
						<div className="flex flex-wrap gap-2">
							{SKILLS.map((skill) => (
								<button
									key={skill}
									onClick={() => toggleSkill(skill)}
									className={`
                    px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                    ${
						selectedSkills.includes(skill)
							? "bg-accent text-white border-accent"
							: "bg-white/5 text-gray-400 border-transparent hover:border-white/20 hover:text-white"
					}
                  `}>
									{skill}
								</button>
							))}
						</div>
					</div>

					{/* 2. Recommendations List */}
					<div className="bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[500px]">
						<div className="p-4 border-b border-white/5 bg-white/[0.02]">
							<h3 className="font-bold text-white">
								Recommended Drills
							</h3>
							<p className="text-xs text-gray-500">
								Based on your selection
							</p>
						</div>

						<div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
							{recommendedDrills.length === 0 ? (
								<div className="p-4 text-center text-gray-500 text-sm">
									No drills found for this combination.
								</div>
							) : (
								recommendedDrills.map((drill) => (
									<div
										key={drill.id}
										className="group flex items-center justify-between p-3 rounded-xl bg-[#161616] border border-white/5 hover:border-white/20 transition-all">
										<div>
											<div className="font-bold text-gray-200 text-sm">
												{drill.name}
											</div>
											<div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
												<span className="flex items-center gap-1">
													<Clock size={10} />{" "}
													{drill.duration}m
												</span>
												<span>•</span>
												<span>{drill.intensity}</span>
											</div>
										</div>
										<button
											onClick={() => addToTimeline(drill)}
											className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-accent hover:text-white transition-colors">
											<Plus size={16} />
										</button>
									</div>
								))
							)}
						</div>
					</div>
				</div>

				{/* RIGHT COLUMN: SESSION TIMELINE (8 Cols) */}
				<div className="lg:col-span-8 space-y-6">
					{/* Time Budget Bar */}
					<div className="bg-[#1E1E1E] rounded-2xl border border-white/5 p-6 relative overflow-hidden">
						{/* Background Progress */}
						<div
							className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
								remainingTime < 0 ? "bg-red-500" : "bg-accent"
							}`}
							style={{ width: `${progressPercent}%` }}></div>

						<div className="flex justify-between items-center relative z-10">
							<div>
								<h2 className="text-xl font-bold text-white">
									Session Timeline
								</h2>
								<p className="text-sm text-gray-400">
									Drag drills to reorder
								</p>
							</div>

							<div className="text-right">
								<div
									className={`text-3xl font-black ${
										remainingTime < 0
											? "text-red-500"
											: "text-white"
									}`}>
									{plannedDuration}
									<span className="text-lg text-gray-500 font-medium">
										/{EVENT_DETAILS.totalDuration}m
									</span>
								</div>
								<div className="text-xs font-bold uppercase tracking-wider text-gray-500">
									{remainingTime < 0
										? `${Math.abs(
												remainingTime
										  )}m Over Limit`
										: `${remainingTime}m Remaining`}
								</div>
							</div>
						</div>
					</div>

					{/* The Timeline */}
					<div className="relative pl-6 border-l-2 border-white/5 space-y-6 min-h-[400px]">
						{/* Start Node */}
						<div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-[#1A1A1A]"></div>

						{timeline.length === 0 && (
							<div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center text-gray-500 h-64">
								<Dumbbell
									size={32}
									className="mb-2 opacity-50"
								/>
								<p>Your timeline is empty.</p>
								<p className="text-sm">
									Select skills on the left to add drills.
								</p>
							</div>
						)}

						{timeline.map((item, index) => (
							<div
								key={item.instanceId}
								className="relative animate-in slide-in-from-left-2 duration-300">
								{/* Connector Dot */}
								<div className="absolute -left-[31px] top-8 w-3 h-3 rounded-full bg-gray-600 border-2 border-[#1A1A1A]"></div>

								{/* Time Stamp (Accumulated) */}
								<div className="absolute -left-20 top-8 text-xs font-mono text-gray-500 w-12 text-right">
									{index === 0
										? "00:00"
										: `+${timeline
												.slice(0, index)
												.reduce(
													(a, b) => a + b.duration,
													0
												)}m`}
								</div>

								{/* Card */}
								<div className="group bg-[#1E1E1E] rounded-xl border border-white/5 p-4 flex items-center gap-4 hover:border-accent/50 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing">
									<div className="text-gray-600 cursor-grab">
										<GripVertical size={20} />
									</div>

									<div className="flex-1">
										<div className="flex justify-between items-start">
											<h4 className="font-bold text-white text-lg">
												{item.name}
											</h4>
											<span
												className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
													item.intensity === "High"
														? "bg-red-500/20 text-red-400"
														: item.intensity ===
														  "Medium"
														? "bg-yellow-500/20 text-yellow-400"
														: "bg-green-500/20 text-green-400"
												}`}>
												{item.intensity}
											</span>
										</div>
										<div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
											<span className="flex items-center gap-1">
												<Clock size={14} />{" "}
												{item.duration} mins
											</span>
											<span>•</span>
											<span className="text-gray-500">
												{item.category}
											</span>
										</div>
									</div>

									<button
										onClick={() =>
											removeFromTimeline(item.instanceId)
										}
										className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
										<Trash2 size={18} />
									</button>
								</div>
							</div>
						))}

						{/* End Node (only if items exist) */}
						{timeline.length > 0 && (
							<div className="absolute -left-[9px] bottom-0 w-4 h-4 rounded-full bg-gray-700 border-4 border-[#1A1A1A]"></div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
