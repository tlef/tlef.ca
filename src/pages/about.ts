import { type Context } from 'koa';
import type Router from 'koa-router';
import { type IRenderer } from '../libs/renderer/index.js';

export class AboutPage {
	protected renderer: IRenderer;
	protected icons: Record<string, string>;

	constructor(renderer: IRenderer, icons: Record<string, string>) {
		this.renderer = renderer;
		this.icons = icons;
	}

	public registerRoutes(router: Router): void {
		router.get('/about', this.getAbout.bind(this));
	}

	private async getAbout(ctx: Context): Promise<void> {
		ctx.body = this.renderer.render('about', {
			icons: this.icons,
		});
	}
}
