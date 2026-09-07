import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { getDatabase } from './services/database/db';
import { initSchemaMigration } from './services/storage/schemaManager';

// Initialize IndexedDB primary database on startup
getDatabase().catch((err) => {
  console.warn('[DB] IndexedDB initialization warning:', err);
});

// Run version-controlled schema migration and protected storage sync
initSchemaMigration();

// Register Service Worker for PWA & Offline reliability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker active:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration warning:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
