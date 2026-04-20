import { type Context } from 'koa';
import type Router from 'koa-router';
import { type IRenderer } from '../libs/renderer/index.js';
import { PostsController } from '../controllers/posts-controller.js';
import fs from 'fs';

const POSTS_PER_PAGE = 3;
const DEFAULT_OFFSET = 0;

export class PostPage {
	protected renderer: IRenderer;
	protected postsController: PostsController;
	protected icons: Record<string, string> = {};

	constructor(
		renderer: IRenderer,
		icons: Record<string, string>,
		postsController: PostsController,
	) {
		this.renderer = renderer;
		this.icons = icons;
		this.postsController = postsController;
	}

	public registerRoutes(router: Router): void {
		router.get('/posts', this.getPosts.bind(this));
		router.get('/posts/:slug', this.getPost.bind(this));

		this.icons['search'] = fs.readFileSync('public/icons/search.svg', 'utf8');
	}

	private async getPosts(ctx: Context): Promise<void> {
		const { search, offset, count, tag } = ctx.query;

		const { posts, pagination } = this.postsController.getPosts({
			search: typeof search === 'string' ? search : undefined,
			offset: typeof offset === 'string' ? parseInt(offset) : DEFAULT_OFFSET,
			limit: typeof count === 'string' ? parseInt(count) : POSTS_PER_PAGE,
			tags: typeof tag === 'string' ? tag.split(',') : undefined,
		});
		const categories = this.postsController.getCategories();
		const popularPosts = this.postsController.getPopularPosts();

		ctx.body = this.renderer.render('posts', {
			title: 'Posts',
			posts,
			pagination: {
				hasPrev: pagination.offset > 0,
				hasNext: pagination.offset + posts.length < pagination.total,
				nextPage: pagination.offset + posts.length,
				prevPage: Math.max(
					pagination.offset -
						(offset ? parseInt(offset as string) : POSTS_PER_PAGE),
					0,
				),
				totalPages: Math.ceil(
					pagination.total /
						(offset ? parseInt(offset as string) : POSTS_PER_PAGE),
				),
				currentPage:
					Math.floor(
						pagination.offset /
							(offset ? parseInt(offset as string) : POSTS_PER_PAGE),
					) + 1,
				...pagination,
			},
			query: search,
			icons: this.icons,
			categories,
			popularPosts,
		});
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
			ctx.body = this.renderer.render('post', {
				title: post.title,
				post,
				icons: this.icons,
			});
		}
	}
}
