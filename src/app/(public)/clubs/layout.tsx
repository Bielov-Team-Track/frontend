import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Clubs",
	description: "Find and join volleyball clubs on Spike. Browse teams, view members, and register.",
	twitter: {
		card: "summary_large_image",
		title: "Volleyball Clubs | Spike",
		description: "Find and join volleyball clubs on Spike. Browse teams, view members, and register.",
	},
	alternates: { canonical: "/clubs" },
};

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
