import { type Context } from 'koa';
import type Router from 'koa-router';
import { type IRenderer } from '../libs/renderer/index.js';

export class HomePage {
	protected renderer: IRenderer;

	constructor(renderer: IRenderer) {
		this.renderer = renderer;
	}

	public registerRoutes(router: Router): void {
		router.get('/', this.getHome.bind(this));
	}

	private async getHome(ctx: Context): Promise<void> {
		ctx.body = this.renderer.render('home', { name: 'user' });
	}
}
