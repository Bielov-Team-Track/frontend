import { redirect } from "next/navigation";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: Props) {
	const { id } = await params;
	redirect(`/hub/teams/${id}/events`);
}
