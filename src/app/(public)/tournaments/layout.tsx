import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Tournaments",
	description: "Browse volleyball tournaments on Spike. Compete, track brackets, and follow results.",
	alternates: { canonical: "/tournaments" },
};

export default function TournamentsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
