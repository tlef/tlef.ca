import { PostsController } from '../controllers/posts-controller.js';
import {
	ICommandMeta,
	type ICommand,
	type ICommandResponse,
} from './_types.js';

const NAME = 'posts';
const DESCRIPTION = 'List my recent blog posts.';
const USAGE = 'posts';
const HIDDEN = false;

export default class implements ICommand {
	protected postsController = new PostsController();

	constructor() {
		this.postsController = new PostsController();
	}

	help(_args: string[]): string {
		return '';
	}

	meta(): ICommandMeta {
		return {
			name: NAME,
			description: DESCRIPTION,
			usage: USAGE,
			hidden: HIDDEN,
		};
	}

	execute(
		_args: string[],
		_optionArgs: Record<string, string>,
	): ICommandResponse {
		const posts = this.postsController.getPosts({});
		return {
			text: `Post List \n${posts.posts
				.map(
					(post, index) =>
						`${index + 1}. [url=/posts/${post.slug}]${post.title}[/url]`,
				)
				.join('\n')}\n\n`,
		};
	}
}
