"use client";

import {
	ArrowUpRight,
	Calendar,
	ChevronRight,
	Clock,
	Crown,
	MapPin,
	MoreHorizontal,
	Shield,
	Trophy,
	Users,
} from "lucide-react";

// --- Mock Data ---
const TEAM = {
	name: "Falcons A",
	division: "Premier League",
	season: "2024/2025",
	record: "12W - 2L",
	clubName: "Newcastle Spikers",
	clubLogo: "/api/placeholder/100/100",
	nextMatch: {
		opponent: "Durham City",
		opponentLogo: "/api/placeholder/100/101",
		date: "Tue, 14 Oct",
		time: "20:00",
		venue: "Home Arena",
	},
	stats: {
		rank: 2,
		points: 34,
		streak: "W W W L W",
	},
};

const ROSTER = [
	{
		id: 1,
		number: 7,
		name: "Denys Bielov",
		position: "Opposite",
		isCaptain: true,
		avatar: "/api/placeholder/50/50",
	},
	{
		id: 2,
		number: 12,
		name: "Sarah Jenks",
		position: "Setter",
		isCaptain: false,
		avatar: "/api/placeholder/50/51",
	},
	{
		id: 3,
		number: 4,
		name: "Mike Spiker",
		position: "Outside",
		isCaptain: false,
		avatar: "/api/placeholder/50/52",
	},
	{
		id: 4,
		number: 1,
		name: "John Block",
		position: "Middle",
		isCaptain: false,
		avatar: "/api/placeholder/50/53",
	},
	{
		id: 5,
		number: 8,
		name: "Sam Digs",
		position: "Libero",
		isCaptain: false,
		avatar: "/api/placeholder/50/54",
	},
	{
		id: 6,
		number: 10,
		name: "Alex Serve",
		position: "Outside",
		isCaptain: false,
		avatar: "/api/placeholder/50/55",
	},
];

const STANDINGS = [
	{ rank: 1, name: "Northumbria Kings", played: 15, pts: 38 },
	{ rank: 2, name: "Falcons A", played: 14, pts: 34, isCurrent: true },
	{ rank: 3, name: "Sunderland City", played: 15, pts: 30 },
	{ rank: 4, name: "Durham City", played: 14, pts: 28 },
];

const FIXTURES = [
	{
		id: 1,
		opponent: "Leeds VC",
		result: "3 - 0",
		status: "Win",
		date: "01 Oct",
	},
	{
		id: 2,
		opponent: "York VC",
		result: "3 - 2",
		status: "Win",
		date: "24 Sep",
	},
	{
		id: 3,
		opponent: "Northumbria",
		result: "1 - 3",
		status: "Loss",
		date: "17 Sep",
	},
];

export default function TeamPage() {
	return (
		<div className="min-h-screen bg-base-100 text-gray-100 font-sans pb-20">
			{/* --- HEADER SECTION --- */}
			<div className="bg-[#1A1A1A] border-b border-white/5 pt-8 pb-6 px-4 md:px-8">
				<div className="max-w-desktop mx-auto">
					{/* Breadcrumb */}
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-4 uppercase tracking-wider font-bold">
						<span className="hover:text-white cursor-pointer">
							{TEAM.clubName}
						</span>
						<ChevronRight size={12} />
						<span className="text-accent">Teams</span>
					</div>

					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div className="flex items-center gap-5">
							{/* Team Identity */}
							<div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 p-2 flex items-center justify-center shadow-2xl">
								<span className="text-3xl font-bold text-gray-600">
									FA
								</span>
								{/* Use <img> here in real app */}
							</div>

							<div>
								<h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
									{TEAM.name}
								</h1>
								<div className="flex items-center gap-3 text-sm">
									<span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20 font-bold">
										{TEAM.division}
									</span>
									<span className="text-gray-400 border-l border-white/10 pl-3">
										{TEAM.season} Season
									</span>
								</div>
							</div>
						</div>

						{/* Quick Stats Header */}
						<div className="flex gap-4">
							<div className="text-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
								<div className="text-2xl font-bold text-white">
									{TEAM.record}
								</div>
								<div className="text-[10px] text-gray-400 uppercase">
									Record
								</div>
							</div>
							<button className="btn bg-white/5 border border-white/10 text-white hover:bg-white/10">
								<MoreHorizontal />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* --- MAIN GRID --- */}
			<div className="max-w-desktop mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* --- LEFT COLUMN: ROSTER (7 cols) --- */}
				<div className="lg:col-span-7 space-y-8">
					{/* Roster Header */}
					<div className="flex justify-between items-end">
						<h2 className="text-xl font-bold text-white flex items-center gap-2">
							<Users className="text-accent" size={20} /> The
							Squad
						</h2>
						<span className="text-xs text-gray-500">
							{ROSTER.length} Players Registered
						</span>
					</div>

					{/* Roster List */}
					<div className="grid gap-3">
						{ROSTER.map((player) => (
							<div
								key={player.id}
								className="group flex items-center gap-4 p-3 rounded-xl bg-[#1E1E1E] border border-white/5 hover:border-accent/30 hover:bg-white/[0.07] transition-all cursor-pointer">
								{/* Jersey Number */}
								<div className="w-10 h-12 flex items-center justify-center bg-white/5 rounded-lg border border-white/5 group-hover:bg-accent group-hover:text-white transition-colors">
									<span className="font-mono text-xl font-bold text-gray-400 group-hover:text-white">
										{player.number}
									</span>
								</div>

								{/* Avatar */}
								<div className="relative">
									<img
										src={player.avatar}
										alt=""
										className="w-12 h-12 rounded-full object-cover bg-gray-700"
									/>
									{player.isCaptain && (
										<div
											className="absolute -top-1 -right-1 bg-yellow-500 text-black p-0.5 rounded-full border-2 border-[#1E1E1E]"
											title="Captain">
											<Crown size={10} fill="black" />
										</div>
									)}
								</div>

								{/* Info */}
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<h3 className="font-bold text-gray-200 group-hover:text-white">
											{player.name}
										</h3>
										{player.position === "Libero" && (
											<span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500 text-[10px] font-bold border border-orange-500/20">
												L
											</span>
										)}
									</div>
									<p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
										{player.position}
									</p>
								</div>

								<ChevronRight
									className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
									size={18}
								/>
							</div>
						))}
					</div>

					{/* Recruit Card */}
					<div className="border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center gap-3 text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/5 cursor-pointer transition-all">
						<ArrowUpRight size={18} />
						<span className="text-sm font-medium">
							Manage Roster / Invite Players
						</span>
					</div>
				</div>

				{/* --- RIGHT COLUMN: INFO & FIXTURES (5 cols) --- */}
				<div className="lg:col-span-5 space-y-8">
					{/* NEXT MATCH CARD (Hero of the sidebar) */}
					<div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E] border border-white/10 shadow-2xl">
						<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>

						<div className="p-6 text-center">
							<div className="text-xs font-bold text-accent uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
								<Clock size={12} /> Up Next
							</div>

							<div className="flex justify-between items-center mb-6">
								{/* Home */}
								<div className="flex flex-col items-center gap-2 w-1/3">
									<div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-white/10 p-2">
										{/* Img */}
										<div className="w-full h-full rounded-full bg-gray-600/50"></div>
									</div>
									<span className="text-sm font-bold truncate w-full">
										{TEAM.name}
									</span>
								</div>

								{/* VS */}
								<div className="text-2xl font-black text-gray-600 italic">
									VS
								</div>

								{/* Away */}
								<div className="flex flex-col items-center gap-2 w-1/3">
									<div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-white/10 p-2">
										{/* Img */}
										<div className="w-full h-full rounded-full bg-gray-600/50"></div>
									</div>
									<span className="text-sm font-bold truncate w-full">
										{TEAM.nextMatch.opponent}
									</span>
								</div>
							</div>

							<div className="bg-black/30 rounded-xl p-3 inline-flex flex-col gap-1 w-full">
								<div className="flex items-center justify-center gap-2 text-white font-medium">
									<Calendar
										size={14}
										className="text-gray-400"
									/>{" "}
									{TEAM.nextMatch.date}
								</div>
								<div className="flex items-center justify-center gap-2 text-sm text-gray-400">
									<MapPin size={14} /> {TEAM.nextMatch.venue}
								</div>
							</div>

							<button className="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors">
								Match Details
							</button>
						</div>
					</div>

					{/* LEAGUE TABLE WIDGET */}
					<div className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-5">
						<div className="flex justify-between items-center mb-4">
							<h3 className="font-bold text-white flex items-center gap-2">
								<Shield size={16} className="text-gray-400" />{" "}
								Standings
							</h3>
							<span className="text-xs text-accent cursor-pointer hover:underline">
								Full Table
							</span>
						</div>

						<div className="space-y-1">
							<div className="grid grid-cols-12 text-[10px] text-gray-500 uppercase font-bold px-2 mb-2">
								<div className="col-span-1">#</div>
								<div className="col-span-8">Team</div>
								<div className="col-span-3 text-right">Pts</div>
							</div>
							{STANDINGS.map((row) => (
								<div
									key={row.rank}
									className={`grid grid-cols-12 text-sm px-2 py-2 rounded-lg ${
										row.isCurrent
											? "bg-white/10 font-bold text-white border border-white/5"
											: "text-gray-400"
									}`}>
									<div className="col-span-1">{row.rank}</div>
									<div className="col-span-8 truncate">
										{row.name}
									</div>
									<div className="col-span-3 text-right">
										{row.pts}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* RECENT FORM */}
					<div className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-5">
						<h3 className="font-bold text-white mb-4 flex items-center gap-2">
							<Trophy size={16} className="text-gray-400" />{" "}
							Recent Form
						</h3>
						<div className="space-y-3">
							{FIXTURES.map((match) => (
								<div
									key={match.id}
									className="flex items-center justify-between text-sm">
									<div className="text-gray-400">
										{match.date}
									</div>
									<div className="text-gray-200 flex-1 px-4 truncate">
										vs {match.opponent}
									</div>
									<div
										className={`
                         px-2 py-0.5 rounded text-xs font-bold border
                         ${
								match.status === "Win"
									? "bg-green-500/10 text-green-500 border-green-500/20"
									: "bg-red-500/10 text-red-500 border-red-500/20"
							}
                      `}>
										{match.result}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
