"use client";

import { DropdownMenuContent, DropdownMenuItem, DropdownMenu as DropdownMenuPrimitive, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import React from "react";

export interface DropdownMenuItem {
	label: string;
	disabled?: boolean;
	icon?: React.ReactNode;
	variant?: "default" | "destructive";
	onClick?: () => void;
}

export interface DropdownMenuProps {
	items?: DropdownMenuItem[];
}

function DropdownMenu({ items }: DropdownMenuProps) {
	return (
		<DropdownMenuPrimitive>
			<DropdownMenuTrigger className="p-2 rounded-lg hover:bg-hover text-muted-foreground transition-colors">
				<MoreHorizontal size={18} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{items?.map((item, index) => (
					<DropdownMenuItem onClick={() => item.onClick?.()} key={index} disabled={item.disabled} variant={item.variant || "default"}>
						{item.icon && item.icon}
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenuPrimitive>
	);
}

DropdownMenu.displayName = "Dropdown menu";

export { DropdownMenu };
export default DropdownMenu;
