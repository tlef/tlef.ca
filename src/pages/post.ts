import { type Context } from 'koa';
import type Router from 'koa-router';
import { type IRenderer } from '../libs/renderer/index.js';
import { PostsController } from '../controllers/posts-controller.js';

export class PostPage {
	protected renderer: IRenderer;
	protected postsController: PostsController;

	constructor(renderer: IRenderer, postsController: PostsController) {
		this.renderer = renderer;
		this.postsController = postsController;
	}

	public registerRoutes(router: Router): void {
		router.get('/posts', this.getPosts.bind(this));
		router.get('/posts/:slug', this.getPost.bind(this));
	}

	private async getPosts(ctx: Context): Promise<void> {
		const posts = this.postsController.getPosts();
		ctx.body = this.renderer.render('posts', { posts });
	}

	private async getPost(ctx: Context): Promise<void> {
		const { slug } = ctx.params;

		const post = this.postsController.getPost(slug);

		if (!post) {
			ctx.status = 404;
			ctx.body = 'Post not found';
			return;
		}

		const acceptHeader = ctx.request.headers.accept;
		const wantsJson = acceptHeader?.includes('application/json');

		if (wantsJson) {
			ctx.body = post;
			ctx.type = 'application/json';
		} else {
			ctx.body = this.renderer.render('post', post);
		}
	}
}
