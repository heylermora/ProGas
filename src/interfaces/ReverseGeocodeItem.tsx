export type LngLatTuple = [number, number];

export interface ReverseGeocodeItem {
  fullAddress: string;      // Dirección completa legible
  neighborhood?: string;    // Barrio / vecindario
  district?: string;        // Distrito
  county?: string;          // Cantón
  province?: string;        // Provincia
  country?: string;         // País
  raw: any;                 // Respuesta completa de Mapbox por si necesitas más
}

export interface InitialLocationItem {
  center: LngLatTuple;
  marker: LngLatTuple | null; // null cuando NO queremos coords por defecto
}