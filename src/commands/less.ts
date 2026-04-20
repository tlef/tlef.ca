import {
	ICommandMeta,
	type ICommand,
	type ICommandResponse,
} from './_types.js';
import { aboutMe } from '../data/aboutme.json.js';

const NAME = 'less';
const DESCRIPTION = 'Display file contents';
const USAGE = 'less <filename>';
const HIDDEN = true;

export default class implements ICommand {
	help(_args: string[]): string {
		return helpText;
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
		optionArgs: Record<string, string>,
	): ICommandResponse {
		if (optionArgs.help || optionArgs.h) {
			return { text: this.help([]) };
		}
		if (_args.length > 0) {
			const filename = _args[0];
			if (filename === 'aboutme.json') {
				return {
					text: aboutMe,
				};
			}

			return {
				text: `unknown file: ${filename}`,
			};
		}
		return {
			text: `Missing filename\n` + usageText,
		};
	}
}

const helpText = `
Usage: ${USAGE}

${DESCRIPTION}

Options:
	-h, --help		Show this help message and exit

Examples:
	less example.txt		Display the contents of example.txt
`.trim();

const usageText = `
usage: ${USAGE}
`.trim();
