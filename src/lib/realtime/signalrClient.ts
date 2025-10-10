import {
	HttpTransportType,
	HubConnection,
	HubConnectionBuilder,
	HubConnectionState,
	IHttpConnectionOptions,
	LogLevel,
} from "@microsoft/signalr";
import { EVENTS_API_URL } from "../constants";

class SignalRClient {
	private static instance: SignalRClient;
	private connection: HubConnection | null = null;
	private started: boolean = false;
	private onSyncNeeded?: () => Promise<void>;

	private constructor() {}

	public static getInstance(): SignalRClient {
		if (!SignalRClient.instance) {
			SignalRClient.instance = new SignalRClient();
		}
		return SignalRClient.instance;
	}

	public setSyncCallback(callback: () => Promise<void>): void {
		this.onSyncNeeded = callback;
	}

	public getConnection(): HubConnection | null {
		return this.connection;
	}

	public async start(hub: string, token?: string): Promise<HubConnection> {
		if (
			this.connection &&
			this.connection.state === HubConnectionState.Connected
		) {
			return this.connection;
		}

		const apiBase = EVENTS_API_URL;
		const hubUrl = `${apiBase}/hubs/${hub}`;

		const options: IHttpConnectionOptions = {
			accessTokenFactory: token ? () => token : undefined,
			transport:
				HttpTransportType.LongPolling |
				HttpTransportType.WebSockets |
				HttpTransportType.ServerSentEvents, // All transports: WebSockets | ServerSentEvents | LongPolling
			withCredentials: true, // For CORS support
		};

		this.connection = new HubConnectionBuilder()
			.withUrl(hubUrl, options)
			.withAutomaticReconnect({
				nextRetryDelayInMilliseconds: (retryContext) => {
					const base = 500;
					const max = 30000;
					const attempt = retryContext.previousRetryCount + 1;
					// Exponential backoff with jitter
					const delay = Math.min(base * Math.pow(2, attempt), max);
					const jitter = delay * 0.1 * Math.random();
					return delay + jitter;
				},
			})
			.configureLogging(LogLevel.Error)
			.build();

		// Enhanced connection event handlers
		this.connection.onreconnected(async () => {
			if (this.onSyncNeeded) {
				try {
					await this.onSyncNeeded();
				} catch (error) {
					console.error("Position sync failed after reconnection:", error);
				}
			}
		});

		this.connection.onclose(async (error) => {
			this.started = false;

			// Attempt to restart connection if it was unexpected
			if (error && !this.connection) {
				try {
					await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
					await this.start(hub, token);
				} catch (restartError) {
					console.error("Failed to restart connection:", restartError);
				}
			}
		});

		if (!this.started) {
			await this.connection.start();
			this.started = true;
		}

		return this.connection;
	}

	public async stop(): Promise<void> {
		if (
			this.connection &&
			this.connection.state !== HubConnectionState.Disconnected
		) {
			await this.connection.stop();
			this.started = false;
		}
	}
}

export default SignalRClient.getInstance();
