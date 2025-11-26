"use client";

import React, { useEffect, useRef, useState } from "react";
import { useClub } from "@/lib/club/ClubContext";
import { FaChevronDown, FaPlus, FaCheck, FaBuilding } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

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

	if (isLoading) {
		return (
			<div className="px-4 py-2 animate-pulse">
				<div className="h-8 bg-gray-200 rounded w-full"></div>
			</div>
		);
	}

	if (clubs.length === 0) {
		return (
			<div className="px-4 py-2">
				<Link
					href="/clubs"
					className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-focus transition-colors"
				>
					<FaPlus className="mr-2" />
					Join Club
				</Link>
			</div>
		);
	}

	return (
		<div className="relative px-2 mb-4" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
			>
				<div className="flex-shrink-0 w-8 h-8 relative mr-3">
					{selectedClub?.logoUrl ? (
						<Image
							src={selectedClub.logoUrl}
							alt={selectedClub.name}
							fill
							className="rounded-full object-cover"
						/>
					) : (
						<div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-500">
							<FaBuilding />
						</div>
					)}
				</div>
				<div className="flex-1 min-w-0 hidden xl:block">
					<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
						{selectedClub?.name || "Select Club"}
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
						{selectedClub?.role || "Member"}
					</p>
				</div>
				<FaChevronDown
					className={`w-4 h-4 text-gray-400 transition-transform hidden xl:block ${
						isOpen ? "transform rotate-180" : ""
					}`}
				/>
			</button>

			{isOpen && (
				<div className="absolute z-50 w-full left-0 px-2 mt-1 min-w-[200px]">
					<div className="bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
						<div className="py-1">
							{clubs.map((club) => (
								<button
									key={club.id}
									onClick={() => {
										selectClub(club);
										setIsOpen(false);
									}}
									className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<div className="flex-shrink-0 w-6 h-6 relative mr-3">
										{club.logoUrl ? (
											<Image
												src={club.logoUrl}
												alt={club.name}
												fill
												className="rounded-full object-cover"
											/>
										) : (
											<div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-500">
												<FaBuilding />
											</div>
										)}
									</div>
									<span className="flex-1 truncate text-left">
										{club.name}
									</span>
									{selectedClub?.id === club.id && (
										<FaCheck className="w-4 h-4 text-accent" />
									)}
								</button>
							))}
							<div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
								<Link
									href="/clubs"
									className="flex items-center w-full px-4 py-2 text-sm text-accent hover:bg-gray-100 dark:hover:bg-gray-700"
									onClick={() => setIsOpen(false)}
								>
									<FaPlus className="mr-3 w-4 h-4" />
									Find or Create Club
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClubSelector;
