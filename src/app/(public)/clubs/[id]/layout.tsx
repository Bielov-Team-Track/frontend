import type { Metadata } from "next";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8000";

// ISR: revalidate every 5 minutes. The club page is a client component that
// fetches dynamic data (members, posts) via React Query, so the static shell
// (metadata + layout) can be cached safely.
export const revalidate = 300;

export async function generateStaticParams() {
	try {
		const res = await fetch(`${INTERNAL_API_URL}/clubs/v1/clubs?pageSize=200`);
		if (res.ok) {
			const data = await res.json();
			return (data.items || []).map((c: { id: string }) => ({ id: c.id }));
		}
	} catch {
		/* non-fatal - fall back to on-demand generation */
	}
	return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params;
	let club = null;
	try {
		const res = await fetch(`${INTERNAL_API_URL}/clubs/v1/clubs/${id}`);
		if (res.ok) club = await res.json();
	} catch {
		/* fallback */
	}

	if (!club) {
		return { title: "Club Not Found" };
	}

	return {
		title: club.name,
		description: club.description ? club.description.slice(0, 160) : `Join ${club.name} on Spike`,
		openGraph: {
			title: club.name,
			description: club.description?.slice(0, 160),
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: club.name,
			description: club.description?.slice(0, 120),
		},
		alternates: {
			canonical: `/clubs/${id}`,
		},
	};
}

export default function ClubLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
