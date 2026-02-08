import { redirect } from "next/navigation";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function TeamSettingsPage({ params }: Props) {
	const { id } = await params;
	redirect(`/hub/teams/${id}/settings/general`);
}
