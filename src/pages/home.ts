import { type Context } from 'koa';
import type Router from 'koa-router';
import { type IRenderer } from '../libs/renderer/index.js';
import { PostsController } from '../controllers/posts-controller.js';

export class HomePage {
	protected renderer: IRenderer;
	protected postsController: PostsController;

	constructor(renderer: IRenderer, postsController: PostsController) {
		this.renderer = renderer;
		this.postsController = postsController;
	}

	public registerRoutes(router: Router): void {
		router.get('/', this.getHome.bind(this));
	}

	private async getHome(ctx: Context): Promise<void> {
		const posts = this.postsController.getPosts();
		ctx.body = this.renderer.render('home', { name: 'user', posts });
	}
}
