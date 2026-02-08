import { redirect } from "next/navigation";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: Props) {
	const { id } = await params;
	redirect(`/hub/groups/${id}/events`);
}
