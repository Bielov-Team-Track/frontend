import { redirect } from "next/navigation";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function ClubSettingsPage({ params }: Props) {
	const { id } = await params;
	redirect(`/hub/clubs/${id}/settings/general`);
}
