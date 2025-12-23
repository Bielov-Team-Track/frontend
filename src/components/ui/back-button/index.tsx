"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { ArrowLeft as BackIcon } from "lucide-react";

function BackButton() {
	const router = useRouter();

	return (
		<button className="absolute left-4 top-4" onClick={router.back}>
			<BackIcon size={"1.5rem"} />
		</button>
	);
}

export default BackButton;
