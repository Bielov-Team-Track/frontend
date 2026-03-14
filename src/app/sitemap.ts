import { MetadataRoute } from "next";

const BASE_URL = "https://volleyspike.app";
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticPages: MetadataRoute.Sitemap = [
		{ url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
		{ url: `${BASE_URL}/clubs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
		{ url: `${BASE_URL}/tournaments`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
	];

	let eventEntries: MetadataRoute.Sitemap = [];
	try {
		const res = await fetch(`${INTERNAL_API_URL}/events/v1/events?pageSize=5000`);
		if (res.ok) {
			const data = await res.json();
			eventEntries = (data.items || []).map((e: { id: string; updatedAt?: string }) => ({
				url: `${BASE_URL}/events/${e.id}`,
				lastModified: e.updatedAt ? new Date(e.updatedAt) : new Date(),
				changeFrequency: "weekly" as const,
				priority: 0.8,
			}));
		}
	} catch {
		/* non-fatal */
	}

	let clubEntries: MetadataRoute.Sitemap = [];
	try {
		const res = await fetch(`${INTERNAL_API_URL}/clubs/v1/clubs?pageSize=5000`);
		if (res.ok) {
			const data = await res.json();
			clubEntries = (data.items || []).map((c: { id: string; updatedAt?: string }) => ({
				url: `${BASE_URL}/clubs/${c.id}`,
				lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
				changeFrequency: "weekly" as const,
				priority: 0.7,
			}));
		}
	} catch {
		/* non-fatal */
	}

	return [...staticPages, ...eventEntries, ...clubEntries];
}
