import { AppProps } from "next/app";
import { useRouter } from "next/router";

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
