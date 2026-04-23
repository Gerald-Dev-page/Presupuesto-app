import { createContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

// 1. Creamos el contexto
export const DataContext = createContext();

// 2. Creamos el Componente Proveedor
export function DataProvider({ children }) {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [config, setConfig] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Este useEffect se ejecuta SOLO UNA VEZ cuando la app arranca
  useEffect(() => {
    const cargarDatosInit = async () => {
      try {
        setCargando(true);
        // Llamamos a nuestro servicio de API que conecta con Sheets
        const data = await apiService.obtenerDatosBase();
        
        setConfig(data.config || {});
        setProductos(data.productos || []);
        setClientes(data.clientes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosInit();
  }, []);

  // Todo lo que pongamos en "value" estará disponible en cualquier parte de la app
  return (
    <DataContext.Provider value={{ 
      clientes, setClientes, 
      productos, setProductos, 
      config, setConfig, 
      cargando, error 
    }}>
      {children}
    </DataContext.Provider>
  );
}