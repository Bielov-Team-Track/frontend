import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Bielov Volleyer - Volleyball Community Platform",
	description:
		"Connect with volleyball players, join clubs, organize events, and track your progress. Everything your volleyball community needs in one place.",
	keywords: ["volleyball", "sports", "community", "events", "teams", "clubs", "tournaments"],
	openGraph: {
		title: "Bielov Volleyer - Volleyball Community Platform",
		description: "Connect with volleyball players, join clubs, organize events, and track your progress.",
		type: "website",
	},
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
