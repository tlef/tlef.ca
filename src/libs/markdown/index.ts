import { marked } from 'marked';
import Prism from 'prismjs';

import matter from 'gray-matter';

// Use require for gray-matter due to module compatibility issues
// const matter = require('gray-matter');

// Import Prism language components AFTER Prism default import
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-tsx.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-scss.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-go.js';
// import 'prismjs/components/prism-http.js';

// Helper function to escape HTML
function escapeHtml(text: string): string {
	const map: { [key: string]: string } = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Configure marked with Prism.js for syntax highlighting
const renderer = new marked.Renderer();

renderer.code = function ({
	text,
	lang,
}: {
	text: string;
	lang?: string;
}): string {
	if (lang && Prism.languages[lang]) {
		const highlighted = Prism.highlight(text, Prism.languages[lang], lang);
		return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
	}
	// Fallback for unknown languages
	return `<pre><code>${escapeHtml(text)}</code></pre>`;
};

marked.setOptions({
	async: false,
	breaks: true,
	gfm: true,
	renderer: renderer,
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
