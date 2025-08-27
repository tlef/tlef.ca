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

	async getPosts(): Promise<{ body: string; status: number }> {
		const posts = this.postsController.getPosts();
		return { body: JSON.stringify(posts), status: 200 };
	}

	async getPost(args: unknown): Promise<{ body: string; status: number }> {
		const { slug } = args as { slug: string };
		const post = this.postsController.getPost(slug);

		if (!post) {
			return { body: JSON.stringify({ error: 'Post not found' }), status: 404 };
		}

		return { body: JSON.stringify(post), status: 200 };
	}
}
