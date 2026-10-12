import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if (import.meta.env.DEV && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key.includes('workbox-precache')) {
        caches.delete(key);
      }
    });
  });
}

registerSW({
  immediate: true,
  onRegisterError() {
    // Ignore dev service worker registration errors when HMR is disabled
  },
});

createRoot(document.getElementById('root')!).render(<App />);
