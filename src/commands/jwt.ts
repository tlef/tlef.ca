import {
	ICommandMeta,
	type ICommand,
	type ICommandResponse,
} from './_types.js';
import { jwtDecode } from 'jwt-decode';

const NAME = 'jwt';
const DESCRIPTION = 'Decode a JSON Web Token (JWT)';
const USAGE = 'jwt [token]';
const HIDDEN = false;
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
		args: string[],
		optionArgs: Record<string, string>,
	): ICommandResponse {
		if (optionArgs.help || optionArgs.h) {
			return { text: this.help([]) };
		}

		if (args.length === 0) {
			return {
				text: `Missing token\n` + usageText,
			};
		}

		try {
			const decodedToken = jwtDecode(args[0]);
			const decodedHeader = jwtDecode(args[0], { header: true });
			return {
				text: `
header: 
${JSON.stringify(decodedHeader, null, 2)}

payload: 
${JSON.stringify(decodedToken, null, 2)}
`.trim(),
			};
		} catch (error) {
			return {
				text: 'invalid JWT token.',
			};
		}
	}
}

const helpText = `
Usage: ${USAGE}

${DESCRIPTION}

Positional arguments:
	-h, --help		Show this help message and exit
`.trim();

const usageText = `
usage: ${USAGE}
`.trim();
