import Loader from "@/components/ui/loader";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";

function Auth({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	return null;
}

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<Auth>
			<Component {...pageProps} />
		</Auth>
	);
}

export default MyApp;
