import {
	HttpTransportType,
	HubConnection,
	HubConnectionBuilder,
	HubConnectionState,
	IHttpConnectionOptions,
	LogLevel,
} from "@microsoft/signalr";

/**
 * Configuration for establishing a SignalR hub connection
 */
export interface ConnectionConfig {
	/** Base URL of the service (e.g., MESSAGES_API_URL, EVENTS_API_URL) */
	baseUrl: string;
	/** Hub name to connect to (e.g., 'messaging', 'position', 'payments') */
	hub: string;
	/** Optional authentication token */
	token?: string;
}

/**
 * Callbacks for connection lifecycle events
 */
export interface ConnectionCallbacks {
	/** Called when connection is successfully reconnected after a drop */
	onReconnected?: () => Promise<void> | void;
	/** Called when connection is closed (includes error if unexpected) */
	onClose?: (error?: Error) => void;
}

/**
 * Manages multiple independent SignalR hub connections across different services.
 *
 * This class allows you to maintain separate connections to different hubs
 * (e.g., messaging, position, payments) on different services (e.g., messages-service,
 * events-service) without conflicts.
 *
 * @example
 * ```ts
 * // Connect to messaging hub on messages service
 * const messagingConnection = await signalRManager.start({
 *   baseUrl: MESSAGES_API_URL,
 *   hub: 'messaging',
 *   token: accessToken
 * });
 *
 * // Connect to position hub on events service
 * const positionConnection = await signalRManager.start({
 *   baseUrl: EVENTS_API_URL,
 *   hub: 'position',
 *   token: accessToken
 * });
 * ```
 */
class SignalRConnectionManager {
	/** Map of active connections keyed by "baseUrl:hub" */
	private connections: Map<string, HubConnection> = new Map();
	/** Map of callbacks keyed by "baseUrl:hub" */
	private callbacks: Map<string, ConnectionCallbacks> = new Map();

	/**
	 * Generates a unique key for a connection based on baseUrl and hub name
	 */
	private getConnectionKey(baseUrl: string, hub: string): string {
		// Normalize baseUrl by removing trailing slashes
		const normalizedUrl = baseUrl.replace(/\/+$/, "");
		return `${normalizedUrl}:${hub}`;
	}

	/**
	 * Starts a SignalR connection to the specified hub.
	 * If a connection already exists and is connected, returns the existing connection.
	 *
	 * @param config - Connection configuration
	 * @param callbacks - Optional lifecycle callbacks
	 * @returns Promise resolving to the hub connection
	 */
	public async start(
		config: ConnectionConfig,
		callbacks?: ConnectionCallbacks
	): Promise<HubConnection> {
		const { baseUrl, hub, token } = config;
		const key = this.getConnectionKey(baseUrl, hub);

		// Check if connection already exists and is connected
		const existingConnection = this.connections.get(key);
		if (
			existingConnection &&
			existingConnection.state === HubConnectionState.Connected
		) {
			return existingConnection;
		}

		const hubUrl = `${baseUrl}/hubs/${hub}`;

		const options: IHttpConnectionOptions = {
			accessTokenFactory: token ? () => token : undefined,
			transport:
				HttpTransportType.LongPolling |
				HttpTransportType.WebSockets |
				HttpTransportType.ServerSentEvents,
			withCredentials: true,
		};

		const connection = new HubConnectionBuilder()
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

		// Store callbacks for this connection
		if (callbacks) {
			this.callbacks.set(key, callbacks);
		}

		// Enhanced connection event handlers
		connection.onreconnected(async () => {
			const storedCallbacks = this.callbacks.get(key);
			if (storedCallbacks?.onReconnected) {
				try {
					await storedCallbacks.onReconnected();
				} catch (error) {
					console.error(
						`[SignalR:${hub}] Reconnection callback failed:`,
						error
					);
				}
			}
		});

		connection.onclose(async (error) => {
			const storedCallbacks = this.callbacks.get(key);
			if (storedCallbacks?.onClose) {
				storedCallbacks.onClose(error);
			}

			// Remove connection from map when closed
			this.connections.delete(key);
			this.callbacks.delete(key);

			// Attempt to restart connection if it was unexpected
			if (error) {
				console.warn(
					`[SignalR:${hub}] Connection closed unexpectedly, attempting restart...`
				);
				try {
					await new Promise((resolve) => setTimeout(resolve, 5000));
					await this.start(config, callbacks);
				} catch (restartError) {
					console.error(
						`[SignalR:${hub}] Failed to restart connection:`,
						restartError
					);
				}
			}
		});

		await connection.start();
		this.connections.set(key, connection);

		return connection;
	}

	/**
	 * Stops a specific hub connection
	 *
	 * @param baseUrl - Base URL of the service
	 * @param hub - Hub name
	 */
	public async stop(baseUrl: string, hub: string): Promise<void> {
		const key = this.getConnectionKey(baseUrl, hub);
		const connection = this.connections.get(key);

		if (
			connection &&
			connection.state !== HubConnectionState.Disconnected
		) {
			await connection.stop();
			this.connections.delete(key);
			this.callbacks.delete(key);
		}
	}

	/**
	 * Gets the connection instance for a specific hub
	 *
	 * @param baseUrl - Base URL of the service
	 * @param hub - Hub name
	 * @returns The hub connection or null if not found
	 */
	public getConnection(baseUrl: string, hub: string): HubConnection | null {
		const key = this.getConnectionKey(baseUrl, hub);
		return this.connections.get(key) || null;
	}

	/**
	 * Stops all active connections
	 * Useful for cleanup on app unmount or logout
	 */
	public async stopAll(): Promise<void> {
		const stopPromises = Array.from(this.connections.values()).map(
			(connection) => {
				if (connection.state !== HubConnectionState.Disconnected) {
					return connection.stop();
				}
				return Promise.resolve();
			}
		);

		await Promise.all(stopPromises);
		this.connections.clear();
		this.callbacks.clear();
	}

	/**
	 * Gets the number of active connections
	 */
	public get activeConnectionCount(): number {
		return this.connections.size;
	}

	/**
	 * Checks if a specific connection exists and is connected
	 */
	public isConnected(baseUrl: string, hub: string): boolean {
		const connection = this.getConnection(baseUrl, hub);
		return connection?.state === HubConnectionState.Connected;
	}
}

// Export singleton instance
const signalRManager = new SignalRConnectionManager();
export default signalRManager;
