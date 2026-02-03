"use client";

import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";
import { useClub } from "@/providers";
import { ChevronDown, ChevronRight, Volleyball } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { getNavigationItems, NavigationItem } from "../shared/nav-items";
import { useNavigation } from "../shared/useNavigation";

// --- Types ---

interface SidebarItemProps {
	item: NavigationItem;
	depth?: number;
	pathname: string;
	onToggle: (name: string) => void;
	checkActive: (item: NavigationItem) => boolean;
	checkExpanded: (item: NavigationItem, items: NavigationItem[]) => boolean;
	allItems: NavigationItem[];
}

interface BadgeProps {
	value?: number;
	isCollapsed?: boolean;
}

// --- Helper Components ---

const ItemIcon = ({ item, size, isActive, className = "" }: { item: NavigationItem; size: number; isActive: boolean; className?: string }) => {
	// Priority: Logo URL -> Custom Color -> Icon Component
	if (item.logoUrl) {
		return <Image src={item.logoUrl} alt={`${item.name} logo`} width={size} height={size} className={`shrink-0 rounded-full object-cover ${className}`} />;
	}

	if (item.color) {
		return <span className={`shrink-0 rounded-full ${className}`} style={{ width: size, height: size, backgroundColor: item.color }} />;
	}

	const Icon = item.icon;
	// Dynamic color classes based on active state
	const colorClass = isActive ? "text-white" : "text-muted group-hover:text-white";

	return <Icon size={size} className={`shrink-0 ${colorClass} ${className}`} />;
};

const Badge = ({ value, isCollapsed = false }: BadgeProps) => {
	if (!value || value <= 0) return null;

	const displayValue = value > 99 ? (isCollapsed ? "!" : "99+") : value;

	// Collapsed View (Tablet / Mobile Icon-only)
	if (isCollapsed) {
		return (
			<span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-background bg-error text-[9px] font-bold text-white xl:hidden">
				{displayValue}
			</span>
		);
	}

	// Full View
	return (
		<span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-bold text-white shadow-xs">
			{displayValue}
		</span>
	);
};

// --- Recursive Item Component ---

const SidebarItem = ({ item, depth = 0, pathname, onToggle, checkActive, checkExpanded, allItems }: SidebarItemProps) => {
	const isActive = checkActive(item);
	const isExpanded = checkExpanded(item, allItems);
	const hasSubItems = !!item.subItems?.length;
	const isRoot = depth === 0;

	// Calculate badge value once
	const badgeValue = typeof item.badge === "function" ? item.badge() : item.badge;

	// Styles based on depth/nesting
	const containerBaseStyles = isRoot
		? "group relative flex items-center justify-center xl:justify-start px-3 py-3 rounded-xl transition-all duration-200"
		: "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors";

	const activeStyles = isActive ? (isRoot ? "bg-neutral-900 text-white" : "bg-white/5 text-white") : "text-muted hover:bg-white/5 hover:text-white";

	const iconSize = isRoot ? 20 : 16;
	const indentSize = isRoot ? "ml-5 pl-3" : "ml-4 pl-3";
	const textStyles = isRoot ? "md:hidden xl:block ml-4 font-medium text-sm" : "ml-3";

	// Render Content Wrapper (Link vs Button logic)
	const ItemContent = () => (
		<>
			<div className="relative shrink-0" title={item.name}>
				<ItemIcon item={item} size={iconSize} isActive={isActive} className={!isRoot ? "opacity-70" : ""} />
				{isRoot && <Badge value={badgeValue} isCollapsed={true} />}
			</div>

			<span className={`${textStyles} flex-1 truncate`}>{item.name}</span>

			{/* Desktop Full Badge */}
			<div className={isRoot ? "hidden xl:block" : ""}>
				<Badge value={badgeValue} />
			</div>
		</>
	);

	return (
		<div>
			<div className={`${containerBaseStyles} ${activeStyles} cursor-pointer`}>
				{hasSubItems ? (
					// Parent Item (Click to Toggle or Link)
					<>
						<Link href={item.href} className="flex min-w-0 flex-1 items-center" onClick={(e) => isRoot && e.stopPropagation()}>
							<ItemContent />
						</Link>

						{/* Toggle Button */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								onToggle(item.name);
							}}
							className={`p-1 text-muted/50 hover:text-white ${isRoot ? "hidden xl:block ml-2 -mr-1" : "-mr-1"}`}>
							{isExpanded ? <ChevronDown size={isRoot ? 14 : 12} /> : <ChevronRight size={isRoot ? 14 : 12} />}
						</button>
					</>
				) : (
					// Leaf Item (Direct Link)
					<Link href={item.href} className="flex min-w-0 flex-1 items-center w-full">
						<ItemContent />
					</Link>
				)}
			</div>

			{/* Recursive Sub-items */}
			{hasSubItems && isExpanded && (
				<div className={`${isRoot ? "hidden xl:block" : ""} mt-1 space-y-1 border-l border-white/10 ${indentSize}`}>
					{item.subItems!.map((subItem) => (
						<SidebarItem
							key={subItem.name}
							item={subItem}
							depth={depth + 1}
							pathname={pathname}
							onToggle={onToggle}
							checkActive={checkActive}
							checkExpanded={checkExpanded}
							allItems={allItems}
						/>
					))}
				</div>
			)}
		</div>
	);
};

// --- Sub-Layout Components ---

const MobileDrawer = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => (
	<>
		{/* Backdrop */}
		{isOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} aria-hidden="true" />}

		{/* Drawer */}
		<aside
			className={`
				fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-neutral-900 border-r border-white/5
				transition-transform duration-300 ease-in-out md:hidden
				${isOpen ? "translate-x-0" : "-translate-x-full"}
			`}>
			<div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-accent to-primary text-white shadow-lg shadow-orange-500/20">
						<Volleyball size={18} />
					</div>
					<span className="text-xl font-bold tracking-tight text-white">Volleyer</span>
				</div>
				<button onClick={onClose} className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white" aria-label="Close menu">
					<ChevronDown size={20} className="-rotate-90" />
				</button>
			</div>

			<div className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">{children}</div>
		</aside>
	</>
);

const DesktopSidebar = ({ children }: { children: React.ReactNode }) => (
	<aside className="hidden w-18 shrink-0 md:block xl:w-64">
		<div className="sticky top-0 max-h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4 no-scrollbar">{children}</div>
	</aside>
);

// --- Main Export ---

interface SidebarProps {
	isOpen?: boolean;
	onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
	// Hooks
	const { pathname, toggleExpanded, isItemOrSubItemActive, isExpanded } = useNavigation();
	const unreadMessageCount = useUnreadMessageCount();
	const { clubs } = useClub();

	// Data Preparation
	const navigationItems = useMemo(
		() => getNavigationItems(unreadMessageCount, clubs),
		[unreadMessageCount, clubs]
	);

	const renderNavItems = () => (
		<nav className="space-y-1">
			{navigationItems.map((item) => (
				<SidebarItem
					key={item.name}
					item={item}
					depth={0}
					pathname={pathname}
					onToggle={toggleExpanded}
					checkActive={isItemOrSubItemActive}
					checkExpanded={isExpanded}
					allItems={navigationItems}
				/>
			))}
		</nav>
	);

	return (
		<>
			<MobileDrawer isOpen={isOpen} onClose={onClose!}>
				{renderNavItems()}
			</MobileDrawer>

			<DesktopSidebar>{renderNavItems()}</DesktopSidebar>
		</>
	);
};

export default Sidebar;
