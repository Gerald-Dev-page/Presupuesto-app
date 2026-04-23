// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL;

export const apiService = {
  obtenerDatosBase: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getInitialData`);
      if (!response.ok) throw new Error('Error al conectar');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  guardarPost: async (action, payload) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: action, payload: payload })
      });
      const json = await response.json();
      if (json.status !== 200) throw new Error(json.message || "Error al guardar");
      return json.data; // Retorna los datos insertados con el nuevo ID
    } catch (error) {
      console.error("Error en POST:", error);
      throw error;
    }
  }
};