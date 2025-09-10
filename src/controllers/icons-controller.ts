import fs from 'fs';

class IconsController {
	protected icons: Record<string, string> = {};

	constructor() {
		this.icons['bluesky'] = fs.readFileSync('public/icons/bluesky.svg', 'utf8');
		this.icons['github'] = fs.readFileSync('public/icons/github.svg', 'utf8');
		this.icons['linkedin'] = fs.readFileSync(
			'public/icons/linkedin.svg',
			'utf8',
		);
		this.icons['arrow-right-circle'] = fs.readFileSync(
			'public/icons/arrow-right-circle.svg',
			'utf8',
		);
		this.icons['search'] = fs.readFileSync('public/icons/search.svg', 'utf8');
	}

	public getIcons(): Record<string, string> {
		return this.icons;
	}
}

const iconsController = new IconsController();

export default iconsController;
