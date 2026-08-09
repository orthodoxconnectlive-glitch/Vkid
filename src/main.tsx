import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Auto-recovery listener for chunk load or module MIME type errors
window.addEventListener('error', (event) => {
  const message = event?.message || '';
  if (
    message.includes('Failed to load module script') ||
    message.includes('Expected a JavaScript-or-Wasm module script') ||
    message.includes('Loading chunk') ||
    message.includes('Failed to fetch dynamically imported module')
  ) {
    console.warn('Script module load failure detected. Clearing ServiceWorker and reloading...');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }
});

// Register Service Worker for PWA support safely
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration failed: ', err);
    });
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error('Root element #root not found in document!');
}
