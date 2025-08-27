import Koa from 'koa';
import Router from 'koa-router';
import BodyParser from 'koa-body';
import serve from 'koa-static';
import cors from '@koa/cors';
import { bearerToken } from 'koa-bearer-token';
import { Renderer } from './libs/renderer/index.js';
import { HomePage } from './pages/home.js';
import { ApiPage } from './pages/api.js';
import { PostsApi } from './api/posts.js';
import { PostPage } from './pages/post.js';
import { PostsController } from './controllers/posts-controller.js';
import { AboutPage } from './pages/about.js';

export class App {
	protected app: Koa;
	protected router: Router;

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
		const postsController = new PostsController();

		const homePage = new HomePage(renderer, postsController);
		homePage.registerRoutes(this.router);

		const postPage = new PostPage(renderer, postsController);
		postPage.registerRoutes(this.router);

		const aboutPage = new AboutPage(renderer);
		aboutPage.registerRoutes(this.router);

		const postsApi = new PostsApi(postsController);
		const apiEndpoints = [...postsApi.getEndpoints()];

		const apiPage = new ApiPage(apiEndpoints);
		apiPage.registerRoutes(this.router);

		this.app.use(this.router.routes());
	}

	public start(port: number): void {
		this.app.listen(port);
	}
}
