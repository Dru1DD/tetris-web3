import '@/styles/global.css';
import '@/styles/fonts.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.tsx';
import axios from 'axios';

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
