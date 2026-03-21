import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Hide the HTML loading div once React starts
const htmlLoader = document.getElementById('loading');
if (htmlLoader) htmlLoader.style.display = 'none';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
