import { type Context } from 'koa';
import type Router from 'koa-router';
import { type IRenderer } from '../libs/renderer/index.js';

export class AboutPage {
	protected renderer: IRenderer;

	constructor(renderer: IRenderer) {
		this.renderer = renderer;
	}

	public registerRoutes(router: Router): void {
		router.get('/about', this.getAbout.bind(this));
	}

	private async getAbout(ctx: Context): Promise<void> {
		ctx.body = this.renderer.render('about', {});
	}
}
