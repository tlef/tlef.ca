import Koa from 'koa';
import Router from 'koa-router';
import BodyParser from 'koa-body';
import serve from 'koa-static';
import cors from '@koa/cors';
import { bearerToken } from 'koa-bearer-token';
import { Renderer } from './libs/renderer/index.js';
import { HomePage } from './pages/home.js';
import { ApiPage } from './pages/api.js';
import { endpoints as postsEndpoints } from './api/posts.js';

export class App {
	protected app: Koa;
	protected router: Router;

	protected apiPage: ApiPage;
	protected homePage: HomePage;

	constructor() {
		this.app = new Koa();
		this.router = new Router();

		this.app.use(
			BodyParser.koaBody({
				urlencoded: true,
			}),
		);

		this.app.use(cors());
		this.app.use(bearerToken());
		this.app.use(serve('./public'));

		const renderer = new Renderer();

		this.homePage = new HomePage(renderer);
		this.homePage.registerRoutes(this.router);

		const apiEndpoints = [...postsEndpoints];

		this.apiPage = new ApiPage(apiEndpoints);
		this.apiPage.registerRoutes(this.router);

		this.app.use(this.router.routes());
	}

	public start(port: number): void {
		this.app.listen(port);
	}
}
