"use client";

import ClubSubscriptionsSettings from "@/components/features/subscriptions/admin/ClubSubscriptionsSettings";
import { useParams } from "next/navigation";

export default function ClubSubscriptionsSettingsPage() {
	const params = useParams();
	const clubId = params.id as string;

	return <ClubSubscriptionsSettings clubId={clubId} />;
}
