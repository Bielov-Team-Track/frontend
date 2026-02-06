/**
 * Responsive utility classes and breakpoints for the Bielov Spike app
 * Mobile-first responsive design patterns
 *
 * FONT SIZE STRATEGY:
 * - Mobile (320px-767px): 13-15px base, optimized for touch and small screens
 * - Tablet (768px-1023px): 16-18px base, balanced for medium screens
 * - Desktop (1024px+): 17-19px base, comfortable for larger screens
 * - All sizes include optimized line heights for readability
 */

import { cn } from "@/lib/utils";

export const breakpoints = {
	mobile: {
		small: 320,
		medium: 375,
		large: 425,
	},
	xs: 475,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	xxl: 1536,
	tablet: 768,
	desktop: 1024,
	desktopLarge: 1440,
} as const;

/**
 * Common responsive class patterns for components
 */
export const responsiveClasses = {
	// Container patterns
	container: {
		mobile: "max-w-mobile mx-auto px-4",
		tablet: "max-w-tablet mx-auto px-6",
		desktop: "max-w-desktop mx-auto px-8",
		full: "max-w-mobile mx-auto sm:max-w-tablet lg:max-w-desktop xl:max-w-none px-4 sm:px-6 lg:px-8",
	},

	// Text patterns with device-optimized sizing
	text: {
		// Primary headings
		heading: "text-mobile-lg sm:text-tablet-lg lg:text-2xl xl:text-3xl font-bold",
		subheading: "text-mobile-base sm:text-tablet-base lg:text-xl xl:text-2xl font-semibold",

		// Body text optimized for readability
		body: "text-mobile-sm sm:text-tablet-base lg:text-desktop-base",
		bodyLarge: "text-mobile-base sm:text-tablet-base lg:text-desktop-lg",

		// Small text and captions
		caption: "text-mobile-xs sm:text-mobile-sm lg:text-sm",
		small: "text-mobile-xs sm:text-xs",

		// Interactive elements
		button: "text-mobile-sm sm:text-tablet-base lg:text-desktop-base font-medium",
		link: "text-mobile-sm sm:text-tablet-base lg:text-desktop-base",

		// Form elements
		label: "text-mobile-sm sm:text-tablet-base lg:text-desktop-base font-medium",
		input: "text-mobile-base sm:text-tablet-base lg:text-desktop-base",

		// Navigation
		navMain: "text-mobile-base sm:text-tablet-base lg:text-desktop-base font-medium",
		navSecondary: "text-mobile-xs sm:text-mobile-sm lg:text-sm",
	},

	// Button patterns
	button: {
		primary: "btn btn-primary btn-sm sm:btn-md",
		secondary: "btn btn-secondary btn-sm sm:btn-md",
		ghost: "btn btn-ghost btn-sm sm:btn-md",
	},

	// Input patterns
	input: {
		default: "input input-bordered input-sm sm:input-md",
		select: "select select-bordered select-sm sm:select-md",
	},

	// Grid patterns
	grid: {
		responsive: "grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4",
		cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
		form: "grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4",
	},

	// Spacing patterns
	spacing: {
		section: "space-y-4 sm:space-y-6",
		component: "space-y-2 sm:space-y-3",
		tight: "space-y-1 sm:space-y-2",
	},

	// Safe area handling for mobile
	safeArea: {
		top: "pt-safe-top",
		bottom: "pb-safe-bottom",
		left: "pl-safe-left",
		right: "pr-safe-right",
		full: "pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right",
	},
} as const;

/**
 * Utility function to conditionally apply responsive classes
 * Note: Renamed to avoid conflict with the main cn utility from clsx/tailwind-merge
 */
export function classNames(...classes: (string | undefined | false)[]): string {
	return classes.filter(Boolean).join(" ");
}

/**
 * Get responsive class based on screen size priorities
 * @param classes Object with breakpoint keys and class values
 * @returns Combined responsive classes
 */
export function responsive(classes: Partial<Record<keyof typeof breakpoints | "base", string>>): string {
	const { base = "", xs, sm, md, lg, xl, xxl } = classes;

	return cn(base, xs && `xs:${xs}`, sm && `sm:${sm}`, md && `md:${md}`, lg && `lg:${lg}`, xl && `xl:${xl}`, xxl && `2xl:${xxl}`);
}
