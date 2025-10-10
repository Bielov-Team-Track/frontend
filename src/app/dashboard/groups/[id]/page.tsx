import React from "react";
import { notFound } from "next/navigation";

export default async function GroupPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	if (id) {
		notFound();
	}

	return (
		<div>
			<h1>Group {id}</h1>
			{/* TODO: implement group details page */}
		</div>
	);
}
