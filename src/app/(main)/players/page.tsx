"use client";

import {
	Activity,
	Crown,
	MapPin,
	Medal,
	MessageCircle,
	Share2,
	Trophy,
	UserPlus,
	Volleyball,
} from "lucide-react";
import React, { useState } from "react";

// --- Mock Data ---
const PLAYER = {
	name: "Alex 'The Hammer' Volkov",
	username: "@volkov_spike",
	position: "Outside Hitter",
	location: "Newcastle, UK",
	height: "198cm",
	dominantHand: "Right",
	joined: "2020",
	avatar: "/api/placeholder/200/200",
	banner: "/api/placeholder/1200/400",
	isVerified: true,
	stats: [
		{ label: "Matches", value: 142 },
		{ label: "Win Rate", value: "78%" },
		{ label: "MVPs", value: 12 },
	],
	clubs: [
		{
			id: 1,
			name: "Newcastle Spikers",
			logo: "/api/placeholder/50/50",
			period: "2023 - Present",
			current: true,
			division: "Div 1",
		},
		{
			id: 2,
			name: "London Giants",
			logo: "/api/placeholder/50/51",
			period: "2020 - 2023",
			current: false,
			division: "Div 2",
		},
	],
	achievements: [
		{
			id: 1,
			title: "League MVP",
			count: 3,
			icon: Crown,
			color: "from-yellow-400 to-orange-500",
		},
		{
			id: 2,
			title: "Tournament Winner",
			count: 7,
			icon: Trophy,
			color: "from-yellow-400 to-orange-500",
		},
		{
			id: 3,
			title: "Best Spiker",
			count: 4,
			icon: Activity,
			color: "from-gray-300 to-gray-500",
		},
		{
			id: 4,
			title: "Runner-up Medal",
			count: 5,
			icon: Medal,
			color: "from-orange-700 to-orange-900",
		},
	],
	tournaments: [
		{
			id: 1,
			name: "Summer Slam 2024",
			date: "Aug 2024",
			result: "Winner",
			team: "Newcastle Spikers",
			resultType: "gold",
		},
		{
			id: 2,
			name: "National Cup",
			date: "May 2024",
			result: "Semi-Finals",
			team: "Newcastle Spikers",
			resultType: "bronze",
		},
		{
			id: 3,
			name: "Winter League",
			date: "Dec 2023",
			result: "Runner-up",
			team: "London Giants",
			resultType: "silver",
		},
		{
			id: 4,
			name: "Open Qualifier",
			date: "Oct 2023",
			result: "Quarter-finals",
			team: "London Giants",
			resultType: "neutral",
		},
	],
};

type TabType = "overview" | "tournaments" | "achievements";

export default function PlayerPage() {
	const [activeTab, setActiveTab] = useState<TabType>("overview");

	return (
		<div className="min-h-screen bg-base-100 text-gray-100 font-sans pb-20">
			{/* --- HERO SECTION --- */}
			<div className="relative mb-6">
				{/* Banner & Gradient */}
				<div className="h-60 md:h-80 w-full relative overflow-hidden">
					<img
						src={PLAYER.banner}
						alt="Banner"
						className="w-full h-full object-cover opacity-60"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/60 to-transparent" />
				</div>

				{/* Player Info Header */}
				<div className="max-w-desktop mx-auto px-4 sm:px-6 relative -mt-24 md:-mt-32 flex flex-col md:flex-row items-end gap-6">
					{/* Avatar */}
					<div className="relative">
						<div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-base-100 bg-gray-800 overflow-hidden shadow-2xl shadow-black/50">
							<img
								src={PLAYER.avatar}
								alt={PLAYER.name}
								className="w-full h-full object-cover"
							/>
						</div>
						{PLAYER.isVerified && (
							<div
								className="absolute bottom-2 right-2 bg-primary text-white p-1 rounded-full border-4 border-base-100"
								title="Verified Player">
								<Check size={18} strokeWidth={3} />
							</div>
						)}
					</div>

					{/* Name & Stats */}
					<div className="flex-1 mb-2">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
									{PLAYER.name}
								</h1>
								<p className="text-gray-400 text-sm md:text-base flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
									<span className="text-primary font-medium">
										{PLAYER.username}
									</span>
									<span className="w-1 h-1 bg-gray-600 rounded-full" />
									<span className="flex items-center gap-1">
										<Volleyball size={14} />{" "}
										{PLAYER.position}
									</span>
									<span className="w-1 h-1 bg-gray-600 rounded-full" />
									<span className="flex items-center gap-1">
										<MapPin size={14} /> {PLAYER.location}
									</span>
								</p>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								<button className="btn bg-accent hover:bg-accent/90 text-white border-none px-6 shadow-[0_0_20px_rgba(249,115,22,0.2)] flex items-center gap-2">
									<UserPlus size={18} /> Follow
								</button>
								<button className="btn btn-square btn-ghost bg-white/5 hover:bg-white/10 border border-white/10 text-white">
									<MessageCircle size={18} />
								</button>
								<button className="btn btn-square btn-ghost hover:bg-white/5 text-gray-400">
									<Share2 size={18} />
								</button>
							</div>
						</div>

						{/* Stat Boxes */}
						<div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 md:w-2/3">
							{PLAYER.stats.map((stat, i) => (
								<div
									key={i}
									className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm hover:bg-white/10 transition-colors">
									<div className="text-2xl md:text-3xl font-bold text-white">
										{stat.value}
									</div>
									<div className="text-xs text-gray-400 uppercase tracking-wider font-medium">
										{stat.label}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* --- CONTENT GRID --- */}
			<div className="max-w-desktop mx-auto px-4 sm:px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* --- LEFT SIDEBAR (Details & Clubs) --- */}
				<div className="lg:col-span-4 space-y-6">
					{/* Key Details Card */}
					<div className="p-6 rounded-2xl bg-white/5 border border-white/5">
						<h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
							<Activity size={18} className="text-primary" />{" "}
							Player Details
						</h3>
						<div className="space-y-4">
							<DetailRow label="Height" value={PLAYER.height} />
							<DetailRow
								label="Dominant Hand"
								value={PLAYER.dominantHand}
							/>
							<DetailRow
								label="Joined Volleyer"
								value={PLAYER.joined}
							/>
						</div>
					</div>

					{/* Clubs History */}
					<div className="p-6 rounded-2xl bg-white/5 border border-white/5">
						<h3 className="text-lg font-bold text-white mb-4">
							Club History
						</h3>
						<div className="space-y-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5 before:z-0">
							{PLAYER.clubs.map((club) => (
								<div
									key={club.id}
									className="relative z-10 flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
									<div className="flex items-center gap-3">
										<div
											className={`w-10 h-10 rounded-xl p-0.5 ${
												club.current
													? "bg-gradient-to-br from-accent to-primary"
													: "bg-gray-700"
											}`}>
											<img
												src={club.logo}
												className="w-full h-full rounded-lg bg-[#1E1E1E] object-cover"
												alt=""
											/>
										</div>
										<div>
											<div
												className={`text-sm font-bold ${
													club.current
														? "text-white"
														: "text-gray-300"
												}`}>
												{club.name}
											</div>
											<div className="text-xs text-gray-500">
												{club.period}
											</div>
										</div>
									</div>
									<div className="flex flex-col items-end gap-1">
										<span className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-[10px] font-medium border border-white/10">
											{club.division}
										</span>
										{club.current && (
											<span className="text-[10px] text-accent font-bold">
												Current
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* --- RIGHT MAIN CONTENT (Tabs) --- */}
				<div className="lg:col-span-8">
					{/* Tabs Navigation */}
					<div className="flex items-center border-b border-white/10 mb-6">
						{(
							[
								"overview",
								"tournaments",
								"achievements",
							] as TabType[]
						).map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`
                  flex-1 md:flex-none md:px-6 pb-4 text-sm font-bold capitalize relative transition-colors
                  ${
						activeTab === tab
							? "text-accent"
							: "text-gray-500 hover:text-white"
					}
                `}>
								{tab}
								{activeTab === tab && (
									<span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full z-10" />
								)}
							</button>
						))}
					</div>

					{/* Tab Content */}
					<div className="animate-in fade-in duration-300">
						{/* 1. ACHIEVEMENTS TAB */}
						{activeTab === "achievements" && (
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{PLAYER.achievements.map((ach) => (
									<div
										key={ach.id}
										className="group p-6 rounded-2xl bg-[#1E1E1E] border border-white/5 flex flex-col items-center text-center hover:border-accent/30 transition-all hover:-translate-y-1">
										<div
											className={`mb-4 p-3 rounded-full bg-gradient-to-br ${ach.color} bg-opacity-10`}>
											<ach.icon
												size={32}
												className="text-white drop-shadow-lg"
											/>
										</div>
										<div className="text-2xl font-bold text-white mb-1">
											{ach.count}x
										</div>
										<div className="text-sm text-gray-400 font-medium uppercase tracking-wider">
											{ach.title}
										</div>
									</div>
								))}
							</div>
						)}

						{/* 2. TOURNAMENTS TAB (Timeline) */}
						{activeTab === "tournaments" && (
							<div className="space-y-4">
								{PLAYER.tournaments.map((tour) => (
									<div key={tour.id} className="flex group">
										{/* Date Column */}
										<div className="w-24 pt-4 text-right pr-4 flex flex-col items-end relative">
											<span className="text-sm font-bold text-gray-300">
												{tour.date.split(" ")[0]}
											</span>
											<span className="text-xs text-gray-500">
												{tour.date.split(" ")[1]}
											</span>
											{/* Timeline Connector */}
											<div className="absolute right-[-5px] top-[22px] w-2.5 h-2.5 rounded-full bg-[#1E1E1E] border-2 border-white/20 group-hover:border-accent z-10"></div>
											<div className="absolute right-0 top-[22px] bottom-[-16px] w-0.5 bg-white/10 z-0"></div>
										</div>

										{/* Content Card */}
										<div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all flex justify-between items-center">
											<div>
												<h4 className="font-bold text-white text-lg group-hover:text-accent transition-colors">
													{tour.name}
												</h4>
												<div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
													<Users size={14} />{" "}
													Represents: {tour.team}
												</div>
											</div>
											<ResultBadge type={tour.resultType}>
												{tour.result}
											</ResultBadge>
										</div>
									</div>
								))}
							</div>
						)}

						{/* 3. OVERVIEW TAB (Placeholder for now) */}
						{activeTab === "overview" && (
							<div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
								<Activity
									size={48}
									className="mx-auto mb-4 opacity-50"
								/>
								<h3 className="text-lg font-bold text-white">
									Season Overview
								</h3>
								<p className="text-sm">
									Recent matches and highlights will appear
									here.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// --- Helpers ---
function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between text-sm">
			<span className="text-gray-400">{label}</span>
			<span className="font-medium text-white">{value}</span>
		</div>
	);
}

function ResultBadge({
	type,
	children,
}: {
	type: string;
	children: React.ReactNode;
}) {
	const colors = {
		gold: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
		silver: "bg-gray-300/20 text-gray-300 border-gray-300/30",
		bronze: "bg-orange-700/20 text-orange-700 border-orange-700/30",
		neutral: "bg-white/10 text-gray-400 border-white/10",
	};
	const colorClass = colors[type as keyof typeof colors] || colors.neutral;

	return (
		<span
			className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${colorClass}`}>
			{children}
		</span>
	);
}
// Need to import icons that were missing in first pass
import { Check, Users } from "lucide-react";
