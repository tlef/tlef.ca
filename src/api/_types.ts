export interface IApiEndpoint {
	path: string;
	method: 'get' | 'post' | 'put' | 'delete';
	handler: IApiEndpointHandler;
}

export interface IApiEndpointHandler {
	(params: any): Promise<{ body: any; status: number }>;
}
