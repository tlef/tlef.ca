import type Router from 'koa-router';
import { IApiEndpoint, IApiEndpointHandler } from '../api/_types.js';

export class ApiPage {
	protected apis: IApiEndpoint[];

	constructor(apis: IApiEndpoint[]) {
		this.apis = apis;
	}

	public registerRoutes(router: Router): void {
		for (const endpoint of this.apis) {
			router[endpoint.method](
				`/api${endpoint.path}`,
				wrapHandler(endpoint.handler),
			);
		}
	}
}

function wrapHandler(handler: IApiEndpointHandler) {
	// Wrap the handler, to abstract out the koa context logic
	return async (ctx: any) => {
		const params = { ...ctx.request.body, ...ctx.query, ...ctx.params };
		const result = await handler(params);
		ctx.status = result.status;
		ctx.body = result.body;
	};
}
