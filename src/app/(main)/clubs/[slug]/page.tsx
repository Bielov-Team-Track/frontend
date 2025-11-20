"use client";

import {
	Calendar,
	ChevronRight,
	Heart,
	ImageIcon,
	MapPin,
	MessageCircle,
	MoreHorizontal,
	Share2,
	Trophy,
	Users,
} from "lucide-react";
import { useState } from "react";

// --- Mock Data (Replace with your API data) ---
const CLUB_DATA = {
	name: "Newcastle Spikers VC",
	tagline: "Premier Volleyball Club in the North East",
	location: "Newcastle upon Tyne, UK",
	members: 1240,
	founded: "2018",
	bannerUrl: "/api/placeholder/1200/400", // Replace with real image
	logoUrl: "/api/placeholder/150/150", // Replace with real image
};

const TEAMS = [
	{ id: 1, name: "Falcons A", division: "Div 1", type: "Men" },
	{ id: 2, name: "Hawks B", division: "Div 3", type: "Men" },
	{ id: 3, name: "Eagles W", division: "Div 1", type: "Women" },
];

const EVENTS = [
	{
		id: 1,
		title: "Autumn Cup Qualifier",
		date: "07",
		month: "OCT",
		time: "20:56",
		location: "Strawberry Place",
		spots: "12/14",
	},
	{
		id: 2,
		title: "Open Training Session",
		date: "09",
		month: "OCT",
		time: "18:00",
		location: "City Sport Center",
		spots: "20/25",
	},
];

const POSTS = [
	{
		id: 1,
		author: "Admin",
		time: "2h ago",
		content:
			"Huge victory for the Falcons A team last night against Durham! Final score 3-0. MVP goes to Denys for those incredible blocks. 🏐🔥",
		image: "/api/placeholder/600/300",
		likes: 45,
		comments: 12,
	},
];

export default function ClubPage() {
	const [activeTab, setActiveTab] = useState("news");

	return (
		<div className="min-h-screen bg-base-100 text-gray-100 font-sans pb-10">
			{/* --- HERO SECTION --- */}
			<div className="relative w-full">
				{/* Banner Image with Gradient Overlay */}
				<div className="h-64 md:h-80 w-full relative overflow-hidden">
					<img
						src={CLUB_DATA.bannerUrl}
						alt="Club Banner"
						className="w-full h-full object-cover opacity-80"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/40 to-transparent" />
				</div>

				{/* Club Header Content */}
				<div className="max-w-desktop mx-auto px-4 sm:px-6 relative -mt-20">
					<div className="flex flex-col md:flex-row items-end md:items-center gap-6">
						{/* Logo */}
						<div className="relative group">
							<div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-base-100 bg-gray-800 overflow-hidden shadow-2xl shadow-black/50">
								<img
									src={CLUB_DATA.logoUrl}
									alt="Logo"
									className="w-full h-full object-cover"
								/>
							</div>
							{/* Online Status Indicator */}
							<div className="absolute bottom-4 right-4 w-4 h-4 bg-success rounded-full border-2 border-base-100"></div>
						</div>

						{/* Text Info */}
						<div className="flex-1 mb-2">
							<div className="flex items-center gap-2 mb-1">
								<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
									{CLUB_DATA.name}
								</h1>
								{/* Verified Badge */}
								<div className="bg-primary/20 text-primary p-1 rounded-full">
									<Trophy size={14} />
								</div>
							</div>
							<p className="text-gray-400 text-sm md:text-base flex flex-wrap items-center gap-x-4 gap-y-1">
								<span className="flex items-center gap-1">
									<MapPin size={14} /> {CLUB_DATA.location}
								</span>
								<span className="w-1 h-1 bg-gray-600 rounded-full" />
								<span className="flex items-center gap-1">
									<Users size={14} /> {CLUB_DATA.members}{" "}
									Members
								</span>
							</p>
						</div>

						{/* Actions */}
						<div className="flex gap-3 mb-4 w-full md:w-auto">
							<button className="flex-1 md:flex-none btn bg-accent hover:bg-accent/90 text-white border-none px-8 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
								Join Club
							</button>
							<button className="flex-1 md:flex-none btn btn-ghost bg-white/5 hover:bg-white/10 border border-white/10 text-white">
								<MessageCircle size={18} />
							</button>
							<button className="btn btn-square btn-ghost hover:bg-white/5 text-gray-400">
								<MoreHorizontal />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* --- CONTENT GRID --- */}
			<div className="max-w-desktop mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* --- LEFT SIDEBAR (Context) --- */}
				<div className="lg:col-span-4 space-y-6">
					{/* About Card */}
					<div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
						<h3 className="text-lg font-bold text-white mb-3">
							About
						</h3>
						<p className="text-gray-400 text-sm leading-relaxed mb-4">
							{CLUB_DATA.tagline}. We are a community driven club
							focusing on competitive indoor volleyball and beach
							events.
						</p>
						<div className="flex gap-2 text-xs font-medium text-primary cursor-pointer hover:underline">
							FULL DESCRIPTION <ChevronRight size={12} />
						</div>
					</div>

					{/* Teams List */}
					<div className="p-6 rounded-2xl bg-white/5 border border-white/5">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold text-white">
								Teams
							</h3>
							<span className="text-xs text-gray-500 hover:text-white cursor-pointer">
								View All
							</span>
						</div>
						<div className="space-y-3">
							{TEAMS.map((team) => (
								<div
									key={team.id}
									className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
											{team.name.substring(0, 1)}
										</div>
										<div>
											<div className="text-sm font-semibold text-gray-200 group-hover:text-accent transition-colors">
												{team.name}
											</div>
											<div className="text-xs text-gray-500">
												{team.type}
											</div>
										</div>
									</div>
									<div className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20">
										{team.division}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Gallery Preview */}
					<div className="p-6 rounded-2xl bg-white/5 border border-white/5">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold text-white">
								Media
							</h3>
							<ImageIcon size={16} className="text-gray-500" />
						</div>
						<div className="grid grid-cols-3 gap-2">
							{[1, 2, 3, 4, 5].map((_, i) => (
								<div
									key={i}
									className="aspect-square rounded-lg bg-gray-700 overflow-hidden relative cursor-pointer hover:opacity-80 transition-opacity">
									<img
										src={`/api/placeholder/100/100?text=${i}`}
										alt=""
										className="w-full h-full object-cover"
									/>
								</div>
							))}
							<div className="aspect-square rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:text-white hover:border-white/20 transition-colors">
								+24
							</div>
						</div>
					</div>
				</div>

				{/* --- RIGHT MAIN FEED --- */}
				<div className="lg:col-span-8 space-y-8">
					{/* Section: Upcoming Events (Horizontal Scroll) */}
					<section>
						<div className="flex justify-between items-end mb-4">
							<h2 className="text-xl font-bold text-white">
								Upcoming Events
							</h2>
							<div className="flex gap-2">
								{/* Custom arrows could go here */}
							</div>
						</div>

						<div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
							{EVENTS.map((event) => (
								<div
									key={event.id}
									className="snap-start min-w-[280px] p-4 rounded-2xl bg-[#1E1E1E] border border-white/5 hover:border-accent/50 transition-all group cursor-pointer">
									<div className="flex items-start justify-between mb-3">
										{/* Date Box */}
										<div className="flex flex-col items-center justify-center w-12 h-14 rounded-lg bg-white/5 border border-white/10">
											<span className="text-accent font-bold text-lg leading-none">
												{event.date}
											</span>
											<span className="text-[10px] text-gray-400 uppercase font-medium">
												{event.month}
											</span>
										</div>
										<div className="px-2 py-1 rounded text-[10px] bg-white/5 text-gray-400 border border-white/5">
											2h Duration
										</div>
									</div>

									<h4 className="font-bold text-white text-lg truncate pr-2 group-hover:text-accent transition-colors">
										{event.title}
									</h4>

									<div className="mt-2 space-y-1">
										<div className="flex items-center gap-2 text-xs text-gray-400">
											<Calendar size={12} /> {event.time}
										</div>
										<div className="flex items-center gap-2 text-xs text-gray-400 truncate">
											<MapPin size={12} />{" "}
											{event.location}
										</div>
									</div>

									{/* Spots Progress */}
									<div className="mt-4">
										<div className="flex justify-between text-[10px] text-gray-400 mb-1">
											<span>Attendees</span>
											<span>{event.spots}</span>
										</div>
										<div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
											<div className="h-full bg-primary w-[85%] rounded-full"></div>
										</div>
									</div>
								</div>
							))}

							{/* View All Card */}
							<div className="snap-start min-w-[100px] flex items-center justify-center rounded-2xl bg-transparent border-2 border-dashed border-white/10 text-gray-500 hover:text-accent hover:border-accent/30 cursor-pointer transition-colors">
								<span className="text-sm font-medium">
									View All
								</span>
							</div>
						</div>
					</section>

					{/* Section: News Feed */}
					<section>
						{/* Tabs */}
						<div className="flex items-center gap-6 border-b border-white/10 mb-6">
							{["News", "Match Results", "Announcements"].map(
								(tab) => (
									<button
										key={tab}
										onClick={() =>
											setActiveTab(
												tab.toLowerCase().split(" ")[0]
											)
										}
										className={`pb-3 text-sm font-medium relative transition-colors ${
											activeTab ===
											tab.toLowerCase().split(" ")[0]
												? "text-accent"
												: "text-gray-500 hover:text-gray-300"
										}`}>
										{tab}
										{activeTab ===
											tab.toLowerCase().split(" ")[0] && (
											<span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
										)}
									</button>
								)
							)}
						</div>

						{/* Posts List */}
						<div className="space-y-6">
							{POSTS.map((post) => (
								<div
									key={post.id}
									className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
									{/* Post Header */}
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary p-[2px]">
												<div className="w-full h-full rounded-full bg-base-100 overflow-hidden">
													<img
														src={CLUB_DATA.logoUrl}
														alt=""
														className="w-full h-full object-cover"
													/>
												</div>
											</div>
											<div>
												<div className="text-sm font-bold text-white">
													{CLUB_DATA.name}
												</div>
												<div className="text-xs text-gray-500">
													{post.time}
												</div>
											</div>
										</div>
										<button className="text-gray-500 hover:text-white">
											<MoreHorizontal size={18} />
										</button>
									</div>

									{/* Post Content */}
									<p className="text-gray-300 text-sm leading-relaxed mb-3">
										{post.content}
									</p>

									{/* Post Image */}
									{post.image && (
										<div className="rounded-xl overflow-hidden mb-4 border border-white/5">
											<img
												src={post.image}
												alt="Post attachment"
												className="w-full h-auto object-cover max-h-80"
											/>
										</div>
									)}

									{/* Post Actions */}
									<div className="flex items-center gap-6 pt-3 border-t border-white/5">
										<button className="flex items-center gap-2 text-sm text-gray-400 hover:text-accent transition-colors group">
											<Heart
												size={18}
												className="group-hover:fill-accent"
											/>
											<span>{post.likes}</span>
										</button>
										<button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
											<MessageCircle size={18} />
											<span>{post.comments}</span>
										</button>
										<button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors ml-auto">
											<Share2 size={18} />
										</button>
									</div>
								</div>
							))}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
