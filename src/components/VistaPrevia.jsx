import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Importamos los activos para que Vite los procese correctamente en producción
import logoPdf from '../assets/logo.png';
import marcaAguaPdf from '../assets/marca-de-agua.png';

// ==========================================
// MOTOR DE TRADUCCIÓN: NÚMEROS A LETRAS
// ==========================================
const numeroALetras = (numero) => {
  const Unidades = (num) => {
    switch(num) {
      case 1: return 'UN';
      case 2: return 'DOS';
      case 3: return 'TRES';
      case 4: return 'CUATRO';
      case 5: return 'CINCO';
      case 6: return 'SEIS';
      case 7: return 'SIETE';
      case 8: return 'OCHO';
      case 9: return 'NUEVE';
      default: return '';
    }
  };

  const Decenas = (num) => {
    const decena = Math.floor(num/10);
    const unidad = num - (decena * 10);
    switch(decena) {
      case 1:
        switch(unidad) {
          case 0: return 'DIEZ';
          case 1: return 'ONCE';
          case 2: return 'DOCE';
          case 3: return 'TRECE';
          case 4: return 'CATORCE';
          case 5: return 'QUINCE';
          default: return 'DIECI' + Unidades(unidad);
        }
      case 2:
        switch(unidad) {
          case 0: return 'VEINTE';
          default: return 'VEINTI' + Unidades(unidad);
        }
      case 3: return DecenasY('TREINTA', unidad);
      case 4: return DecenasY('CUARENTA', unidad);
      case 5: return DecenasY('CINCUENTA', unidad);
      case 6: return DecenasY('SESENTA', unidad);
      case 7: return DecenasY('SETENTA', unidad);
      case 8: return DecenasY('OCHENTA', unidad);
      case 9: return DecenasY('NOVENTA', unidad);
      case 0: return Unidades(unidad);
      default: return '';
    }
  };

  const DecenasY = (strSin, numUnidades) => {
    if (numUnidades > 0) return strSin + ' Y ' + Unidades(numUnidades);
    return strSin;
  };

  const Centenas = (num) => {
    const centenas = Math.floor(num / 100);
    const decenas = num - (centenas * 100);
    switch(centenas) {
      case 1:
        if (decenas > 0) return 'CIENTO ' + Decenas(decenas);
        return 'CIEN';
      case 2: return 'DOSCIENTOS ' + Decenas(decenas);
      case 3: return 'TRESCIENTOS ' + Decenas(decenas);
      case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
      case 5: return 'QUINIENTOS ' + Decenas(decenas);
      case 6: return 'SEISCIENTOS ' + Decenas(decenas);
      case 7: return 'SETECIENTOS ' + Decenas(decenas);
      case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
      case 9: return 'NOVECIENTOS ' + Decenas(decenas);
      default: return Decenas(decenas);
    }
  };

  const Seccion = (num, divisor, strSingular, strPlural) => {
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    let letras = '';
    if (cientos > 0) {
      if (cientos > 1) letras = Centenas(cientos) + ' ' + strPlural;
      else letras = strSingular;
    }
    if (resto > 0) letras += '';
    return letras;
  };

  const Miles = (num) => {
    const divisor = 1000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
    if (strMiles === 'UN MIL') strMiles = 'MIL'; 
    const strCentenas = Centenas(resto);
    if(strMiles === '') return strCentenas;
    return strMiles + (strCentenas ? ' ' + strCentenas : '');
  };

  const Millones = (num) => {
    const divisor = 1000000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    const strMillones = Seccion(num, divisor, 'UN MILLON', 'MILLONES');
    const strMiles = Miles(resto);
    if(strMillones === '') return strMiles;
    return strMillones + (strMiles ? ' ' + strMiles : '');
  };

  // Corrección: Redondear el número al entero más cercano para coincidir con la vista
  const numeroRedondeado = Math.round(numero);

  if (numeroRedondeado === 0) return 'SON PESOS: CERO.-';
  
  const letrasEnteros = Millones(numeroRedondeado).trim();

  return `SON PESOS: ${letrasEnteros}.-`;
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function VistaPrevia({ cliente, items, totalNeto, iva, totalFinal, numeroPresupuesto, onVolver }) {
  const [generando, setGenerando] = useState(false);

  const fechaActual = new Date().toLocaleDateString('es-AR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const fechaArchivo = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0
    }).format(valor);
  };

  const handleExportarPDF = async () => {
    setGenerando(true);
    
    const cargarImagen = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
      });
    };

    try {
      const doc = new jsPDF();
      
      const colorRojo = [220, 38, 38]; 
      const colorTextoOscuro = [50, 50, 50];
      
      let logoImg = null;
      let marcaAguaImg = null;
      
      try {
        logoImg = await cargarImagen(logoPdf);
        marcaAguaImg = await cargarImagen(marcaAguaPdf);
      } catch (e) {
        console.warn("Error cargando imágenes desde assets", e);
      }

      // --- CABECERA IZQUIERDA ---
      if (logoImg) {
        doc.addImage(logoImg, 'PNG', 14, 10, 55, 30); 
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("CUIT: ", 14, 48);
      doc.setTextColor(colorRojo[0], colorRojo[1], colorRojo[2]);
      doc.text("20375998867", 26, 48);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colorTextoOscuro[0], colorTextoOscuro[1], colorTextoOscuro[2]);
      doc.text("San Francisco 2031, 5700 San Luis, Argentina", 14, 54);
      doc.text("2664565098 / 2664162063", 14, 58);
      doc.text("transportedonroque@outlook.com", 14, 62);

      // --- CABECERA DERECHA ---
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(fechaActual, 196, 25, { align: "right" });

      doc.setFontSize(28);
      doc.setTextColor(colorRojo[0], colorRojo[1], colorRojo[2]);
      doc.text("COTIZACIÓN", 196, 42, { align: "right" });

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(numeroPresupuesto || "P2026/00", 196, 50, { align: "right" });

      // --- DATOS DEL CLIENTE ---
      doc.setFillColor(colorRojo[0], colorRojo[1], colorRojo[2]);
      doc.rect(130, 60, 66, 7, "F"); 
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("Datos del cliente.", 163, 65, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(cliente?.empresa || 'Consumidor Final', 130, 73);

      // --- MARCA DE AGUA (Fondo) ---
      if (marcaAguaImg) {
        doc.addImage(marcaAguaImg, 'PNG', 50, 110, 110, 110);
      }

      // --- TABLA DE ÍTEMS ---
      const tableColumn = ["Descripción.", "UDS", "PRECIO UNITARIO", "IMPORTE"];
      const tableRows = items.map(item => [
        item.nombre,
        `${item.cantidad} ${item.unidad || 'u.'}`,
        formatearMoneda(item.precioUnitario),
        formatearMoneda(item.subtotal)
      ]);

      autoTable(doc, {
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'plain', 
        headStyles: { fillColor: colorRojo, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 11 },
        bodyStyles: { textColor: colorTextoOscuro, fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 80, halign: 'left' },
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right', fontStyle: 'bold' }
        }
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      
      // --- TOTALES ---
      doc.setFontSize(10);
      doc.setTextColor(colorRojo[0], colorRojo[1], colorRojo[2]);
      
      doc.text("Subtotal (Neto)", 150, finalY);
      doc.text(formatearMoneda(totalNeto), 196, finalY, { align: "right" });

      doc.text("I.V.A.", 150, finalY + 8);
      doc.text(formatearMoneda(iva), 196, finalY + 8, { align: "right" });

      doc.setFillColor(colorRojo[0], colorRojo[1], colorRojo[2]);
      doc.rect(130, finalY + 12, 66, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL FINAL", 132, finalY + 18.5);
      doc.text(formatearMoneda(totalFinal), 194, finalY + 18.5, { align: "right" });

      // --- CÁLCULO DE POSICIÓN DEL FOOTER ---
      const bottomY = Math.max(finalY + 40, 230); 

      // Caja gris de "SON PESOS"
      doc.setFillColor(243, 244, 246); 
      doc.roundedRect(14, bottomY, 182, 14, 1, 1, "F");
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      
      // Conversión del monto a texto (ahora utilizará el número redondeado)
      const textoLetras = numeroALetras(totalFinal);
      doc.text(textoLetras, 18, bottomY + 8.5);

      // Bloque de Condiciones
      doc.setFillColor(colorRojo[0], colorRojo[1], colorRojo[2]);
      doc.rect(14, bottomY + 22, 1.5, 5, "F"); 
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("CONDICIONES DEL SERVICIO", 18, bottomY + 26);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(colorTextoOscuro[0], colorTextoOscuro[1], colorTextoOscuro[2]);
      
      const condiciones = [
        "Validez del presupuesto 15 dias",
        "El inicio de las tareas y entrega de material estará sujeto a condiciones climáticas favorables",
        "El presupuesto incluye la provisión del material, carga, transporte y descarga.",
        "El método de pago esta sujeto a mutuo acuerdo de ambas partes."
      ];

      let condY = bottomY + 34;
      condiciones.forEach(cond => {
        doc.setTextColor(colorRojo[0], colorRojo[1], colorRojo[2]);
        doc.text("•", 20, condY); 
        doc.setTextColor(colorTextoOscuro[0], colorTextoOscuro[1], colorTextoOscuro[2]);
        doc.text(cond, 24, condY); 
        condY += 5;
      });

      const nombreArchivo = `Cotizacion_${cliente?.empresa.replace(/\s+/g, '_')}_${fechaArchivo}.pdf`;
      doc.save(nombreArchivo);
      
    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onVolver}
          className="text-gris-claro hover:text-rojo font-sub font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
          ← Modificar Presupuesto
        </button>
      </div>

      <div className="bg-blanco p-10 rounded-xl shadow-sm border border-gray-100 text-center">
        <img src={logoPdf} alt="Logo" className="h-24 mx-auto mb-6 object-contain" />
        
        <h2 className="text-3xl font-titulo font-black text-negro mb-2 tracking-wide">
          COTIZACIÓN <span className="text-rojo">{numeroPresupuesto}</span>
        </h2>
        <p className="text-gris-claro font-texto mb-10">
          El documento final se descargará en formato PDF con la identidad visual completa.
        </p>
        
        <div className="bg-fondo p-8 rounded-lg text-left grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto font-texto border border-gray-100">
          <div className="md:col-span-1">
            <p className="text-xs font-bold text-gris-claro uppercase mb-1">Cliente</p>
            <p className="font-bold text-negro text-lg">{cliente?.empresa}</p>
          </div>
          <div className="md:col-span-1">
            <p className="text-xs font-bold text-gris-claro uppercase mb-1">Subtotal Neto</p>
            <p className="font-bold text-gris-oscuro text-lg">{formatearMoneda(totalNeto)}</p>
          </div>
          <div className="md:col-span-1">
            <p className="text-xs font-bold text-gris-claro uppercase mb-1">I.V.A.</p>
            <p className="font-bold text-gris-oscuro text-lg">{formatearMoneda(iva)}</p>
          </div>
          <div className="md:col-span-1 bg-rojo p-3 rounded text-blanco shadow-inner">
            <p className="text-xs font-bold text-rojo-100 uppercase mb-1 opacity-80">Total Final</p>
            <p className="font-titulo font-black text-xl">{formatearMoneda(totalFinal)}</p>
          </div>
        </div>

        <button 
          onClick={handleExportarPDF}
          disabled={generando}
          className={`mt-10 px-10 py-5 rounded-lg font-sub font-bold tracking-widest uppercase text-blanco transition-all duration-300 shadow-xl ${generando ? 'bg-gris-claro cursor-not-allowed' : 'bg-rojo hover:bg-negro hover:-translate-y-1'}`}
        >
          {generando ? 'CONSTRUYENDO PDF...' : 'DESCARGAR COTIZACIÓN OFICIAL'}
        </button>
      </div>
    </div>
  );
}