import { Eta } from 'eta';
import path from 'path';

export interface IRenderer {
	render(fileKey: string, data: object): string;
}

export class Renderer implements IRenderer {
	protected eta: Eta;
	protected commonData: object;

	constructor(commonData?: object) {
		const __dirname = path.resolve(process.cwd());
		this.eta = new Eta({ views: path.join(__dirname, 'templates') });
		this.commonData = commonData || {};
	}

	render(fileKey: string, data: object): string {
		return this.eta.render(fileKey + '.eta', { ...this.commonData, ...data });
	}
}
