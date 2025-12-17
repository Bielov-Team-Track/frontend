import ClubDetailClient from "./ClubDetailClient";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function ClubDetailPage({ params }: Props) {
	const { id } = await params;
	return <ClubDetailClient clubId={id} />;
}
