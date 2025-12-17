"use client";

import React, { useEffect, useRef, useState } from "react";
import { useClub } from "@/lib/club/ClubContext";
import { ChevronDown, Plus, Check, Shield, Crown, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ClubRole } from "@/lib/models/Club";

const getRoleIcon = (role?: ClubRole) => {
	switch (role) {
		case ClubRole.Owner:
			return <Crown size={10} className="text-accent" />;
		case ClubRole.Admin:
		case ClubRole.Coach:
			return <Shield size={10} className="text-primary" />;
		default:
			return <Users size={10} className="text-muted/70" />;
	}
};

const getRoleColor = (role?: ClubRole) => {
	switch (role) {
		case ClubRole.Owner:
			return "text-accent";
		case ClubRole.Admin:
		case ClubRole.Coach:
			return "text-primary";
		default:
			return "text-muted/70";
	}
};

const ClubSelector = () => {
	const { clubs, selectedClub, selectClub, isLoading } = useClub();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Loading state
	if (isLoading) {
		return (
			<div className="animate-pulse">
				<div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
					<div className="w-10 h-10 rounded-xl bg-white/10" />
					<div className="hidden xl:flex flex-col flex-1 gap-1.5">
						<div className="h-3.5 bg-white/10 rounded w-24" />
						<div className="h-2.5 bg-white/5 rounded w-16" />
					</div>
				</div>
			</div>
		);
	}

	// No clubs state
	if (clubs.length === 0) {
		return (
			<Link
				href="/clubs"
				className="group flex items-center justify-center xl:justify-start gap-3 p-3 rounded-xl
					bg-gradient-to-r from-accent/10 to-transparent
					border border-accent/20 hover:border-accent/40
					transition-all duration-300 hover:shadow-lg hover:shadow-accent/5"
			>
				<div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center
					group-hover:bg-accent/30 transition-colors duration-300">
					<Plus size={18} className="text-accent" />
				</div>
				<div className="hidden xl:block">
					<p className="text-sm font-medium text-white">Join a Club</p>
					<p className="text-xs text-muted/70">Find your community</p>
				</div>
			</Link>
		);
	}

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Selector Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`
					w-full flex items-center gap-3 p-2 rounded-xl
					transition-all duration-300 cursor-pointer
					${isOpen
						? "bg-white/10 ring-1 ring-white/10"
						: "bg-white/5 hover:bg-white/10"
					}
				`}
			>
				{/* Club Avatar */}
				<div className="relative flex-shrink-0">
					<div className={`
						w-10 h-10 rounded-xl overflow-hidden
						ring-2 transition-all duration-300
						${selectedClub
							? "ring-accent/30 shadow-lg shadow-accent/10"
							: "ring-white/10"
						}
					`}>
						{selectedClub?.logoUrl ? (
							<Image
								src={selectedClub.logoUrl}
								alt={selectedClub.name}
								fill
								className="object-cover"
							/>
						) : (
							<div className="w-full h-full bg-gradient-to-br from-accent/30 to-primary/30
								flex items-center justify-center">
								<Shield size={18} className="text-white/70" />
							</div>
						)}
					</div>
					{/* Role indicator dot */}
					{selectedClub?.role && (selectedClub.role === ClubRole.Owner || selectedClub.role === ClubRole.Admin) && (
						<div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full
							bg-background flex items-center justify-center ring-2 ring-background">
							{getRoleIcon(selectedClub.role)}
						</div>
					)}
				</div>

				{/* Club Info - Hidden on collapsed sidebar */}
				<div className="hidden xl:flex flex-col flex-1 min-w-0 text-left">
					<p className="text-sm font-medium text-white truncate">
						{selectedClub?.name || "Select Club"}
					</p>
					<p className={`text-xs truncate flex items-center gap-1 ${getRoleColor(selectedClub?.role)}`}>
						{getRoleIcon(selectedClub?.role)}
						<span>{selectedClub?.role || "Member"}</span>
					</p>
				</div>

				{/* Chevron - Hidden on collapsed sidebar */}
				<ChevronDown
					size={16}
					className={`
						hidden xl:block flex-shrink-0 text-muted/50
						transition-transform duration-300
						${isOpen ? "rotate-180" : ""}
					`}
				/>
			</button>

			{/* Dropdown Menu */}
			<div className={`
				absolute left-0 right-0 top-full mt-2 z-50
				transition-all duration-300 origin-top
				${isOpen
					? "opacity-100 scale-100 translate-y-0"
					: "opacity-0 scale-95 -translate-y-2 pointer-events-none"
				}
			`}>
				<div className="bg-background/95 backdrop-blur-xl rounded-xl border border-white/10
					shadow-2xl shadow-black/50 overflow-hidden">

					{/* Club List */}
					<div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 no-scrollbar">
						{clubs.map((club, index) => {
							const isSelected = selectedClub?.id === club.id;

							return (
								<button
									key={club.id}
									onClick={() => {
										selectClub(club);
										setIsOpen(false);
									}}
									className={`
										w-full flex items-center gap-3 p-2.5 rounded-lg
										transition-all duration-200 cursor-pointer text-left
										${isSelected
											? "bg-accent/15 ring-1 ring-accent/30"
											: "hover:bg-white/5"
										}
									`}
									style={{
										animationDelay: `${index * 30}ms`,
									}}
								>
									{/* Club Logo */}
									<div className={`
										relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0
										ring-1 transition-all duration-200
										${isSelected ? "ring-accent/50" : "ring-white/10"}
									`}>
										{club.logoUrl ? (
											<Image
												src={club.logoUrl}
												alt={club.name}
												fill
												className="object-cover"
											/>
										) : (
											<div className="w-full h-full bg-gradient-to-br from-accent/25 to-primary/25
												flex items-center justify-center">
												<Shield size={14} className="text-white/60" />
											</div>
										)}
									</div>

									{/* Club Details */}
									<div className="flex-1 min-w-0">
										<p className={`text-sm font-medium truncate transition-colors duration-200 ${
											isSelected ? "text-white" : "text-white/80"
										}`}>
											{club.name}
										</p>
										<p className={`text-xs truncate flex items-center gap-1 ${getRoleColor(club.role)}`}>
											{getRoleIcon(club.role)}
											<span>{club.role || "Member"}</span>
											{club.memberCount && (
												<span className="text-muted/50 ml-1">
													· {club.memberCount} members
												</span>
											)}
										</p>
									</div>

									{/* Selected Indicator */}
									{isSelected && (
										<div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent
											flex items-center justify-center">
											<Check size={12} className="text-white" strokeWidth={3} />
										</div>
									)}
								</button>
							);
						})}
					</div>

					{/* Divider */}
					<div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-3" />

					{/* Create/Find Club Link */}
					<div className="p-1.5">
						<Link
							href="/clubs"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-3 p-2.5 rounded-lg
								text-accent hover:bg-accent/10
								transition-all duration-200 group"
						>
							<div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center
								group-hover:bg-accent/20 transition-colors duration-200">
								<Plus size={16} className="text-accent" />
							</div>
							<span className="text-sm font-medium">Find or Create Club</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ClubSelector;
