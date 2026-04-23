import { useState, useContext } from "react";
import { DataContext } from "./context/DataContext";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Presupuestos from "./pages/Presupuestos";
import Configuracion from "./pages/Configuracion";
import Sidebar from "./components/Sidebar";

function App() {
  const [vistaActual, setVistaActual] = useState("presupuestos");
  const { cargando, error } = useContext(DataContext);

  if (cargando) {
    return (
      <div className="min-h-screen bg-fondo flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-rojo animate-spin"></div>
        </div>
        <div className="text-center font-texto">
          <h2 className="text-sm font-semibold text-negro tracking-wide uppercase">Sincronizando</h2>
          <p className="text-xs text-gris-claro mt-1">Conectando con la base de datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
         <div className="bg-blanco p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-sm">
            <h3 className="text-rojo font-semibold text-base mb-2">Problema de conexión</h3>
            <p className="text-gris-oscuro text-sm leading-relaxed">{error}</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo flex selection:bg-rojo/20">
      
      <Sidebar vistaActual={vistaActual} setVistaActual={setVistaActual} />

      {/* Contenedor Principal Limpio */}
      <main className="flex-1 w-full min-h-screen pb-24 md:pb-0 md:pl-64 flex flex-col transition-all">
        
        {/* Encabezado simple móvil */}
        <div className="md:hidden flex items-center justify-center p-4 bg-blanco border-b border-gray-100 sticky top-0 z-10">
          <h1 className="text-lg font-titulo font-black tracking-tight text-negro">
            Prezo<span className="text-rojo">.</span>
          </h1>
        </div>

        {/* Área de Componentes con mucho respiro (whitespace) */}
        <div className="p-6 md:p-12 w-full max-w-6xl mx-auto font-texto animate-fade-in">
          {vistaActual === "presupuestos" && <Presupuestos />}
          {vistaActual === "productos" && <Productos />}
          {vistaActual === "clientes" && <Clientes />}
          {vistaActual === "config" && <Configuracion />}
        </div>
      </main>

    </div>
  );
}

export default App;