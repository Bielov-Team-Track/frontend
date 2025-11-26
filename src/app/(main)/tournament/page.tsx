"use client";

import {
	Calendar,
	ChevronRight,
	Edit3,
	MapPin,
	PlayCircle,
	Plus,
	Settings,
	Trophy,
	Users,
} from "lucide-react";
import { useState } from "react";

// --- MOCK DATA ---
const TOURNAMENT = {
	title: "Newcastle Winter Cup 2025",
	status: "Live", // Upcoming, Live, Finished
	format: "6v6 Mixed",
	teamsCount: 12,
	date: "Oct 12 - Oct 14",
	location: "Sport Central, Newcastle",
	adminMode: true, // Toggle this to see Admin features
};

const GROUPS = [
	{
		name: "Group A",
		table: [
			{
				id: 1,
				team: "Falcons A",
				p: 3,
				w: 3,
				l: 0,
				sets: "9:1",
				pts: 9,
				logo: "/api/placeholder/40/40",
			},
			{
				id: 2,
				team: "Durham City",
				p: 3,
				w: 2,
				l: 1,
				sets: "7:4",
				pts: 6,
				logo: "/api/placeholder/40/41",
			},
			{
				id: 3,
				team: "Leeds VC",
				p: 3,
				w: 1,
				l: 2,
				sets: "4:7",
				pts: 3,
				logo: "/api/placeholder/40/42",
			},
			{
				id: 4,
				team: "York Spikers",
				p: 3,
				w: 0,
				l: 3,
				sets: "1:9",
				pts: 0,
				logo: "/api/placeholder/40/43",
			},
		],
	},
	{
		name: "Group B",
		table: [
			{
				id: 5,
				team: "Northumbria",
				p: 3,
				w: 3,
				l: 0,
				sets: "9:2",
				pts: 8,
				logo: "/api/placeholder/40/44",
			},
			{
				id: 6,
				team: "Sunderland",
				p: 3,
				w: 2,
				l: 1,
				sets: "6:5",
				pts: 5,
				logo: "/api/placeholder/40/45",
			},
			{
				id: 7,
				team: "Middlesbrough",
				p: 3,
				w: 1,
				l: 2,
				sets: "5:6",
				pts: 4,
				logo: "/api/placeholder/40/46",
			},
			{
				id: 8,
				team: "Gateshead",
				p: 3,
				w: 0,
				l: 3,
				sets: "0:9",
				pts: 0,
				logo: "/api/placeholder/40/47",
			},
		],
	},
];

// Bracket Data (Semi-Finals -> Finals)
const BRACKET = {
	semis: [
		{
			id: 101,
			t1: { name: "Falcons A", score: 3 },
			t2: { name: "Sunderland", score: 0 },
			status: "Finished",
		},
		{
			id: 102,
			t1: { name: "Northumbria", score: 2 },
			t2: { name: "Durham City", score: 1 },
			status: "Live",
			isLive: true,
		},
	],
	final: [
		{
			id: 201,
			t1: { name: "Falcons A", score: null },
			t2: { name: "TBD", score: null },
			status: "Scheduled",
		},
	],
};

type ViewMode = "overview" | "groups" | "bracket" | "teams";

export default function TournamentPage() {
	const [activeTab, setActiveTab] = useState<ViewMode>("groups");
	const [isAdmin, setIsAdmin] = useState(TOURNAMENT.adminMode);

	return (
		<div className="min-h-screen bg-base-100 text-gray-100 font-sans pb-20">
			{/* --- ADMIN TOOLBAR (Visible only to organizers) --- */}
			{isAdmin && (
				<div className="bg-accent/10 border-b border-accent/20 px-4 py-2 flex items-center justify-between">
					<div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
						<Settings size={14} /> Organizer Mode
					</div>
					<div className="flex gap-3">
						<button className="text-xs text-white hover:text-accent font-medium">
							Edit Structure
						</button>
						<button className="text-xs text-white hover:text-accent font-medium">
							Manage Teams
						</button>
						<button className="text-xs bg-accent text-white px-3 py-1 rounded hover:bg-accent/90">
							Publish Changes
						</button>
					</div>
				</div>
			)}

			{/* --- HERO SECTION --- */}
			<div className="relative bg-[#1A1A1A] border-b border-white/5 pt-8 pb-0">
				<div className="max-w-desktop mx-auto px-4 md:px-8">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-bold uppercase animate-pulse">
									{TOURNAMENT.status}
								</span>
								<span className="text-gray-500 text-sm font-medium">
									{TOURNAMENT.format}
								</span>
							</div>
							<h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
								{TOURNAMENT.title}
							</h1>
							<div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
								<span className="flex items-center gap-1">
									<Calendar size={14} /> {TOURNAMENT.date}
								</span>
								<span className="flex items-center gap-1">
									<MapPin size={14} /> {TOURNAMENT.location}
								</span>
								<span className="flex items-center gap-1">
									<Users size={14} /> {TOURNAMENT.teamsCount}{" "}
									Teams
								</span>
							</div>
						</div>

						{/* Main Action */}
						<div className="flex gap-3 w-full md:w-auto">
							<button className="flex-1 md:flex-none btn bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2">
								<Trophy size={18} /> Rules
							</button>
							{isAdmin ? (
								<button className="flex-1 md:flex-none btn bg-accent hover:bg-accent/90 text-white border-none shadow-[0_0_15px_rgba(249,115,22,0.3)] gap-2">
									<Plus size={18} /> Add Result
								</button>
							) : (
								<button className="flex-1 md:flex-none btn bg-primary hover:bg-primary/90 text-white border-none gap-2">
									<PlayCircle size={18} /> Watch Live
								</button>
							)}
						</div>
					</div>

					{/* Navigation Tabs */}
					<div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar">
						{["overview", "groups", "bracket", "teams"].map(
							(tab) => (
								<button
									key={tab}
									onClick={() =>
										setActiveTab(tab as ViewMode)
									}
									className={`
                  pb-4 text-sm font-bold capitalize relative whitespace-nowrap transition-colors
                  ${
						activeTab === tab
							? "text-accent"
							: "text-gray-500 hover:text-white"
					}
                `}>
									{tab}
									{activeTab === tab && (
										<span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
									)}
								</button>
							)
						)}
					</div>
				</div>
			</div>

			{/* --- MAIN CONTENT AREA --- */}
			<div className="max-w-desktop mx-auto px-4 md:px-8 mt-8">
				{/* VIEW: GROUPS (Standings) */}
				{activeTab === "groups" && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
						{GROUPS.map((group) => (
							<div
								key={group.name}
								className="bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden">
								{/* Header */}
								<div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
									<h3 className="font-bold text-white">
										{group.name}
									</h3>
									<button className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
										Full Schedule <ChevronRight size={12} />
									</button>
								</div>

								{/* Table */}
								<div className="p-2">
									<table className="w-full text-sm">
										<thead>
											<tr className="text-gray-500 border-b border-white/5">
												<th className="font-medium text-left py-2 pl-2">
													Team
												</th>
												<th className="font-medium text-center py-2 w-10">
													P
												</th>
												<th className="font-medium text-center py-2 w-10">
													W
												</th>
												<th className="font-medium text-center py-2 w-10">
													L
												</th>
												<th className="font-medium text-center py-2 w-14">
													Sets
												</th>
												<th className="font-medium text-center py-2 w-10 text-white">
													Pts
												</th>
											</tr>
										</thead>
										<tbody>
											{group.table.map((row, index) => (
												<tr
													key={row.id}
													className={`
                            border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors
                            ${
								index < 2
									? "bg-gradient-to-r from-success/5 to-transparent"
									: ""
							} 
                          `}>
													<td className="py-3 pl-2 flex items-center gap-3">
														<span
															className={`text-xs w-4 ${
																index < 2
																	? "text-success font-bold"
																	: "text-gray-600"
															}`}>
															{index + 1}
														</span>
														<img
															src={row.logo}
															className="w-6 h-6 rounded bg-gray-700"
															alt=""
														/>
														<span className="text-white font-medium">
															{row.team}
														</span>
													</td>
													<td className="text-center text-gray-400">
														{row.p}
													</td>
													<td className="text-center text-gray-400">
														{row.w}
													</td>
													<td className="text-center text-gray-400">
														{row.l}
													</td>
													<td className="text-center text-gray-500 text-xs">
														{row.sets}
													</td>
													<td className="text-center font-bold text-white">
														{row.pts}
													</td>
												</tr>
											))}
										</tbody>
									</table>

									{/* Legend */}
									<div className="px-4 py-3 text-[10px] text-gray-500 flex gap-4">
										<span className="flex items-center gap-1">
											<div className="w-2 h-2 rounded-full bg-success/20 border border-success"></div>{" "}
											Promotion
										</span>
										<span className="flex items-center gap-1">
											<div className="w-2 h-2 rounded-full bg-gray-700 border border-gray-600"></div>{" "}
											Eliminated
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* VIEW: BRACKET (Play-offs) */}
				{activeTab === "bracket" && (
					<div className="overflow-x-auto pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="min-w-[800px] flex justify-around relative">
							{/* STAGE: SEMI-FINALS */}
							<div className="flex flex-col justify-around w-1/3 gap-12">
								<div className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
									Semi-Finals
								</div>
								{BRACKET.semis.map((match) => (
									<BracketMatch
										key={match.id}
										match={match}
										isAdmin={isAdmin}
									/>
								))}
							</div>

							{/* CONNECTOR LINES (CSS HACK) */}
							<div className="w-16 flex flex-col justify-center items-center py-20">
								{/* Top Branch */}
								<div className="h-1/4 w-full border-r-2 border-white/10 rounded-tr-2xl translate-y-4"></div>
								{/* Middle Horizontal */}
								<div className="w-8 h-0 border-t-2 border-white/10"></div>
								{/* Bottom Branch */}
								<div className="h-1/4 w-full border-r-2 border-white/10 rounded-br-2xl -translate-y-4"></div>
							</div>

							{/* STAGE: FINALS */}
							<div className="flex flex-col justify-center w-1/3">
								<div className="text-center text-accent text-xs font-bold uppercase tracking-widest mb-8">
									The Final
								</div>
								<div className="mb-8">
									<div className="text-center text-yellow-500 mb-2">
										<Trophy
											size={32}
											className="mx-auto drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
										/>
									</div>
									{BRACKET.final.map((match) => (
										<BracketMatch
											key={match.id}
											match={match}
											isAdmin={isAdmin}
											isFinal
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// --- SUB-COMPONENT: BRACKET MATCH CARD ---
function BracketMatch({ match, isAdmin, isFinal }: any) {
	return (
		<div
			className={`
      relative bg-[#1E1E1E] rounded-xl border transition-all group
      ${
			isFinal
				? "border-accent/30 shadow-[0_0_30px_rgba(249,115,22,0.1)] scale-110"
				: "border-white/10 hover:border-white/20"
		}
    `}>
			{/* Edit Button (Admin Only) */}
			{isAdmin && (
				<button className="absolute -top-2 -right-2 bg-gray-700 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
					<Edit3 size={12} />
				</button>
			)}

			{/* Live Badge */}
			{match.isLive && (
				<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded flex items-center gap-1">
					<span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>{" "}
					Live
				</div>
			)}

			<div className="w-64">
				{/* Team 1 */}
				<div
					className={`
          flex justify-between items-center p-3 border-b border-white/5
          ${
				match.t1.score > match.t2.score
					? "bg-gradient-to-r from-success/10 to-transparent"
					: ""
			}
        `}>
					<div className="flex items-center gap-3">
						<div className="w-6 h-6 rounded bg-gray-700 text-[10px] flex items-center justify-center text-gray-400">
							img
						</div>
						<span
							className={`font-bold text-sm ${
								match.t1.score > match.t2.score
									? "text-white"
									: "text-gray-400"
							}`}>
							{match.t1.name}
						</span>
					</div>
					<span
						className={`font-mono font-bold ${
							match.t1.score > match.t2.score
								? "text-accent"
								: "text-gray-500"
						}`}>
						{match.t1.score ?? "-"}
					</span>
				</div>

				{/* Team 2 */}
				<div
					className={`
          flex justify-between items-center p-3
          ${
				match.t2.score > match.t1.score
					? "bg-gradient-to-r from-success/10 to-transparent"
					: ""
			}
        `}>
					<div className="flex items-center gap-3">
						<div className="w-6 h-6 rounded bg-gray-700 text-[10px] flex items-center justify-center text-gray-400">
							img
						</div>
						<span
							className={`font-bold text-sm ${
								match.t2.score > match.t1.score
									? "text-white"
									: "text-gray-400"
							}`}>
							{match.t2.name}
						</span>
					</div>
					<span
						className={`font-mono font-bold ${
							match.t2.score > match.t1.score
								? "text-accent"
								: "text-gray-500"
						}`}>
						{match.t2.score ?? "-"}
					</span>
				</div>
			</div>

			{/* Date/Status Footer */}
			{!match.isLive && (
				<div className="px-3 py-1 bg-black/20 text-center text-[10px] text-gray-500 font-medium uppercase rounded-b-xl">
					{match.status}
				</div>
			)}
		</div>
	);
}
