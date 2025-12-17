import GroupDetailClient from "./GroupDetailClient";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: Props) {
	const { id } = await params;
	return <GroupDetailClient groupId={id} />;
}