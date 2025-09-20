import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import { createBrowserRouter } from 'react-router-dom';

import './index.css'
import './styles/fonts.css';
import "./i18n.js"; // initialize translations


import App from './App.jsx'

// const router = createBrowserRouter ([]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
