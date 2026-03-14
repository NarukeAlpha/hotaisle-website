import path from 'node:path';
import { file, serve } from 'bun';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4174;
const INDEX_FILE_NAME = 'index.html';
const DIST_STATIC_DIRECTORY = path.join(import.meta.dirname, '..', 'dist-static');

const host = process.env.HOST ?? DEFAULT_HOST;
const port = Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10);

if (Number.isNaN(port)) {
	throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const server = startPreviewServer(host, port);

console.log(`Previewing dist-static at http://${server.hostname}:${server.port}`);

function startPreviewServer(hostname: string, startPort: number) {
	try {
		return createServer(hostname, startPort);
	} catch (error) {
		if (!isAddressInUseError(error)) {
			throw error;
		}
	}

	return createServer(hostname, 0);
}

function createServer(hostname: string, port: number) {
	return serve({
		development: false,
		fetch: async (request: Request): Promise<Response> => {
			const requestUrl = new URL(request.url);
			const filePath = resolveStaticFilePath(requestUrl.pathname);

			if (!filePath) {
				return new Response('Not found', { status: 404 });
			}

			const staticFile = file(filePath);
			if (!(await staticFile.exists())) {
				return new Response('Not found', { status: 404 });
			}

			return new Response(staticFile);
		},
		hostname,
		port,
	});
}

function resolveStaticFilePath(requestPath: string): string | null {
	const normalizedPath = normalizeRequestPath(requestPath);
	if (!normalizedPath) {
		return null;
	}

	let relativePath = INDEX_FILE_NAME;
	if (hasFileExtension(normalizedPath)) {
		relativePath = normalizedPath.slice(1);
	} else if (normalizedPath !== '/') {
		relativePath = path.join(normalizedPath.slice(1), INDEX_FILE_NAME);
	}

	const resolvedPath = path.resolve(DIST_STATIC_DIRECTORY, relativePath);

	if (!resolvedPath.startsWith(DIST_STATIC_DIRECTORY)) {
		return null;
	}

	return resolvedPath;
}

function normalizeRequestPath(requestPath: string): string | null {
	try {
		const decodedPath = decodeURIComponent(requestPath);
		if (decodedPath.includes('\0')) {
			return null;
		}

		if (hasFileExtension(decodedPath)) {
			return decodedPath;
		}

		return decodedPath.endsWith('/') ? decodedPath : `${decodedPath}/`;
	} catch {
		return null;
	}
}

function hasFileExtension(requestPath: string): boolean {
	return path.posix.extname(requestPath) !== '';
}

function isAddressInUseError(error: unknown): boolean {
	return error instanceof Error && 'code' in error && error.code === 'EADDRINUSE';
}
