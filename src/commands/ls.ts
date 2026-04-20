import {
	ICommandMeta,
	type ICommand,
	type ICommandResponse,
} from './_types.js';

const FAKE_FILES = ['aboutme.json'];

const NAME = 'ls';
const DESCRIPTION = 'List the contents of the current (fake) directory.';
const USAGE = 'ls [PATTERN]';
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
		if (_args.length === 1) {
			const pattern = _args[0];
			let matches: string[];

			if (pattern.includes('*')) {
				// Convert shell glob to regex
				const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
				const regex = new RegExp(`^${regexPattern}$`);
				matches = FAKE_FILES.filter((file) => regex.test(file));
			} else {
				// Exact match check
				matches = FAKE_FILES.filter((file) => file === pattern);
			}

			if (matches.length === 0) {
				return {
					text: `ls: cannot access '${pattern}': No such file or directory`,
				};
			}

			return {
				text: matches.join('\t'),
			};
		}

		if (_args.length > 1) {
			return {
				text: `ls: too many arguments`,
			};
		}
		return {
			text: FAKE_FILES.join('\n'),
		};
	}
}

const helpText = `
Usage: ${USAGE}

${DESCRIPTION}

Options:
	-h, --help		Show this help message and exit

Examples:
	ls					List all files
	ls *.json			List all JSON files
`.trim();

const usageText = `
usage: ${USAGE}
`.trim();
