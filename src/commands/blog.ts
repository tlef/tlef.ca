import { type ICommand, type ICommandResponse } from "./_types.js";

const blogList = [
	{
		title: "Twitch Stream",
		url: "https://www.twitch.tv/videos/123456789",
		date: "2022-02-02",
	},
	{
		title: "YouTube Video",
		url: "https://www.youtube.com/watch?v=123456789",
		date: "2022-02-02",
	},
	{
		title: "Blog Post",
		url: "https://www.example.com/blog/123456789",
		date: "2022-02-02",
	},
];

export default class implements ICommand {
	help(_args: string[]): string {
		return "";
	}

	execute(
		_args: string[],
		_optionArgs: Record<string, string>,
	): ICommandResponse {
		return {
			text: `Blog List \n${buildBlogList()}`,
			input: `Which post do you want to read? 1 - ${blogList.length}`,
		};
	}
}

function buildBlogList(): string {
	let list = "";
	for (const [index, blog] of blogList.entries()) {
		list += `${index + 1}. [url=${blog.url}]${blog.title}[/url] - ${blog.date}\n`;
	}
	return list;
}
