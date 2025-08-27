export interface IApiEndpoint {
	path: string;
	method: 'get' | 'post' | 'put' | 'delete';
	handler: IApiEndpointHandler;
}

export interface IApiEndpointHandler {
	(args: Record<string, unknown>): Promise<{ body: any; status: number }>;
}
