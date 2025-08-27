import matter from 'gray-matter';
import { marked } from 'marked';

// Configure marked for synchronous operation
marked.setOptions({
	async: false,
	breaks: true,
	gfm: true,
});

export default function parseMarkdown(data: string): {
	content: string;
	data: any;
} {
	const parsed = matter(data);
	const content = marked(parsed.content);

	return {
		content: content as string,
		data: parsed.data,
	};
}
