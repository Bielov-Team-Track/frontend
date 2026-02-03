import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "volleyer.s3.eu-west-2.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "www.gravatar.com",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
			},
		],
		// Enable image optimization in production for better LCP
		unoptimized: false,
	},
	serverExternalPackages: ["@microsoft/signalr"],

	// Optimize package imports for better tree-shaking
	experimental: {
		optimizePackageImports: [
			// External packages
			"lucide-react",
			"@base-ui-components/react",
			"framer-motion",
			"@tanstack/react-query",
			"@tanstack/react-table",
			"date-fns",
			"@tiptap/react",
			"@tiptap/starter-kit",
			"@tiptap/core",
			// Internal barrel exports (if supported)
			"@/components",
			"@/components/ui",
			"@/components/layout",
			"@/components/features",
			"@/providers",
			"@/hooks",
		],
	},
	env: {
		CUSTOM_KEY: process.env.CUSTOM_KEY,
	},
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{
						key: "Access-Control-Allow-Origin",
						value: process.env.ALLOWED_ORIGIN || "*",
					},
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
					},
				],
			},
		];
	},
};

export default withBundleAnalyzer(nextConfig);
