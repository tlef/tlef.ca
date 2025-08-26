import * as dotenv from "dotenv";
import { App } from "./app.js";

dotenv.config();

export interface Config {
	databasePath: string;
}

const app = new App();

app.start(process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000);
