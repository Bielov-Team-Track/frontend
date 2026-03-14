import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/hub/", "/admin/", "/api/", "/subscriptions/"],
			},
		],
		sitemap: "https://volleyspike.app/sitemap.xml",
	};
}
