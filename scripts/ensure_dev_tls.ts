import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.join(import.meta.dirname, '..');
const LOCAL_TLS_CERT_PATH = path.join(PROJECT_ROOT, '.dev-localhost-cert.pem');
const LOCAL_TLS_KEY_PATH = path.join(PROJECT_ROOT, '.dev-localhost-key.pem');
const OPENSSL_SUBJECT = '/CN=localhost';
const OPENSSL_SUBJECT_ALT_NAME = 'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1';

export const ensureLocalTlsCertificateExists = (): void => {
	const hasCertificate = existsSync(LOCAL_TLS_CERT_PATH);
	const hasKey = existsSync(LOCAL_TLS_KEY_PATH);

	if (hasCertificate && hasKey) {
		return;
	}

	const result = spawnSync(
		'openssl',
		[
			'req',
			'-x509',
			'-newkey',
			'rsa:2048',
			'-sha256',
			'-nodes',
			'-keyout',
			LOCAL_TLS_KEY_PATH,
			'-out',
			LOCAL_TLS_CERT_PATH,
			'-days',
			'365',
			'-subj',
			OPENSSL_SUBJECT,
			'-addext',
			OPENSSL_SUBJECT_ALT_NAME,
		],
		{
			cwd: PROJECT_ROOT,
			stdio: 'inherit',
		}
	);

	if (result.status !== 0) {
		throw new Error('Failed to generate local HTTPS certificate for dev.');
	}
};

if (import.meta.main) {
	ensureLocalTlsCertificateExists();
}
