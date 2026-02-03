"use client";

import { PostFeed } from "@/components/features/posts";
import { useGroupContext } from "../../layout";

export default function PostsTab() {
	const { group, groupId } = useGroupContext();

	return <PostFeed contextType="group" contextId={groupId} contextName={group?.name} />;
}
