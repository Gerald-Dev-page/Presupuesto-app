import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';
import { DataProvider } from './context/DataContext.jsx'; // <-- Importamos el Provider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos la app entera */}
    <DataProvider>
      <App />
    </DataProvider>
  </StrictMode>,
);