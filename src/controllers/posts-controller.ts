import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import parseMarkdown from '../libs/markdown/index.js';

const DEFAULT_POSTS_PER_QUERY = 10;
const MAX_POSTS_PER_QUERY = 100;
const MAX_POST_OFFSET = 1000;

export interface IPost {
	title: string;
	slug: string;
	date: string;
	author: string;
	tags: string[];
	summary: string;
	content: string;
}

const CATEGORIES = {
	js: 'JavaScript',
	slack: 'Slack',
};

export class PostsController {
	private posts: Record<string, IPost>;
	private orderedKeys: string[];
	private tagCounts: Record<string, number>;
	private categoryMeta: { title: string; tag: string; count: number }[];

	constructor() {
		this.posts = {};
		this.orderedKeys = [];
		this.tagCounts = {};
		this.categoryMeta = [];

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
				summary: parsed.data.summary,
				content: parsed.content,
			};

			for (const tag of this.posts[key].tags) {
				if (!this.tagCounts[tag]) {
					this.tagCounts[tag] = 1;
				} else {
					this.tagCounts[tag]++;
				}
			}
		}

		this.categoryMeta = Object.entries(CATEGORIES).map(([tag, title]) => ({
			title,
			tag,
			count: this.tagCounts[tag] ?? 0,
		}));

		this.orderedKeys = Object.keys(this.posts).sort((a, b) => {
			const dateA = new Date(this.posts[a]?.date ?? 0).getTime();
			const dateB = new Date(this.posts[b]?.date ?? 0).getTime();
			return dateB - dateA;
		});
	}

	getCategories(): { title: string; tag: string; count: number }[] {
		return this.categoryMeta;
	}

	getPosts(options: {
		limit?: number;
		offset?: number;
		search?: string;
		tags?: string[];
	}): any[] {
		let keys = [...this.orderedKeys];

		if (options.search) {
			const search = options.search.toLowerCase().trim();
			keys = keys.filter((key) => {
				const post = this.posts[key];
				return (
					post.title.toLowerCase().includes(search) ||
					post.summary.toLowerCase().includes(search) ||
					post.tags.some((tag) => tag.toLowerCase().includes(search))
				);
			});
		}

		if (options.tags) {
			const tags = options.tags.map((tag) => tag.toLowerCase().trim());
			keys = keys.filter((key) => {
				const post = this.posts[key];
				return post.tags.some((tag) => tags.includes(tag.toLowerCase().trim()));
			});
		}

		let offset = options.offset ?? 0;
		if (offset >= MAX_POST_OFFSET) offset = 0;
		let limit = options.limit ?? DEFAULT_POSTS_PER_QUERY;
		if (limit > MAX_POSTS_PER_QUERY) limit = MAX_POSTS_PER_QUERY;

		return keys.slice(offset, offset + limit).map((key) => {
			const post = this.posts[key];
			return {
				title: post.title,
				slug: post.slug,
				date: post.date,
				author: post.author,
				tags: post.tags,
				summary: post.summary,
			};
		});
	}

	getPost(key: string): any {
		return this.posts[key];
	}
}
