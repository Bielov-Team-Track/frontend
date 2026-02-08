"use client";
import Link from "@/components/ui/link";
const Breadcrumbs = () => {
	return (
		<nav className="flex items-center space-x-2 ml-2">
			<ol className="list-reset flex items-center">
				<li>
					<Link href="/hub">
						Home
					</Link>
				</li>
				<li className="mx-2">/</li>
				<li>
					<span className="">Current Page</span>
				</li>
			</ol>
		</nav>
	);
};

export default Breadcrumbs;
