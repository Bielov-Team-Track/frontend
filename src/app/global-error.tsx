"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang="en">
			<body className="flex min-h-screen items-center justify-center bg-surface text-foreground font-sans">
				<div className="text-center space-y-4 p-8">
					<h1 className="text-2xl font-semibold">Something went wrong</h1>
					<p className="text-muted-foreground">An unexpected error occurred. Our team has been notified.</p>
					<button
						onClick={reset}
						className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
