"use client";

import Loader from "@/components/ui/loader";
import dynamic from "next/dynamic";
import { useClubContext } from "./layout";

// Lazy load PostFeed - heavy component with rich text editor, emoji picker, etc.
const PostFeed = dynamic(
	() => import("@/components/features/posts").then((mod) => mod.PostFeed),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center py-12">
				<Loader size="lg" />
			</div>
		),
	}
);

export default function ClubOverviewPage() {
	const { club } = useClubContext();

	if (!club) return null;

	return <PostFeed contextType={"club"} contextId={club.id} contextName={club.name} />;
}
