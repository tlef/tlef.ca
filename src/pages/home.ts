import { type Context } from 'koa';
import type Router from 'koa-router';
import { type IRenderer } from '../libs/renderer/index.js';
import { PostsController } from '../controllers/posts-controller.js';

export class HomePage {
	protected renderer: IRenderer;
	protected postsController: PostsController;
	protected icons: Record<string, string> = {};

	constructor(
		renderer: IRenderer,
		icons: Record<string, string>,
		postsController: PostsController,
	) {
		this.renderer = renderer;
		this.postsController = postsController;
		this.icons = icons;
	}

	public registerRoutes(router: Router): void {
		router.get('/', this.getHome.bind(this));
	}

	private async getHome(ctx: Context): Promise<void> {
		const { posts } = this.postsController.getPosts({ limit: 5 });
		const categories = this.postsController.getCategories();
		const popularPosts = this.postsController.getPopularPosts();

		ctx.body = this.renderer.render('home', {
			posts,
			categories,
			popularPosts,
			icons: this.icons,
		});
	}
}
