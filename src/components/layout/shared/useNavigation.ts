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

	const isItemOrSubItemActive = (item: NavigationItem) => {
		if (pathname === item.href) return true;
		if (item.subItems) {
			return item.subItems.some((subItem) => pathname === subItem.href);
		}
		return false;
	};

	const isExpanded = (item: NavigationItem, items: NavigationItem[]) => {
		return (
			expandedItems.includes(item.name) ||
			item.subItems?.some((sub) => pathname === sub.href) ||
			false
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
