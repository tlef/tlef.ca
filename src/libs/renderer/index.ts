import { Eta } from 'eta';
import path from 'path';

export interface IRenderer {
	render(fileKey: string, data: object): string;
}

export class Renderer implements IRenderer {
	protected eta: Eta;

	constructor() {
		const __dirname = path.resolve(process.cwd());
		this.eta = new Eta({ views: path.join(__dirname, 'templates') });
	}

	render(fileKey: string, data: object): string {
		return this.eta.render(fileKey + '.eta', data);
	}
}
