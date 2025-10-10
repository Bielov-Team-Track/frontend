import Link from "next/link";

const ErrorPage = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background">
			<h1 className="text-4xl font-bold mb-4 text-accent">
				Something went wrong
			</h1>
			<p className="text-lg mb-8 text-muted">
				Our services are unwell. Please try again later.
			</p>
			<Link
				href="/"
				className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/60 transition"
			>
				Go to Home
			</Link>
		</div>
	);
};

export default ErrorPage;
