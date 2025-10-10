"use client";

import React from "react";
import Link from "next/link";
import { navigationItems } from "./shared/nav-items";
import { useNavigation } from "./shared/useNavigation";

const MobileNav = () => {
	const { isItemOrSubItemActive } = useNavigation();

	// Flatten navigation items for mobile (no nested items in mobile nav)
	const flattenedItems = navigationItems.flatMap((item) => {
		if (item.subItems) {
			return item.subItems;
		}
		return [item];
	});

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-200 sm:hidden">
			<div className={`grid grid-cols-${flattenedItems.length} h-16`}>
				{flattenedItems.map((item) => {
					const Icon = item.icon;
					const isActive = isItemOrSubItemActive(item);
					return (
						<Link
							key={item.name}
							href={item.href}
							className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
								isActive
									? "text-primary bg-primary/10"
									: "text-muted/70 hover:text-primary hover:bg-primary/5"
							}`}
						>
							<Icon size={18} />
							<span className="text-xs font-medium">{item.name}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
};

export default MobileNav;
