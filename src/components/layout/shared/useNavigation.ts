import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { NavigationItem } from "./nav-items";

export const useNavigation = () => {
	const pathname = usePathname();
	const [expandedItems, setExpandedItems] = useState<string[]>([]);

	const toggleExpanded = (itemName: string) => {
		setExpandedItems((prev) =>
			prev.includes(itemName)
				? prev.filter((name) => name !== itemName)
				: [...prev, itemName],
		);
	};

	const isSubItemActive = (items: NavigationItem[]): boolean => {
		return items.some((sub) =>
			(sub.href && pathname === sub.href) ||
			(sub.subItems && isSubItemActive(sub.subItems))
		);
	};

	const isItemOrSubItemActive = (item: NavigationItem) => {
		if (item.href && pathname === item.href) return true;
		if (item.subItems) {
			return isSubItemActive(item.subItems);
		}
		return false;
	};

	const isExpanded = (item: NavigationItem, items: NavigationItem[]) => {
		return (
			expandedItems.includes(item.name) ||
			(item.subItems ? isSubItemActive(item.subItems) : false)
		);
	};

	const isActive = (href: string) => {
		return pathname === href;
	};

	const isRouteActive = (href: string) => {
		return pathname.startsWith(href);
	};

	return {
		pathname,
		expandedItems,
		toggleExpanded,
		isItemOrSubItemActive,
		isExpanded,
		isActive,
		isRouteActive,
	};
};
