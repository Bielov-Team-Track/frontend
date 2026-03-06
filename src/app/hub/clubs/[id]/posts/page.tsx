"use client";

import { PostFeed } from "@/components/features/posts";
import { useClubContext } from "../layout";

export default function ClubPostsPage() {
	const { club, permissions } = useClubContext();

	if (!club) return null;

	return <PostFeed contextType="club" contextId={club.id} contextName={club.name} isAdmin={permissions.isAdminOrAbove} />;
}
