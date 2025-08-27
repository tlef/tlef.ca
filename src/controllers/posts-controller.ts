import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import parseMarkdown from '../libs/markdown/index.js';

export interface IPost {
	title: string;
	slug: string;
	date: string;
	author: string;
	tags: string[];
	content: string;
}

export class PostsController {
	private posts: Record<string, IPost>;
	private orderedKeys: string[];

	constructor() {
		this.posts = {};
		this.orderedKeys = [];

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const postsDir = path.resolve(__dirname, '../../posts');
		this.posts = {};

		const files = fs
			.readdirSync(postsDir)
			.filter((f: string) => f.endsWith('.md'));

		for (const file of files) {
			const filePath = path.join(postsDir, file);
			const content = fs.readFileSync(filePath, 'utf-8');
			const parsed = parseMarkdown(content);
			const key = path.basename(file, '.md');

			this.posts[key] = {
				title: parsed.data.title,
				slug: key,
				date: parsed.data.date,
				author: parsed.data.author,
				tags: parsed.data.tags ? parsed.data.tags.split(',') : [],
				content: parsed.content,
			};
		}

		this.orderedKeys = Object.keys(this.posts).sort((a, b) => {
			const dateA = new Date(this.posts[a]?.date ?? 0).getTime();
			const dateB = new Date(this.posts[b]?.date ?? 0).getTime();
			return dateB - dateA;
		});
	}

	getPosts(): any[] {
		return this.orderedKeys.map((key) => this.posts[key]);
	}

	getPost(key: string): any {
		return this.posts[key];
	}
}
