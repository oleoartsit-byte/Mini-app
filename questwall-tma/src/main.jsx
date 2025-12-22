import React from 'react';
import { createRoot } from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { App } from './App';

// TonConnect manifest URL
const MANIFEST_URL = window.location.origin + '/tonconnect-manifest.json';

createRoot(document.getElementById('root')).render(
  <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
    <App />
  </TonConnectUIProvider>
);
