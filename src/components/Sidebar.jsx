import { FileText, Package, Users, Settings } from 'lucide-react';
import logoGerald from '../assets/logoGerald.png';
export default function Sidebar({ vistaActual, setVistaActual }) {
  const menuItems = [
    { id: 'presupuestos', label: 'Cotizaciones', Icon: FileText },
    { id: 'productos', label: 'Tarifas', Icon: Package },
    { id: 'clientes', label: 'Directorio', Icon: Users },
    { id: 'config', label: 'Configuración', Icon: Settings },
  ];

  return (
    <nav className="
      fixed bottom-0 left-0 z-50
      w-full bg-blanco border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]
      flex items-center
      md:top-0 md:left-0 md:h-screen md:w-64
      md:flex-col md:border-t-0 md:border-r md:border-gray-100
      md:justify-start md:shadow-[4px_0_24px_rgba(0,0,0,0.01)]
    ">

      {/* Brand - Solo Desktop */}
      <div className="hidden md:flex flex-col items-center w-full px-6 pt-10 pb-8 border-b border-gray-50">
        <div className="w-10 h-10 bg-rojo rounded-xl flex items-center justify-center mb-3 shadow-sm bg-opacity-10 text-rojo">
           <FileText size={22} strokeWidth={2} />
        </div>
        <h1 className="text-xl font-titulo font-black tracking-tight text-negro text-center">
          Prezo<span className="text-rojo">.</span>
        </h1>
        <span className="mt-1 text-[10px] font-medium tracking-widest text-gris-claro uppercase">
          Gestión de Cotizaciones
        </span>
      </div>

      {/* Menú */}
      <ul className="
        flex w-full justify-around items-center
        md:flex-col md:justify-start md:gap-1.5
        md:px-4 md:pt-6 md:flex-1
      ">
        {menuItems.map(({ id, label, Icon }) => {
          const isActive = vistaActual === id;

          return (
            <li
              key={id}
              onClick={() => setVistaActual(id)}
              className={`
                relative flex flex-col items-center justify-center
                py-3 px-2 cursor-pointer select-none
                transition-all duration-200 w-full
                md:flex-row md:justify-start md:gap-3
                md:px-4 md:py-3 md:rounded-lg
                ${isActive
                  ? 'text-rojo md:bg-rojo/5 md:text-rojo' 
                  : 'text-gris-claro hover:text-negro md:hover:bg-fondo md:hover:text-negro'
                }
              `}
            >
              {/* Indicadores activos */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-rojo rounded-full md:hidden" />
              )}
              {isActive && (
                <span className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-rojo rounded-r-full" />
              )}

              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={`shrink-0 ${isActive ? 'text-rojo' : ''}`}
              />

              <span className={`
                mt-1 text-[10px] md:hidden font-sub uppercase tracking-wider
                ${isActive ? 'font-bold text-rojo' : 'font-medium'}
              `}>
                {label}
              </span>

              <span className={`
                hidden md:block text-sm font-texto
                ${isActive ? 'font-semibold text-rojo' : 'font-medium text-gris-oscuro'}
              `}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Footer Usuario - Solo Desktop (Con Logo de Gerald Dev) */}
      <div className="hidden md:flex flex-col items-center w-full px-6 py-6 border-t border-gray-50 gap-2 bg-fondo/50">
        <span className="text-[9px] font-semibold tracking-widest text-gris-claro uppercase">
          Desarrollado por
        </span>
        <img 
          src={logoGerald}
          alt="Gerald Dev" 
          className="h-auto max-w-[90px] object-contain opacity-70 hover:opacity-100 transition-opacity duration-200"
        />
      </div>
    </nav>
  );
}