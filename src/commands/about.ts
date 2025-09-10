import { type ICommand, type ICommandResponse } from "./_types.js";

export default class implements ICommand {
	help(_args: string[]): string {
		return "this is a sample application to demonstrate command structure.";
	}

	execute(
		_args: string[],
		_optionArgs: Record<string, string>,
	): ICommandResponse {
		if (_args.length > 0) {
			return {
				text: `I don't understand the command: ${_args.join(" ")}`,
			};
		}
		return {
			text: `Hello! My name is [b]Tim[/b].I'm a [color=red]software developer[/color] currently [url=foo.com]looking for my next[/url] adventure. I helped bring the Slack plaform to production and I'd love to hear about your projects. Lets build something together!`,
		};
	}
}
