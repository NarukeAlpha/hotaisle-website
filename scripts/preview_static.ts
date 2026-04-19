import fs from 'node:fs';
import path from 'node:path';
import { startStaticServer } from './static_server.ts';

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 4174;
const DIST_STATIC_DIRECTORY = path.join(import.meta.dirname, '..', 'dist-static');
const LOCAL_TLS_CERT_PATH = path.join(import.meta.dirname, '..', '.dev-localhost-cert.pem');
const LOCAL_TLS_KEY_PATH = path.join(import.meta.dirname, '..', '.dev-localhost-key.pem');

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
	tls: {
		cert: fs.readFileSync(LOCAL_TLS_CERT_PATH),
		key: fs.readFileSync(LOCAL_TLS_KEY_PATH),
	},
});

console.log(`Previewing dist-static at https://${server.hostname}:${server.port}`);
