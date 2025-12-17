import TeamDetailClient from "./TeamDetailClient";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: Props) {
	const { id } = await params;
	return <TeamDetailClient teamId={id} />;
}
