"use client";

import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";
import { useClub } from "@/providers";
import { ChevronDown, ChevronRight, Volleyball } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getNavigationItems, NavigationItem } from "../shared/nav-items";
import { useNavigation } from "../shared/useNavigation";

// Helper to render item icon (logoUrl > color > icon)
const ItemIcon = ({ item, size, className = "" }: { item: NavigationItem; size: number; className?: string }) => {
	const Icon = item.icon;

	if (item.logoUrl) {
		return <Image src={item.logoUrl} alt={`${item.name} logo`} width={size} height={size} className={`rounded-full object-cover shrink-0 ${className}`} />;
	}

	if (item.color) {
		return (
			<span
				className={`shrink-0 rounded-full ${className}`}
				style={{
					width: size,
					height: size,
					backgroundColor: item.color,
				}}
			/>
		);
	}

	return <Icon size={size} className={`shrink-0 ${className}`} />;
};

// Recursive NavItem component
const NavItem = ({
	item,
	depth = 0,
	pathname,
	toggleExpanded,
	isItemOrSubItemActive,
	isExpanded,
	allItems,
}: {
	item: NavigationItem;
	depth?: number;
	pathname: string;
	toggleExpanded: (name: string) => void;
	isItemOrSubItemActive: (item: NavigationItem) => boolean;
	isExpanded: (item: NavigationItem, items: NavigationItem[]) => boolean;
	allItems: NavigationItem[];
}) => {
	const active = isItemOrSubItemActive(item);
	const itemExpanded = isExpanded(item, allItems);
	const hasSubItems = item.subItems && item.subItems.length > 0;

	// Get badge value
	const getBadgeValue = (): number | undefined => {
		if (!item.badge) return undefined;
		if (typeof item.badge === "function") return item.badge();
		return item.badge;
	};
	const badgeValue = getBadgeValue();

	// Root level items (depth 0)
	if (depth === 0) {
		return (
			<div>
				<div
					className={`
						group relative flex items-center justify-center xl:justify-start px-3 py-3 rounded-xl cursor-pointer transition-all duration-200
						${active ? "bg-linear-to-r from-accent/20 to-transparent text-accent" : "text-muted hover:text-white hover:bg-white/5"}
					`}>
					{active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />}

					{hasSubItems ? (
						<>
							<Link href={item.href} className="flex items-center flex-1" onClick={(e) => e.stopPropagation()}>
								<ItemIcon
									item={item}
									size={20}
									className={!item.logoUrl && !item.color ? (active ? "text-accent" : "text-muted group-hover:text-white") : ""}
								/>
								<span className="hidden xl:block flex-1 ml-4 font-medium text-sm">{item.name}</span>
							</Link>
							{badgeValue && badgeValue > 0 && (
								<span className="hidden xl:flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold text-white bg-error rounded-full shadow-xs">
									{badgeValue > 99 ? "99+" : badgeValue}
								</span>
							)}
							<button
								onClick={(e) => {
									e.stopPropagation();
									toggleExpanded(item.name);
								}}
								className="hidden xl:block ml-2 text-muted/50 hover:text-white p-1 -mr-1">
								{itemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
							</button>
						</>
					) : (
						<Link href={item.href} className="flex items-center w-full relative">
							<div className="relative">
								<ItemIcon
									item={item}
									size={20}
									className={!item.logoUrl && !item.color ? (active ? "text-accent" : "text-muted group-hover:text-white") : ""}
								/>
								{badgeValue && badgeValue > 0 && (
									<span className="xl:hidden absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-error rounded-full border border-background">
										{badgeValue > 99 ? "!" : badgeValue}
									</span>
								)}
							</div>
							<span className="hidden xl:block flex-1 ml-4 font-medium text-sm">{item.name}</span>
							{badgeValue && badgeValue > 0 && (
								<span className="hidden xl:flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold text-white bg-error rounded-full shadow-xs">
									{badgeValue > 99 ? "99+" : badgeValue}
								</span>
							)}
						</Link>
					)}
				</div>

				{/* Render sub items recursively */}
				{hasSubItems && itemExpanded && (
					<div className="hidden xl:block ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
						{item.subItems!.map((subItem) => (
							<NavItem
								key={subItem.name}
								item={subItem}
								depth={depth + 1}
								pathname={pathname}
								toggleExpanded={toggleExpanded}
								isItemOrSubItemActive={isItemOrSubItemActive}
								isExpanded={isExpanded}
								allItems={allItems}
							/>
						))}
					</div>
				)}
			</div>
		);
	}

	// Nested items (depth > 0)
	const isSubActive = pathname === item.href;

	return (
		<div>
			{hasSubItems ? (
				<div
					className={`
						flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
						${active ? "text-white bg-white/5" : "text-muted hover:text-white hover:bg-white/5"}
					`}>
					<Link href={item.href} className="flex items-center flex-1">
						<ItemIcon item={item} size={16} className="mr-3 opacity-70" />
						<span className="flex-1">{item.name}</span>
					</Link>
					<button onClick={() => toggleExpanded(item.name)} className="text-muted/50 hover:text-white p-1 -mr-1">
						{itemExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
					</button>
				</div>
			) : (
				<Link
					href={item.href}
					className={`
						flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
						${isSubActive ? "text-white bg-white/5" : "text-muted hover:text-white hover:bg-white/5"}
					`}>
					<ItemIcon item={item} size={16} className="mr-3 opacity-70" />
					<span>{item.name}</span>
				</Link>
			)}

			{/* Render nested sub items recursively */}
			{hasSubItems && itemExpanded && (
				<div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
					{item.subItems!.map((subItem) => (
						<NavItem
							key={subItem.name}
							item={subItem}
							depth={depth + 1}
							pathname={pathname}
							toggleExpanded={toggleExpanded}
							isItemOrSubItemActive={isItemOrSubItemActive}
							isExpanded={isExpanded}
							allItems={allItems}
						/>
					))}
				</div>
			)}
		</div>
	);
};

const Sidebar = () => {
	const { pathname, toggleExpanded, isItemOrSubItemActive, isExpanded, isActive } = useNavigation();

	const unreadMessageCount = useUnreadMessageCount();
	const clubs = useClub().clubs;
	const navigationItems = getNavigationItems(unreadMessageCount, clubs);

	return (
		<aside className="w-20 xl:w-72 h-[calc(100vh-2rem)] sticky top-4 z-40 flex flex-col bg-base-200 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
			{/* --- Logo Area --- */}
			<div className="h-24 flex items-center justify-center xl:justify-start xl:px-8 border-b border-white/5">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-linear-to-tr from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
						<Volleyball size={20} />
					</div>
					<span className="hidden xl:block text-2xl font-bold text-white tracking-tight">Volleyer</span>
				</div>
			</div>

			{/* --- Navigation --- */}
			<div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 no-scrollbar">
				<nav className="space-y-1">
					{navigationItems.map((item) => (
						<NavItem
							key={item.name}
							item={item}
							depth={0}
							pathname={pathname}
							toggleExpanded={toggleExpanded}
							isItemOrSubItemActive={isItemOrSubItemActive}
							isExpanded={isExpanded}
							allItems={navigationItems}
						/>
					))}
				</nav>
			</div>

			{/* --- Footer Area (Optional User Profile mini view) --- */}
			{/* <div className="p-4 border-t border-white/5">
                ...
            </div> */}
		</aside>
	);
};

export default Sidebar;
