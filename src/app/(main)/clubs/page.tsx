"use client";

import {
	ArrowUpRight,
	Check,
	ChevronDown,
	MapPin,
	Search,
	Sun,
	Trophy,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";

// --- Mock Data ---
const CLUBS = [
	{
		id: 1,
		name: "Newcastle Spikers",
		location: "Newcastle, UK",
		members: 1240,
		level: "Advanced",
		surface: "Indoor",
		gender: "Mixed",
		banner: "/api/placeholder/800/300",
		logo: "/api/placeholder/100/100",
		isVerified: true,
	},
	{
		id: 2,
		name: "Durham Diggers",
		location: "Durham, UK",
		members: 420,
		level: "Social",
		surface: "Beach",
		gender: "Mixed",
		banner: "/api/placeholder/800/302",
		logo: "/api/placeholder/100/102",
		isVerified: false,
	},
	{
		id: 3,
		name: "Northumbria Elite",
		location: "Northumbria, UK",
		members: 80,
		level: "Elite",
		surface: "Indoor",
		gender: "Men",
		banner: "/api/placeholder/800/305",
		logo: "/api/placeholder/100/105",
		isVerified: true,
	},
];

// --- Configuration ---
const FILTERS = {
	level: {
		label: "Level",
		icon: Trophy,
		options: ["Beginner", "Intermediate", "Advanced", "Elite"],
	},
	surface: {
		label: "Type",
		icon: Sun,
		options: ["Indoor", "Beach", "Grass"],
	},
	gender: {
		label: "Gender",
		icon: Users,
		options: ["Men", "Women", "Mixed", "Juniors"],
	},
};

export default function ClubsDirectory() {
	// State for Dropdowns
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

	// State for Selected Filters
	const [selections, setSelections] = useState({
		level: [] as string[],
		surface: [] as string[],
		gender: [] as string[],
	});

	const toggleSelection = (
		category: keyof typeof selections,
		value: string
	) => {
		setSelections((prev) => {
			const current = prev[category];
			const isSelected = current.includes(value);
			return {
				...prev,
				[category]: isSelected
					? current.filter((item) => item !== value)
					: [...current, value],
			};
		});
	};

	// Calculate active count for a specific category
	const getActiveCount = (category: keyof typeof selections) =>
		selections[category].length;

	return (
		<div className="min-h-screen bg-base-100 text-gray-100 font-sans p-4 md:p-8 pb-20">
			{/* --- HEADER & SEARCH --- */}
			<div className="max-w-desktop mx-auto mb-10">
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
					<div>
						<h1 className="text-3xl font-bold text-white tracking-tight">
							Discover Clubs
						</h1>
						<p className="text-gray-400 text-sm mt-1">
							Find your team. Level up your game.
						</p>
					</div>

					<button className="btn bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-accent/50 transition-all gap-2">
						Create Club <ArrowUpRight size={16} />
					</button>
				</div>

				{/* Command Center Search Bar */}
				<div className="relative group z-20 mb-6">
					<div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-primary opacity-20 blur group-hover:opacity-40 transition duration-500 rounded-xl"></div>
					<div className="relative flex items-center bg-[#1A1A1A] rounded-xl p-2 shadow-2xl border border-white/10">
						<Search className="text-gray-400 ml-3" size={20} />
						<input
							type="text"
							placeholder="Search by name, city, or league..."
							className="bg-transparent border-none outline-none text-white px-4 py-2 w-full placeholder-gray-500 focus:ring-0"
						/>
						<div className="hidden md:flex items-center border-l border-white/10 pl-2 gap-2">
							<button className="px-4 py-2 text-sm text-gray-400 hover:text-white flex items-center gap-2 hover:bg-white/5 rounded-lg transition-colors">
								<MapPin size={16} /> Location
							</button>
							<button className="btn btn-sm bg-primary text-white border-none hover:bg-primary/90 px-6">
								Search
							</button>
						</div>
					</div>
				</div>

				{/* --- NEW FILTER ROW --- */}
				<div className="flex flex-wrap items-center gap-3 relative z-10">
					<div className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">
						Filters:
					</div>

					{/* Render Dropdowns Dynamically */}
					{(Object.keys(FILTERS) as Array<keyof typeof FILTERS>).map(
						(key) => {
							const config = FILTERS[key];
							const Icon = config.icon;
							const count = getActiveCount(key);
							const isOpen = activeDropdown === key;

							return (
								<div key={key} className="relative">
									<button
										onClick={() =>
											setActiveDropdown(
												isOpen ? null : key
											)
										}
										className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border
                      ${
							count > 0 || isOpen
								? "bg-accent/10 border-accent text-accent"
								: "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
						}
                    `}>
										<Icon size={14} />
										<span>{config.label}</span>
										{count > 0 && (
											<span className="flex items-center justify-center bg-accent text-white text-[10px] h-5 w-5 rounded-full ml-1">
												{count}
											</span>
										)}
										<ChevronDown
											size={14}
											className={`transition-transform duration-200 ${
												isOpen ? "rotate-180" : ""
											}`}
										/>
									</button>

									{/* The Dropdown Menu */}
									{isOpen && (
										<>
											<div
												className="fixed inset-0 z-30"
												onClick={() =>
													setActiveDropdown(null)
												}
											/>
											<div className="absolute top-full left-0 mt-2 w-56 bg-[#1E1E1E] border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
												<div className="p-1">
													{config.options.map(
														(option) => {
															const isSelected =
																selections[
																	key
																].includes(
																	option
																);
															return (
																<div
																	key={option}
																	onClick={() =>
																		toggleSelection(
																			key,
																			option
																		)
																	}
																	className={`
                                  flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors
                                  ${
										isSelected
											? "bg-white/10 text-white"
											: "text-gray-400 hover:bg-white/5 hover:text-gray-200"
									}
                                `}>
																	<span>
																		{option}
																	</span>
																	{isSelected && (
																		<Check
																			size={
																				14
																			}
																			className="text-accent"
																		/>
																	)}
																</div>
															);
														}
													)}
												</div>
												{/* Clear Action */}
												{count > 0 && (
													<div
														onClick={() =>
															setSelections(
																(prev) => ({
																	...prev,
																	[key]: [],
																})
															)
														}
														className="border-t border-white/5 p-2 text-center text-xs text-gray-500 hover:text-white cursor-pointer transition-colors">
														Clear {config.label}
													</div>
												)}
											</div>
										</>
									)}
								</div>
							);
						}
					)}

					{/* Clear All Button */}
					{getActiveCount("level") +
						getActiveCount("surface") +
						getActiveCount("gender") >
						0 && (
						<button
							onClick={() =>
								setSelections({
									level: [],
									surface: [],
									gender: [],
								})
							}
							className="ml-auto text-xs text-gray-500 hover:text-accent flex items-center gap-1 transition-colors">
							<X size={12} /> Reset All
						</button>
					)}
				</div>
			</div>

			{/* --- RESULTS GRID --- */}
			<div className="max-w-desktop mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{CLUBS.map((club) => (
					<div
						key={club.id}
						className="group relative bg-[#1E1E1E] rounded-2xl overflow-hidden border border-white/5 hover:border-accent/40 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
						{/* Banner */}
						<div className="h-28 overflow-hidden relative">
							<div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent z-10" />
							<img
								src={club.banner}
								alt="Banner"
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
							/>

							{/* Floating Status Badge inside banner */}
							<div className="absolute top-3 right-3 z-20 flex gap-1">
								<span className="px-2 py-1 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10">
									{club.level}
								</span>
							</div>
						</div>

						{/* Content */}
						<div className="px-5 pb-5 relative z-20 -mt-10">
							<div className="flex justify-between items-end mb-3">
								{/* Logo */}
								<div className="relative">
									<div className="w-16 h-16 rounded-xl bg-gray-800 border-4 border-[#1E1E1E] overflow-hidden">
										<img
											src={club.logo}
											alt="Logo"
											className="w-full h-full object-cover"
										/>
									</div>
									{club.isVerified && (
										<div className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full border-2 border-[#1E1E1E]">
											<Trophy size={10} />
										</div>
									)}
								</div>
							</div>

							<h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent transition-colors">
								{club.name}
							</h3>

							<div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
								<span className="flex items-center gap-1">
									<MapPin size={12} /> {club.location}
								</span>
								<span className="w-1 h-1 rounded-full bg-gray-600"></span>
								<span>{club.members} Members</span>
							</div>

							{/* Badges / Tags Row */}
							<div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
								<Badge icon={Sun} label={club.surface} />
								<Badge icon={Users} label={club.gender} />
							</div>
						</div>
					</div>
				))}

				{/* "Add Your Club" Card */}
				<div className="group relative rounded-2xl border border-dashed border-white/10 hover:border-accent/40 bg-transparent flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all min-h-[280px]">
					<div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-accent group-hover:text-white transition-colors mb-4">
						<ArrowUpRight size={24} />
					</div>
					<h3 className="text-lg font-bold text-white mb-2">
						List your Club
					</h3>
					<p className="text-sm text-gray-500 max-w-[200px]">
						Recruit players and manage events.
					</p>
				</div>
			</div>
		</div>
	);
}

// Helper for the little grey tags at the bottom of the card
function Badge({ icon: Icon, label }: { icon: any; label: string }) {
	return (
		<span className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] bg-white/5 text-gray-400 border border-white/5 group-hover:border-white/10 transition-colors">
			<Icon size={10} /> {label}
		</span>
	);
}
