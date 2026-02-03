import { redirect } from "next/navigation";

interface DrillDetailRedirectProps {
	params: { id: string };
}

export default function DrillDetailRedirect({ params }: DrillDetailRedirectProps) {
	redirect(`/dashboard/training/drills/${params.id}`);
}
