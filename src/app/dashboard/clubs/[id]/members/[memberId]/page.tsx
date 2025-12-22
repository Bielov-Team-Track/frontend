import ClubMemberDetailClient from "./ClubMemberDetailClient";
import { getClub } from "@/lib/api/clubs";

interface Props {
	params: Promise<{ id: string; memberId: string }>;
}

export default async function ClubMemberDetailPage({ params }: Props) {
	const { id, memberId } = await params;
	const club = await getClub(id);
	return <ClubMemberDetailClient clubId={id} memberId={memberId} clubName={club.name} />;
}
