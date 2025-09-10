export enum COMMAND_ACTIONS {
	CLEAR_TERMINAL = 'clearTerminal',
	TOGGLE_FULLSCREEN = 'toggleFullscreen',
}

export interface ICommandResponse {
	text?: string;
	input?: string;
	actions?: COMMAND_ACTIONS[];
	error?: string;
}

export interface ICommand {
	help: (args: string[]) => string;
	execute: (
		args: string[],
		optionArgs: Record<string, string>,
	) => ICommandResponse;
}
