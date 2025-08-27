import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Eta } from 'eta';
import { marked } from 'marked';

const POSTS_DIR = path.join(process.cwd(), 'posts');
const OUTPUT_DIR = path.join(process.cwd(), 'public/posts');
const TEMPLATE_PATH = path.join(process.cwd(), 'templates/post.eta');
const INDEX_TEMPLATE_PATH = path.join(
	process.cwd(),
	'templates/posts-index.eta',
);
const INDEX_OUTPUT = path.join(process.cwd(), 'public/posts/index.html');
const INDEX_JSON = path.join(process.cwd(), 'public/posts/index.json');

const eta = new Eta({ views: path.join(process.cwd(), 'templates') });

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getAllMarkdownFiles(dir) {
	return fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
}

function renderPost({ content, data }) {
	const html = marked(content);
	// return eta.render(fs.readFileSync(TEMPLATE_PATH, 'utf8'), {
	return eta.render('post.eta', {
		...data,
		content: html,
	});
}

function main() {
	ensureDir(OUTPUT_DIR);
	const files = getAllMarkdownFiles(POSTS_DIR);
	const postsMeta = [];

	for (const file of files) {
		const filePath = path.join(POSTS_DIR, file);
		const raw = fs.readFileSync(filePath, 'utf8');
		const { content, data } = matter(raw);
		const slug = file.replace(/\.md$/, '');
		const html = renderPost({ content, data });
		const outPath = path.join(OUTPUT_DIR, `${slug}.html`);
		fs.writeFileSync(outPath, html);
		postsMeta.push({ slug, ...data });
	}

	// Generate index.html and index.json
	// const indexHtml = eta.render(fs.readFileSync(INDEX_TEMPLATE_PATH, 'utf8'), {
	const indexHtml = eta.render('posts-index.eta', {
		posts: postsMeta,
	});
	fs.writeFileSync(INDEX_OUTPUT, indexHtml);
	fs.writeFileSync(INDEX_JSON, JSON.stringify(postsMeta, null, 2));
}

main();
