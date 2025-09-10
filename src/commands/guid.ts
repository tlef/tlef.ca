import { type ICommand, type ICommandResponse } from "./_types.js";
import { v4 as uuidv4 } from "uuid";

export default class implements ICommand {
	help(_args: string[]): string {
		return helpText;
	}

	execute(
		args: string[],
		optionArgs: Record<string, string>,
	): ICommandResponse {
		if (optionArgs.help || optionArgs.h) {
			return { text: this.help([]) };
		}

		let count = 1;
		if (args[0]) {
			if (isNaN(parseInt(args[0]))) {
				return {
					text: usageText,
				};
			}
			count = parseInt(args[0]);
		}

		try {
			const guids = Array.from({ length: count }, () => uuidv4());
			return {
				text: guids.join("\n"),
			};
		} catch (error) {
			return {
				text: "invalid JWT token.",
			};
		}
	}
}

const helpText = `
Usage: guid [N]

Generate one or more GUIDs (Globally Unique Identifiers).

Positional arguments:	
	N							Number of GUIDs to generate (default: 1)

Options:
	-h, --help		Show this help message and exit

Examples:
	guid					Generate a single GUID
	guid 10				Generate 10 GUIDs
`.trim();

const usageText = `
usage: guid [N]
`.trim();
