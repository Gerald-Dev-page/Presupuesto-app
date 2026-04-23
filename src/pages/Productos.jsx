import { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { apiService } from '../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Productos() {
  const { productos, setProductos } = useContext(DataContext);
  const [guardando, setGuardando] = useState(false);
  
  // Estado para la notificación no bloqueante (Toast)
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'exito' });
  
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', precio_unidad: '', unidad: 'm3'
  });

  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const res = await apiService.guardarPost('guardarProducto', {
        ...formData,
        precio_unidad: Number(formData.precio_unidad)
      });
      setProductos([...productos, res]);
      setFormData({ codigo: '', nombre: '', precio_unidad: '', unidad: 'm3' });
      
      // Reemplazamos el alert() por el Toast elegante
      mostrarNotificacion("Tarifa registrada correctamente en el catálogo.");
    } catch (err) {
      mostrarNotificacion("Error de conexión: " + err.message, "error");
    } finally { 
      setGuardando(false); 
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
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
        <h2 className="text-2xl font-titulo font-black text-negro tracking-tight">Tarifas y Servicios</h2>
      </div>

      <div className="bg-blanco p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-sub font-bold text-gris-oscuro mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-rojo rounded-r-full block"></span>
          NUEVO MATERIAL O SERVICIO
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-5 font-texto">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gris-claro uppercase tracking-wider mb-2">Código SKU</label>
            <input 
              type="text" placeholder="Ej: SUELO-01" 
              value={formData.codigo} 
              onChange={e => setFormData({...formData, codigo: e.target.value})} 
              className="w-full p-3 bg-fondo border border-gray-200 rounded-lg focus:ring-2 focus:ring-rojo outline-none transition-all text-negro" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gris-claro uppercase tracking-wider mb-2">Descripción</label>
            <input 
              type="text" required placeholder="Suelo estabilizado, Ripio..." 
              value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
              className="w-full p-3 bg-fondo border border-gray-200 rounded-lg focus:ring-2 focus:ring-rojo outline-none transition-all text-negro" 
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gris-claro uppercase tracking-wider mb-2">Precio Base</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gris-claro font-bold">$</span>
              <input 
                type="number" required placeholder="0.00" 
                value={formData.precio_unidad} 
                onChange={e => setFormData({...formData, precio_unidad: e.target.value})} 
                className="w-full p-3 pl-8 bg-fondo border border-gray-200 rounded-lg focus:ring-2 focus:ring-rojo outline-none transition-all text-negro font-bold" 
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gris-claro uppercase tracking-wider mb-2">Unidad</label>
            <select 
              value={formData.unidad} 
              onChange={e => setFormData({...formData, unidad: e.target.value})} 
              className="w-full p-3 bg-fondo border border-gray-200 rounded-lg focus:ring-2 focus:ring-rojo outline-none transition-all font-bold text-gris-oscuro"
            >
              <option value="m3">Metros Cúbicos (m³)</option>
              <option value="hs">Horas (hs)</option>
              <option value="un">Unidad (un)</option>
              <option value="tn">Tonelada (tn)</option>
              <option value="km">Kilómetro (km)</option>
            </select>
          </div>
          <div className="md:col-span-5 flex justify-end mt-2">
            <button 
              type="submit" 
              disabled={guardando} 
              className={`min-w-[200px] py-4 px-8 rounded-lg font-sub font-bold tracking-widest uppercase transition-all shadow-sm
                ${guardando 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-negro hover:bg-rojo text-blanco hover:shadow-md hover:-translate-y-0.5'
                }`}
            >
              {guardando ? 'SINCRONIZANDO...' : 'CARGAR ÍTEM'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {productos.map((p, i) => (
          <div key={i} className="bg-blanco p-6 rounded-xl border border-gray-100 border-l-4 border-l-rojo shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
            <div>
              <p className="text-xs font-mono text-gris-claro mb-1">{p.codigo || 'SIN COD'}</p>
              <h4 className="font-bold text-negro text-base leading-tight pr-4">{p.nombre}</h4>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-titulo font-black text-negro">${Number(p.precio_unidad).toLocaleString('es-AR')}</p>
              <p className="text-xs font-bold text-rojo uppercase">por {p.unidad}</p>
            </div>
          </div>
        ))}
        
        {productos.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-gris-claro font-texto">El catálogo de tarifas está vacío. Comienza agregando un material o servicio.</p>
          </div>
        )}
      </div>
    </div>
  );
}