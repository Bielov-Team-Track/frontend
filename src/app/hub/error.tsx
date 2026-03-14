"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function HubError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<div className="flex flex-1 items-center justify-center p-8">
			<div className="text-center space-y-4 max-w-md">
				<h2 className="text-xl font-semibold">Something went wrong</h2>
				<p className="text-muted-foreground text-sm">
					An unexpected error occurred. Our team has been notified and is looking into it.
				</p>
				<button
					onClick={reset}
					className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm"
				>
					Try again
				</button>
			</div>
		</div>
	);
}
