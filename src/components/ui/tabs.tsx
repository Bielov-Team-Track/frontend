"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			data-orientation={orientation}
			className={cn("gap-2 group/tabs flex data-[orientation=horizontal]:flex-col", className)}
			{...props}
		/>
	);
}

const tabsListVariants = cva(
	"rounded-xl p-1 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
	{
		variants: {
			variant: {
				default: "bg-surface-elevated",
				line: "gap-1 bg-transparent",
			},
			size: {
				sm: "h-8 p-0.5",
				default: "h-10 p-1",
				lg: "h-12 p-1.5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function TabsList({ className, variant, size, ...props }: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			data-variant={variant}
			data-size={size}
			className={cn(tabsListVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

const tabsTriggerVariants = cva(
	[
		// Base styles
		"gap-1.5 rounded-lg border border-transparent font-medium",
		"relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all",
		"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1",
		"disabled:pointer-events-none disabled:opacity-50",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0",
		// Text colors
		"text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
		// Active state
		"data-active:bg-background data-active:text-foreground data-active:shadow-sm",
		"dark:data-active:text-foreground dark:data-active:bg-input",
		// Line variant overrides
		"group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:shadow-none",
		"dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
		// Vertical orientation
		"group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start",
		// Line indicator (for line variant)
		"after:bg-foreground after:absolute after:opacity-0 after:transition-opacity",
		"group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-1.25 group-data-[orientation=horizontal]/tabs:after:h-0.5",
		"group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5",
		"group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
	],
	{
		variants: {
			size: {
				sm: "p-1 text-xs [&_svg:not([class*='size-'])]:size-3.5",
				default: "p-1.5 text-sm [&_svg:not([class*='size-'])]:size-4",
				lg: "p-2 text-base [&_svg:not([class*='size-'])]:size-5",
			},
		},
		defaultVariants: {
			size: "default",
		},
	}
);

function TabsTrigger({ className, size, ...props }: TabsPrimitive.Tab.Props & VariantProps<typeof tabsTriggerVariants>) {
	return <TabsPrimitive.Tab data-slot="tabs-trigger" className={cn(tabsTriggerVariants({ size }), className)} {...props} />;
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
	return <TabsPrimitive.Panel data-slot="tabs-content" className={cn("text-sm flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger, tabsTriggerVariants };
