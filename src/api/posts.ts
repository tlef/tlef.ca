import { IApiEndpoint } from './_types.js';
import { PostsController } from '../controllers/posts-controller.js';

export class PostsApi {
	private postsController: PostsController;

	constructor(postsController: PostsController) {
		this.postsController = postsController;
	}

	getEndpoints(): IApiEndpoint[] {
		return [
			{
				path: '/posts',
				method: 'get',
				handler: this.getPosts.bind(this),
			},
			{
				path: '/posts/:slug',
				method: 'get',
				handler: this.getPost.bind(this),
			},
		];
	}

	async getPosts(
		args: Record<string, unknown>,
	): Promise<{ body: string; status: number }> {
		const { search, offset, count, tag } = args;

		const posts = this.postsController.getPosts({
			search: typeof search === 'string' ? search : undefined,
			offset: typeof offset === 'string' ? parseInt(offset) : undefined,
			limit: typeof count === 'string' ? parseInt(count) : undefined,
			tags: Array.isArray(tag)
				? tag
				: typeof tag === 'string'
					? tag.split(',')
					: undefined,
		});
		return { body: JSON.stringify(posts), status: 200 };
	}

	async getPost(
		args: Record<string, unknown>,
	): Promise<{ body: string; status: number }> {
		const { slug } = args as { slug: string };
		const post = this.postsController.getPost(slug);

		if (!post) {
			return { body: JSON.stringify({ error: 'Post not found' }), status: 404 };
		}

		return { body: JSON.stringify(post), status: 200 };
	}
}
