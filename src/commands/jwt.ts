import { type ICommand, type ICommandResponse } from './_types.js';
import { jwtDecode } from 'jwt-decode';

export default class implements ICommand {
	help(_args: string[]): string {
		return 'jwt <token> - Decode a JWT token.';
	}

	execute(
		args: string[],
		_optionArgs: Record<string, string>,
	): ICommandResponse {
		if (args.length === 0) {
			return {
				text: 'usage: jwt <token>',
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
