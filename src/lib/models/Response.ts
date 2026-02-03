export type Response<T = unknown> = {
	errorCode: number;
	result: T;
	errorMessage: string;
};
