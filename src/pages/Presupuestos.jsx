import { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { apiService } from '../services/api';
import VistaPrevia from '../components/VistaPrevia';
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export default function Presupuestos() {
  const { clientes, productos, config, setConfig } = useContext(DataContext);
  
  const [modoVista, setModoVista] = useState('edicion');
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [items, setItems] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [presupuestoGeneradoData, setPresupuestoGeneradoData] = useState(null);
  
  // Estado para la notificación no bloqueante
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'exito' });
  const [itemForm, setItemForm] = useState({ productoId: '', cantidad: 1 });

  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const formatearMoneda = (valor) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor);

  const handleAgregarItem = (e) => {
    e.preventDefault();
    if (!itemForm.productoId || itemForm.cantidad <= 0) return;

    const producto = productos.find(p => p.id === itemForm.productoId || p.codigo === itemForm.productoId);
    if (!producto) return;

    const nuevoItem = {
      id: Date.now(),
      productoId: producto.id || producto.codigo,
      codigo: producto.codigo,
      nombre: producto.nombre,
      precioUnitario: Number(producto.precio_unidad), 
      cantidad: Number(itemForm.cantidad),
      unidad: producto.unidad || 'u.',
      subtotal: Number(producto.precio_unidad) * Number(itemForm.cantidad)
    };

    setItems([...items, nuevoItem]);
    setItemForm({ productoId: '', cantidad: 1 }); 
  };

  const eliminarItem = (idItem) => setItems(items.filter(item => item.id !== idItem));

  const subtotalGeneral = items.reduce((acc, item) => acc + item.subtotal, 0);
  const porcentajeIva = Number(config.iva) || 21; 
  const valorIva = subtotalGeneral * (porcentajeIva / 100);
  const totalGeneral = subtotalGeneral + valorIva;

  const handleFinalizarYGuardar = async () => {
    if (items.length === 0) {
      mostrarNotificacion("Debes agregar al menos un servicio a la cotización.", "error");
      return;
    }
    
    setGuardando(true);
    try {
      const payload = {
        id_cliente: clienteSeleccionado,
        items: items,
        subtotal: subtotalGeneral,
        iva_porcentaje: porcentajeIva,
        total: totalGeneral
      };

      const resultado = await apiService.guardarPost('guardarPresupuesto', payload);
      
      setPresupuestoGeneradoData(resultado.id_presupuesto);
      
      if(resultado.nuevo_numero) {
        setConfig({...config, ultimo_numero: resultado.nuevo_numero});
      }

      // Mostramos el aviso de éxito un instante antes de cambiar la vista
      mostrarNotificacion("Cotización guardada en la nube con éxito.");
      
      // Pequeña pausa para que el usuario perciba que se guardó antes de ver el PDF
      setTimeout(() => {
        setModoVista('previa');
      }, 600);

    } catch (error) {
      mostrarNotificacion("Error de conexión: " + error.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  if (modoVista === 'previa') {
    const datosClienteCompleto = clientes.find(c => c.id === clienteSeleccionado || c.cuit === clienteSeleccionado);
    return (
      <VistaPrevia 
        cliente={datosClienteCompleto} 
        items={items} 
        totalNeto={subtotalGeneral}
        iva={valorIva}
        totalFinal={totalGeneral}
        numeroPresupuesto={presupuestoGeneradoData} 
        onVolver={() => {
          setModoVista('edicion');
          setItems([]);
          setClienteSeleccionado('');
        }} 
      />
    );
  }

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

      <div className="border-b border-gray-100 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-titulo font-black text-negro tracking-tight">Nueva Cotización</h2>
        </div>
        <div className="bg-blanco border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-gris-claro uppercase tracking-wider">I.V.A. Aplicado</p>
          <p className="text-lg font-titulo font-black text-negro text-right">{porcentajeIva}%</p>
        </div>
      </div>

      {/* Bloque 1: Cliente */}
      <div className="bg-blanco p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-sub font-bold text-gris-claro uppercase tracking-widest mb-5">1. Seleccionar Cliente</h3>
        <select 
          value={clienteSeleccionado} 
          onChange={(e) => setClienteSeleccionado(e.target.value)} 
          className="w-full md:w-1/2 p-3 bg-fondo border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-rojo text-negro transition-all"
        >
          <option value="">-- Elija un cliente del directorio --</option>
          {clientes.map((cliente, i) => (
            <option key={cliente.id || i} value={cliente.id || cliente.cuit}>
              {cliente.empresa} {cliente.cuit ? `(${cliente.cuit})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Bloque 2: Ítems */}
      <div className="bg-blanco p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-sub font-bold text-gris-claro uppercase tracking-widest mb-5">2. Agregar Servicios o Materiales</h3>
        <form onSubmit={handleAgregarItem} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gris-claro uppercase mb-2">Catálogo de Tarifas</label>
            <select 
              value={itemForm.productoId} 
              onChange={(e) => setItemForm({...itemForm, productoId: e.target.value})} 
              required 
              className="w-full p-3 bg-fondo border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-rojo text-negro transition-all"
            >
              <option value="">-- Buscar ítem --</option>
              {productos.map((prod, i) => (
                <option key={prod.id || i} value={prod.id || prod.codigo}>
                  {prod.codigo} | {prod.nombre} ({formatearMoneda(prod.precio_unidad)} x {prod.unidad})
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-xs font-bold text-gris-claro uppercase mb-2">Cantidad</label>
            <input 
              type="number" min="0.1" step="0.1" 
              value={itemForm.cantidad} 
              onChange={(e) => setItemForm({...itemForm, cantidad: e.target.value})} 
              required 
              className="w-full p-3 bg-fondo border border-gray-200 rounded-lg text-center outline-none focus:ring-2 focus:ring-rojo text-negro transition-all" 
            />
          </div>
          <button type="submit" className="w-full md:w-auto bg-negro hover:bg-rojo text-blanco font-sub tracking-widest uppercase py-3 px-8 rounded-lg transition-all shadow-sm">
            Añadir
          </button>
        </form>
      </div>

      {/* Bloque 3: Tabla y Totales */}
      <div className="bg-blanco rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left font-texto text-sm">
          <thead className="bg-fondo border-b border-gray-100">
            <tr>
              <th className="p-4 font-sub font-bold text-gris-oscuro uppercase tracking-wider text-xs">Descripción</th>
              <th className="p-4 font-sub font-bold text-gris-oscuro uppercase tracking-wider text-xs text-center">Cant.</th>
              <th className="p-4 font-sub font-bold text-gris-oscuro uppercase tracking-wider text-xs text-right">Unitario</th>
              <th className="p-4 font-sub font-bold text-gris-oscuro uppercase tracking-wider text-xs text-right">Subtotal</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-fondo/50 transition-colors group">
                <td className="p-4">
                  <p className="font-bold text-negro">{item.nombre}</p>
                </td>
                <td className="p-4 text-center font-bold text-gris-oscuro">
                  {item.cantidad} <span className="text-xs font-normal text-gris-claro">{item.unidad}</span>
                </td>
                <td className="p-4 text-right text-gris-oscuro">{formatearMoneda(item.precioUnitario)}</td>
                <td className="p-4 text-right font-bold text-rojo">{formatearMoneda(item.subtotal)}</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => eliminarItem(item.id)} 
                    className="text-gray-300 hover:text-rojo transition-colors"
                    title="Eliminar línea"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gris-claro font-texto">
                  No hay servicios agregados a la cotización todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {items.length > 0 && (
          <div className="bg-fondo p-8 flex flex-col items-end border-t border-gray-100">
            <div className="w-full md:w-1/3 space-y-3 font-texto">
              <div className="flex justify-between text-gris-oscuro">
                <span>Subtotal Neto:</span>
                <span className="font-semibold text-negro">{formatearMoneda(subtotalGeneral)}</span>
              </div>
              <div className="flex justify-between text-gris-oscuro">
                <span>I.V.A. ({porcentajeIva}%):</span>
                <span className="font-semibold text-negro">{formatearMoneda(valorIva)}</span>
              </div>
              <div className="flex justify-between pt-5 border-t border-gray-200 text-2xl text-negro font-titulo font-black">
                <span>TOTAL:</span>
                <span className="text-rojo">{formatearMoneda(totalGeneral)}</span>
              </div>
              
              <button 
                onClick={handleFinalizarYGuardar}
                disabled={!clienteSeleccionado || guardando}
                className={`w-full mt-8 py-4 rounded-lg font-sub font-bold uppercase tracking-widest text-blanco transition-all shadow-md
                  ${!clienteSeleccionado || guardando 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-negro hover:bg-rojo hover:-translate-y-0.5'
                  }`}
              >
                {guardando ? 'Sincronizando...' : 'Guardar y Ver Oficial'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}