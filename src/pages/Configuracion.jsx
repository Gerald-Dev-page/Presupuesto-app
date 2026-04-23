import { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { apiService } from '../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Configuracion() {
  const { config, setConfig } = useContext(DataContext);
  const [iva, setIva] = useState(config.iva || 21);
  const [guardando, setGuardando] = useState(false);
  
  // Estado para la notificación no bloqueante
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'exito' });

  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleGuardarIVA = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await apiService.guardarPost('actualizarConfig', { clave: 'iva', valor: Number(iva) });
      setConfig({ ...config, iva: Number(iva) });
      
      // Notificación de éxito elegante
      mostrarNotificacion("Impuesto actualizado en todo el sistema.");
    } catch (error) {
      mostrarNotificacion("Error de conexión: " + error.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl relative">
      
      {/* Toast Notification Flotante */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all animate-fade-in border ${
          toast.tipo === 'exito' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.tipo === 'exito' ? <CheckCircle2 size={20} className="text-green-600" /> : <XCircle size={20} className="text-red-600" />}
          <span className="font-texto text-sm font-semibold tracking-wide">{toast.mensaje}</span>
        </div>
      )}

      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-titulo font-black text-negro tracking-tight">Parámetros del Sistema</h2>
      </div>

      <div className="bg-blanco p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-sub font-bold text-gris-oscuro mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-rojo rounded-r-full block"></span>
          IMPUESTOS
        </h3>
        
        <form onSubmit={handleGuardarIVA} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-bold text-gris-claro uppercase tracking-wider mb-2">Porcentaje de I.V.A actual</label>
            <div className="relative">
              <input 
                type="number" min="0" step="0.1" required 
                value={iva} 
                onChange={(e) => setIva(e.target.value)} 
                className="w-full p-4 bg-fondo border border-gray-200 rounded-lg focus:ring-2 focus:ring-rojo outline-none text-xl font-bold text-negro transition-all" 
              />
              <span className="absolute right-4 top-4 text-gris-claro font-bold text-xl">%</span>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={guardando} 
            className={`w-full sm:w-1/2 py-4 rounded-lg font-sub font-bold tracking-widest uppercase transition-all shadow-sm
              ${guardando 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-negro hover:bg-rojo text-blanco hover:shadow-md'
              }`}
          >
            {guardando ? 'ACTUALIZANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
        
        <p className="mt-5 text-sm text-gris-claro font-texto leading-relaxed">
          Al guardar los cambios, las nuevas cotizaciones que se generen utilizarán este porcentaje de forma automática. Los presupuestos anteriores no se verán afectados.
        </p>
      </div>
    </div>
  );
}