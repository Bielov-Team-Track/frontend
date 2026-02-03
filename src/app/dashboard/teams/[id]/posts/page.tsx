"use client";

import { PostFeed } from "@/components/features/posts";
import { useTeamContext } from "../layout";

export default function TeamPostsPage() {
	const { team, teamId } = useTeamContext();

	return <PostFeed contextType="team" contextId={teamId} contextName={team?.name} />;
}
