"use client";

import { Link } from "@/components/ui";
import { getClub, getClubMembers, getTeamsByClub } from "@/lib/requests/clubs";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Heart, ImageIcon, ImageOff, Loader2, MapPin, MessageCircle, MoreHorizontal, Share2, Shield, Trophy, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

// Mock data for posts (will be replaced with real posts API later)
const MOCK_POSTS = [
	{
		id: 1,
		author: "Admin",
		time: "2h ago",
		content: "Welcome to our club page! Stay tuned for updates and announcements.",
		image: null,
		likes: 12,
		comments: 3,
	},
];

// Mock events (will be replaced with real events API later)
const MOCK_EVENTS: {
	id: number;
	title: string;
	date: string;
	month: string;
	time: string;
	location: string;
	spots: string;
}[] = [];

export default function ClubPage() {
	const params = useParams();
	const clubId = params.id as string;

	const [activeTab, setActiveTab] = useState("news");
	const [bannerError, setBannerError] = useState(false);
	const [logoError, setLogoError] = useState(false);

	const { data: club, isLoading: clubLoading } = useQuery({
		queryKey: ["public-club", clubId],
		queryFn: () => getClub(clubId),
		enabled: !!clubId,
	});

	const { data: members = [] } = useQuery({
		queryKey: ["public-club-members", clubId],
		queryFn: () => getClubMembers(clubId),
		enabled: !!clubId,
	});

	const { data: teams = [] } = useQuery({
		queryKey: ["public-club-teams", clubId],
		queryFn: () => getTeamsByClub(clubId),
		enabled: !!clubId,
	});

	if (clubLoading) {
		return (
			<div className="min-h-screen bg-background-dark flex items-center justify-center">
				<Loader2 className="w-8 h-8 text-accent animate-spin" />
			</div>
		);
	}

	if (!club) {
		return (
			<div className="min-h-screen bg-background-dark flex flex-col items-center justify-center text-white">
				<Shield className="w-16 h-16 text-muted mb-4" />
				<h1 className="text-2xl font-bold mb-2">Club Not Found</h1>
				<p className="text-muted mb-6">The club you&apos;re looking for doesn&apos;t exist.</p>
				<Link href="/clubs">Browse Clubs</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background-dark text-white font-sans pb-20">
			{/* --- HERO SECTION --- */}
			<div className="relative w-full">
				{/* Banner Image with Gradient Overlay */}
				<div className="h-56 md:h-80 w-full relative overflow-hidden bg-background-light">
					{club.bannerUrl && !bannerError ? (
						/* eslint-disable-next-line @next/next/no-img-element */
						<img src={club.bannerUrl} alt="Club Banner" className="w-full h-full object-cover opacity-80" onError={() => setBannerError(true)} />
					) : (
						<div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-accent/20 to-primary/20">
							<ImageOff size={48} className="text-white/20" />
						</div>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
				</div>

				{/* Club Header Content */}
				<div className="max-w-desktop mx-auto px-4 sm:px-6 relative -mt-16 md:-mt-20">
					<div className="flex flex-col md:flex-row items-end md:items-center gap-6">
						{/* Logo */}
						<div className="relative group self-start md:self-auto">
							<div className="h-28 w-28 md:h-40 md:w-40 rounded-2xl border-4 border-background-dark bg-background-light overflow-hidden shadow-2xl shadow-black/50 flex items-center justify-center">
								{club.logoUrl && !logoError ? (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img src={club.logoUrl} alt="Logo" className="w-full h-full object-cover" onError={() => setLogoError(true)} />
								) : (
									<Shield className="text-muted/50 w-12 h-12" />
								)}
							</div>
							{/* Online Status Indicator */}
							<div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-4 h-4 bg-success rounded-full border-2 border-background-dark"></div>
						</div>

						{/* Text Info */}
						<div className="flex-1 mb-2 w-full">
							<div className="flex items-center gap-2 mb-1">
								<h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{club.name}</h1>
								{/* Verified Badge */}
								{club.isPublic && (
									<div className="bg-primary/20 text-primary p-1 rounded-full">
										<Trophy size={14} />
									</div>
								)}
							</div>
							<p className="text-muted text-sm md:text-base flex flex-wrap items-center gap-x-4 gap-y-1">
								{club.location && (
									<>
										<span className="flex items-center gap-1">
											<MapPin size={14} /> {club.location}
										</span>
										<span className="w-1 h-1 bg-muted rounded-full hidden sm:block" />
									</>
								)}
								<span className="flex items-center gap-1">
									<Users size={14} /> {members.length} Members
								</span>
							</p>
						</div>

						{/* Actions */}
						<div className="flex gap-3 mb-4 w-full md:w-auto mt-4 md:mt-0">
							<Link variant="primary" href={"/clubs/" + club.id + "/register"}>
								Join Club
							</Link>
							<button className="flex-1 md:flex-none btn btn-ghost bg-white/5 hover:bg-white/10 border border-white/10 text-white">
								<MessageCircle size={18} />
							</button>
							<button className="btn btn-square btn-ghost hover:bg-white/5 text-muted hover:text-white">
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
						<h3 className="text-lg font-bold text-white mb-3">About</h3>
						<p className="text-muted text-sm leading-relaxed mb-4">{club.description || "No description available."}</p>
						{club.contactEmail && <div className="text-xs text-muted mb-2">Contact: {club.contactEmail}</div>}
						{club.contactPhone && <div className="text-xs text-muted">Phone: {club.contactPhone}</div>}
					</div>

					{/* Teams List */}
					<div className="p-6 rounded-2xl bg-white/5 border border-white/5">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold text-white">Teams ({teams.length})</h3>
						</div>
						{teams.length === 0 ? (
							<p className="text-muted text-sm">No teams yet.</p>
						) : (
							<div className="space-y-3">
								{teams.slice(0, 5).map((team) => (
									<div
										key={team.id}
										className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-background-light flex items-center justify-center text-xs font-bold text-muted group-hover:text-white transition-colors">
												{team.name.substring(0, 1)}
											</div>
											<div>
												<div className="text-sm font-semibold text-white group-hover:text-accent transition-colors">{team.name}</div>
												<div className="text-xs text-muted">{team.members?.length || 0} members</div>
											</div>
										</div>
										{team.skillLevel && (
											<div className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20">
												{team.skillLevel}
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>

					{/* Gallery Preview */}
					<div className="p-6 rounded-2xl bg-white/5 border border-white/5">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold text-white">Media</h3>
							<ImageIcon size={16} className="text-muted" />
						</div>
						<div className="grid grid-cols-3 gap-2">
							{[1, 2, 3, 4, 5].map((_, i) => (
								<div
									key={i}
									className="aspect-square rounded-lg bg-background-light overflow-hidden relative cursor-pointer hover:opacity-80 transition-opacity">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={`/api/placeholder/100/100?text=${i}`}
										alt=""
										className="w-full h-full object-cover"
										onError={(e) => {
											e.currentTarget.style.display = "none";
											e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center");
											const icon = document.createElement("div");
											icon.innerHTML =
												'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted/30"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
											e.currentTarget.parentElement?.appendChild(icon);
										}}
									/>
								</div>
							))}
							<div className="aspect-square rounded-lg bg-background-light border border-white/10 flex items-center justify-center text-xs text-muted cursor-pointer hover:text-white hover:border-white/20 transition-colors">
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
							<h2 className="text-xl font-bold text-white">Upcoming Events</h2>
							<div className="flex gap-2">{/* Custom arrows could go here */}</div>
						</div>

						<div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
							{MOCK_EVENTS.length === 0 ? (
								<div className="w-full p-8 text-center text-muted rounded-2xl bg-white/5 border border-white/5">
									<Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
									<p>No upcoming events</p>
								</div>
							) : (
								MOCK_EVENTS.map((event) => (
									<div
										key={event.id}
										className="snap-start min-w-[280px] p-4 rounded-2xl bg-background border border-white/5 hover:border-accent/50 transition-all group cursor-pointer">
										<div className="flex items-start justify-between mb-3">
											{/* Date Box */}
											<div className="flex flex-col items-center justify-center w-12 h-14 rounded-lg bg-white/5 border border-white/10">
												<span className="text-accent font-bold text-lg leading-none">{event.date}</span>
												<span className="text-[10px] text-muted uppercase font-medium">{event.month}</span>
											</div>
											<div className="px-2 py-1 rounded text-[10px] bg-white/5 text-muted border border-white/5">2h Duration</div>
										</div>

										<h4 className="font-bold text-white text-lg truncate pr-2 group-hover:text-accent transition-colors">{event.title}</h4>

										<div className="mt-2 space-y-1">
											<div className="flex items-center gap-2 text-xs text-muted">
												<Calendar size={12} /> {event.time}
											</div>
											<div className="flex items-center gap-2 text-xs text-muted truncate">
												<MapPin size={12} /> {event.location}
											</div>
										</div>

										{/* Spots Progress */}
										<div className="mt-4">
											<div className="flex justify-between text-[10px] text-muted mb-1">
												<span>Attendees</span>
												<span>{event.spots}</span>
											</div>
											<div className="h-1.5 w-full bg-background-light rounded-full overflow-hidden">
												<div className="h-full bg-primary w-[85%] rounded-full"></div>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</section>

					{/* Section: News Feed */}
					<section>
						{/* Tabs */}
						<div className="flex items-center gap-6 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
							{["News", "Match Results", "Announcements"].map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab.toLowerCase().split(" ")[0])}
									className={`pb-3 text-sm font-medium relative transition-colors whitespace-nowrap ${
										activeTab === tab.toLowerCase().split(" ")[0] ? "text-accent" : "text-muted hover:text-gray-300"
									}`}>
									{tab}
									{activeTab === tab.toLowerCase().split(" ")[0] && (
										<span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
									)}
								</button>
							))}
						</div>

						{/* Posts List */}
						<div className="space-y-6">
							{MOCK_POSTS.map((post) => (
								<div key={post.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
									{/* Post Header */}
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary p-[2px]">
												<div className="w-full h-full rounded-full bg-background-dark overflow-hidden flex items-center justify-center">
													{club.logoUrl && !logoError ? (
														/* eslint-disable-next-line @next/next/no-img-element */
														<img
															src={club.logoUrl}
															alt=""
															className="w-full h-full object-cover"
															onError={() => setLogoError(true)}
														/>
													) : (
														<Shield className="text-muted/50 w-6 h-6" />
													)}
												</div>
											</div>
											<div>
												<div className="text-sm font-bold text-white">{club.name}</div>
												<div className="text-xs text-muted">{post.time}</div>
											</div>
										</div>
										<button className="text-muted hover:text-white">
											<MoreHorizontal size={18} />
										</button>
									</div>

									{/* Post Content */}
									<p className="text-gray-300 text-sm leading-relaxed mb-3">{post.content}</p>

									{/* Post Image */}
									{post.image && (
										<div className="rounded-xl overflow-hidden mb-4 border border-white/5 bg-background-light">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img src={post.image} alt="Post attachment" className="w-full h-auto object-cover max-h-80" />
										</div>
									)}

									{/* Post Actions */}
									<div className="flex items-center gap-6 pt-3 border-t border-white/5">
										<button className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors group">
											<Heart size={18} className="group-hover:fill-accent" />
											<span>{post.likes}</span>
										</button>
										<button className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
											<MessageCircle size={18} />
											<span>{post.comments}</span>
										</button>
										<button className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors ml-auto">
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
