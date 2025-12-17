import InvitationPageClient from "./InvitationPageClient";

interface Props {
	params: Promise<{ slug: string; token: string }>;
}

export default async function InvitationPage({ params }: Props) {
	const { slug, token } = await params;
	return <InvitationPageClient clubSlug={slug} token={token} />;
}
