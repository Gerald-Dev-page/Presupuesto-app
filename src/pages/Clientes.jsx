import { useState, useContext, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import { apiService } from '../services/api';
import { CheckCircle2, XCircle } from 'lucide-react'; // Aprovechamos los iconos que ya instalaste

export default function Clientes() {
  const { clientes, setClientes } = useContext(DataContext);
  const [guardando, setGuardando] = useState(false);
  
  // Nuevo estado para controlar la notificación no bloqueante
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'exito' });
  
  const [formData, setFormData] = useState({
    empresa: '', contacto: '', cuit: '', direccion: ''
  });

  // Función para manejar el toast (aparece y a los 3 segundos se oculta solo)
  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.empresa) return;

    setGuardando(true);
    try {
      const clienteGuardado = await apiService.guardarPost('guardarCliente', formData);
      setClientes([...clientes, clienteGuardado]);
      setFormData({ empresa: '', contacto: '', cuit: '', direccion: '' });
      
      // Reemplazamos el alert() por nuestra notificación
      mostrarNotificacion("Cliente registrado con éxito en el directorio.");

    } catch (error) {
      mostrarNotificacion("Error de conexión: " + error.message, "error");
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
          <span className="font-texto text-sm font-bold tracking-wide">{toast.mensaje}</span>
        </div>
      )}

      <div className="border-b-2 border-rojo pb-4">
        <h2 className="text-2xl font-titulo font-bold text-negro uppercase tracking-widest">
          Directorio de Clientes
        </h2>
      </div>

      <div className="bg-blanco p-8 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-sub font-bold text-gris-oscuro mb-6 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-rojo rounded-full block"></span>
          NUEVO REGISTRO
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 font-texto">
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold text-gris-claro uppercase mb-2">Empresa / Razón Social</label>
            <input type="text" name="empresa" placeholder="Ej: Arcor S.A." value={formData.empresa} onChange={handleChange} required className="w-full p-3 bg-fondo border border-gray-200 rounded-lg focus:ring-2 focus:ring-rojo outline-none transition-all" />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gris-claro uppercase mb-2">CUIT</label>
            <input type="text" name="cuit" placeholder="30-..." value={formData.cuit} onChange={handleChange} className="w-full p-3 bg-fondo border border-gray-200 rounded-lg focus:ring-2 focus:ring-rojo outline-none transition-all" />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-gris-claro uppercase mb-2">Persona de Contacto</label>
            <input type="text" name="contacto" placeholder="Nombre completo" value={formData.contacto} onChange={handleChange} className="w-full p-3 bg-fondo border border-gray-200 rounded-lg focus:ring-2 focus:ring-rojo outline-none transition-all" />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-gris-claro uppercase mb-2">Dirección</label>
            <input type="text" name="direccion" placeholder="Calle, Ciudad, Provincia" value={formData.direccion} onChange={handleChange} className="w-full p-3 bg-fondo border border-gray-200 rounded-lg focus:ring-2 focus:ring-rojo outline-none transition-all" />
          </div>
          <div className="lg:col-span-12 flex justify-end mt-2">
            <button type="submit" disabled={guardando} className={`min-w-[200px] font-sub font-bold tracking-widest uppercase py-4 px-8 rounded-lg transition-all shadow-md ${guardando ? 'bg-gris-claro text-blanco cursor-not-allowed' : 'bg-negro hover:bg-rojo text-blanco'}`}>
              {guardando ? 'PROCESANDO...' : 'GUARDAR CLIENTE'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blanco rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-texto">
            <thead>
              <tr className="bg-fondo text-gris-oscuro font-sub border-b border-gray-200">
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Empresa</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Identificación</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Ubicación</th>
                <th className="p-5 font-bold uppercase tracking-wider text-xs">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.map((cli, idx) => (
                <tr key={idx} className="hover:bg-fondo transition-colors group">
                  <td className="p-5 font-bold text-negro">{cli.empresa}</td>
                  <td className="p-5 font-mono text-gris-oscuro">{cli.cuit || 'N/A'}</td>
                  <td className="p-5 text-gris-claro text-sm">{cli.direccion || 'Sin dirección'}</td>
                  <td className="p-5 text-gris-oscuro">{cli.contacto || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}