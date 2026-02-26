import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './Router';
import './app/globals.css';

// biome-ignore lint/style/noNonNullAssertion: ignore
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Router />
	</StrictMode>
);
