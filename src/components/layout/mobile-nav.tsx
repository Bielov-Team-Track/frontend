"use client";

import React from "react";
import Link from "next/link";
import { getNavigationItems } from "./shared/nav-items";
import { useNavigation } from "./shared/useNavigation";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";
import { useRoleSummary } from "@/hooks/useRoleSummary";

const MobileNav = () => {
	const { isItemOrSubItemActive } = useNavigation();
	const unreadMessageCount = useUnreadMessageCount();
	const { data: roleSummary } = useRoleSummary();
	const navigationItems = getNavigationItems(unreadMessageCount, [], roleSummary ?? null);

	// Get badge value for a navigation item
	const getBadgeValue = (item: typeof navigationItems[0]): number | undefined => {
		if (!item.badge) return undefined;

		// If badge is a function, call it
		if (typeof item.badge === "function") {
			return item.badge();
		}

		return item.badge;
	};

	// Filter items based on role visibility before flattening
	const visibleItems = navigationItems.filter(
		(item) => !item.visible || item.visible(roleSummary ?? null)
	);

	// Flatten navigation items for mobile (no nested items in mobile nav)
	const flattenedItems = visibleItems.flatMap((item) => {
		if (item.subItems) {
			// Filter sub-items by visibility if they have the property
			return item.subItems.filter(
				(subItem) => subItem.href && (!subItem.visible || subItem.visible(roleSummary ?? null))
			);
		}
		return item.href ? [item] : [];
	});

	// Map item counts to Tailwind classes (dynamic classes don't work with Tailwind's scanner)
	const gridColsMap: Record<number, string> = {
		2: "grid-cols-2",
		3: "grid-cols-3",
		4: "grid-cols-4",
		5: "grid-cols-5",
		6: "grid-cols-6",
		7: "grid-cols-7",
		8: "grid-cols-8",
	};

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border sm:hidden">
			<div className={`grid ${gridColsMap[flattenedItems.length] || "grid-cols-5"} h-16`}>
				{flattenedItems.map((item) => {
					const Icon = item.icon;
					const isActive = isItemOrSubItemActive(item);
					const badgeValue = getBadgeValue(item);
					return (
						<Link
							key={item.name}
							href={item.href!}
							className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
								isActive
									? "text-primary bg-primary/10"
									: "text-muted-foreground hover:text-primary hover:bg-primary/5"
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
									<span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-error-foreground bg-error rounded-full">
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
