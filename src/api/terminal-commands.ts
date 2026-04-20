import { IApiEndpoint } from './_types.js';
import fs from 'fs';
import path from 'path';
import { COMMAND_ACTIONS, ICommand, ICommandMeta } from '../commands/_types.js';

export class TerminalCommandsApi {
	protected commands: Record<string, ICommand> = {};
	protected commandsMeta: Record<string, ICommandMeta> = {};

	async init() {
		const commandsDir = path.resolve(
			path.dirname(new URL(import.meta.url).pathname),
			'../commands',
		);
		const commandFiles = fs
			.readdirSync(commandsDir)
			.filter(
				(file) =>
					!file.startsWith('_') &&
					!file.startsWith('(') &&
					file.endsWith('.js'),
			);

		for (const file of commandFiles) {
			const command = path.basename(file, '.js').toLowerCase();

			// eslint-disable-next-line @typescript-eslint/naming-convention
			const CommandClass = (await import(path.join(commandsDir, file))).default;

			this.commands[command] = new CommandClass();
			this.commandsMeta[command] = this.commands[command].meta();
		}
	}

	getEndpoints(): IApiEndpoint[] {
		return [
			{
				path: '/command',
				method: 'post',
				handler: this.postCommand.bind(this),
			},
		];
	}

	async postCommand(args: Record<string, unknown>): Promise<{
		body: {
			text?: string;
			input?: string;
			actions?: COMMAND_ACTIONS[];
			error?: string;
		};
		status: number;
	}> {
		const { command } = args;
		console.log('command', command);
		if (!command || typeof command !== 'string') {
			return {
				body: {
					error: 'missing command',
				},
				status: 400,
			};
		}

		const commandParts = command.split(' ');
		const commandName = commandParts[0].toLowerCase();
		const commandAllArgs = commandParts.slice(1) as string[];
		const commandArgs: string[] = [];
		const commandArgOptions: Record<string, string> = {};
		for (const arg of commandAllArgs) {
			if (arg.startsWith('--')) {
				const [key, value = 'true'] = arg.slice(2).split('=');
				commandArgOptions[key] = value;
			} else if (arg.startsWith('-')) {
				const key = arg.slice(1);
				commandArgOptions[key] = 'true';
			} else {
				commandArgs.push(arg);
			}
		}

		let cmdResponse = null;

		let cmdText: string | undefined;
		let cmdActions: COMMAND_ACTIONS[] | undefined;
		let cmdInput: string | undefined;
		let cmdError: string | undefined;

		if (this.commands[commandName]) {
			const commandInstance = this.commands[commandName];
			cmdResponse = commandInstance.execute(commandArgs, commandArgOptions);
			if (cmdResponse.text) {
				cmdText = cmdResponse.text.trim();
			}
			cmdActions = cmdResponse.actions;
			cmdInput = cmdResponse.input;
		} else {
			switch (commandName) {
				case 'cd':
				case 'dir':
				case 'pwd':
				case 'mkdir':
				case 'rmdir':
				case 'rm':
				case 'mv':
				case 'cp':
				case 'find':
				case 'locate':
				case 'whereis':
				case 'which':
				case 'pushd':
				case 'popd':
				case 'tree':
					cmdError = 'sorry, not a real terminal';
					break;
				case 'help':
					cmdText = this.runHelp(commandArgs);
					break;
				case 'home':
					cmdText = this.runHelp(commandArgs);
					break;
				case 'cls':
				case 'clear':
					cmdActions = [COMMAND_ACTIONS.CLEAR_TERMINAL];
					break;
				case 'w':
				case 'window':
					if (commandArgs[0] === 'toggle' || commandArgs[0] === 't') {
						cmdActions = [COMMAND_ACTIONS.TOGGLE_FULLSCREEN];
					}
					break;
			}
		}

		if (cmdError) {
			return {
				body: {
					error: cmdError,
				},
				status: 200,
			};
		}

		if (!cmdText && !cmdActions) {
			return {
				body: {
					error: `invalid command: ${commandName}`,
				},
				status: 200,
			};
		}

		return {
			body: {
				text: cmdText,
				actions: cmdActions,
				input: cmdInput,
			},
			status: 200,
		};
	}

	private runHelp(args: string[]): string {
		if (args.length > 0) {
			const commandName = args[0].toLowerCase();
			if (this.commands[commandName]) {
				const commandInstance = this.commands[commandName];
				return commandInstance.help(args);
			}

			return `Command not found: ${commandName}`;
		}
		const helpText =
			'Available commands:\n' +
			Object.keys(this.commands)
				.filter((command) => !this.commandsMeta[command]?.hidden)
				.map((command) => {
					const meta = this.commandsMeta[command];
					return meta?.description
						? `${meta?.name || command} - ${meta.description}`
						: meta?.name || command;
				})
				.join('\n');
		return helpText;
	}
}
