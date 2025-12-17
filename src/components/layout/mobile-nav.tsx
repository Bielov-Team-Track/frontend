"use client";

import React from "react";
import Link from "next/link";
import { getNavigationItems } from "./shared/nav-items";
import { useNavigation } from "./shared/useNavigation";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";

const MobileNav = () => {
	const { isItemOrSubItemActive } = useNavigation();
	const unreadMessageCount = useUnreadMessageCount();
	const navigationItems = getNavigationItems(unreadMessageCount);

	// Get badge value for a navigation item
	const getBadgeValue = (item: typeof navigationItems[0]): number | undefined => {
		if (!item.badge) return undefined;

		// If badge is a function, call it
		if (typeof item.badge === "function") {
			return item.badge();
		}

		return item.badge;
	};

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
					const badgeValue = getBadgeValue(item);
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
							<div className="relative">
								{item.logoUrl ? (
									<img
										src={item.logoUrl}
										alt={`${item.name} logo`}
										className="w-[18px] h-[18px] rounded-full object-cover"
									/>
								) : item.color ? (
									<span
										className="rounded-full"
										style={{
											width: 18,
											height: 18,
											backgroundColor: item.color,
											display: "block",
										}}
									/>
								) : (
									<Icon size={18} />
								)}
								{badgeValue && badgeValue > 0 && (
									<span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-error rounded-full">
										{badgeValue > 99 ? '99+' : badgeValue}
									</span>
								)}
							</div>
							<span className="text-xs font-medium">{item.name}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
};

export default MobileNav;
