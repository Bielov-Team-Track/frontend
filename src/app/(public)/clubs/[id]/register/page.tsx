import { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return {
		title: `Join Club | Spike`,
	};
}

export default async function RegisterPage({ params }: Props) {
	const parameters = await params;
	return <RegisterPageClient clubSlug={parameters.id} />;
}
