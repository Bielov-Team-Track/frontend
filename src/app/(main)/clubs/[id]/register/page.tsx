import { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";

type Props = {
	params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return {
		title: `Join Club | Bielov Volleyer`,
	};
}

export default function RegisterPage({ params }: Props) {
	return <RegisterPageClient clubSlug={params.id} />;
}
