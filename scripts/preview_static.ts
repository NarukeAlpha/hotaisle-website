import path from 'node:path';
import { startStaticServer } from './static_server.ts';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4174;
const DIST_STATIC_DIRECTORY = path.join(import.meta.dirname, '..', 'dist-static');

const host = process.env.HOST ?? DEFAULT_HOST;
const port = Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10);

if (Number.isNaN(port)) {
	throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const server = await startStaticServer({
	development: false,
	directory: DIST_STATIC_DIRECTORY,
	hostname: host,
	port,
});

console.log(`Previewing dist-static at http://${server.hostname}:${server.port}`);
