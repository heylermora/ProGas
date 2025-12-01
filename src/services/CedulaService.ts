import { CedulaResponse } from '../interfaces/CedulaResponse';

const API_BASE_URL = 'https://apis.gometa.org/cedulas';

/**
 * Busca los datos del cliente por su número de cédula.
 * @param cedula El número de cédula sin espacios ni guiones.
 * @returns Una promesa que resuelve con el nombre completo del cliente o null si falla.
 */
export const fetchClientNameByCedula = async (cedula: string): Promise<string | null> => {
    const cleanCedula = cedula.replace(/[^\d]/g, '');

    if (!cleanCedula) {
        return null;
    }

    const url = `${API_BASE_URL}/${cleanCedula}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // Manejar errores HTTP (ej: 404, 500)
            console.error(`Error HTTP: ${response.status}`);
            return null;
        }

        const data: CedulaResponse = await response.json();
        
        // La API devuelve el nombre completo en el campo 'nombre'
        if (data.nombre) {
            return data.nombre;
        }
        
        // Si no hay 'nombre' pero la respuesta fue 200, podría ser que no se encontró
        return null;

    } catch (error) {
        console.error('Error al obtener datos de la cédula:', error);
        return null; // Devolver null en caso de fallo de red o parseo
    }
};