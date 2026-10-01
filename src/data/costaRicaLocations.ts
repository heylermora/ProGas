export type LocationCatalog = Record<string, Record<string, Record<string, string[]>>>;

export const COSTA_RICA_CATALOG_VERSION = 'service-area-2026-01';

// Offline fallback for the current delivery area. TerritoryService augments this
// with the nationwide catalogue endpoint when it is available.
export const serviceAreaLocations: LocationCatalog = {
  'San José': {
    Acosta: {
      'San Ignacio': ['San Ignacio (centro)', 'Abarca', 'Corral', 'María Auxiliadora', 'Ortiga', 'Pozos', 'San Martín (San Gerardo)', 'San Luis', 'Turrujal', 'Vereda', 'Aguablanca (parte)', 'Alto Escalera', 'Alto Los Mora', 'Ángeles', 'Chirraca (parte)', 'Esperanza', 'Potrerillos', 'Resbalón', 'Tablazo'],
      Guaitil: ['Guaitil (centro)', 'Alto Sierra', 'Alto Vigía', 'Bajo Arias', 'Bajo Bermúdez', 'Bajo Calvo', 'Bajo Cárdenas', 'Bajo Moras', 'Coyolar', 'Hondonada', 'La Cruz', 'Lagunillas (parte)', 'Ococa', 'Toledo', 'Zapote'],
      Palmichal: ['Palmichal (centro)', 'San Pablo', 'Agua Blanca (parte)', 'Bajo Cerdas', 'Bajos de Jorco', 'Bolívar', 'Cañadas', 'Caragral', 'Corazón de Jesús', 'Charcalillo', 'Chirraca (parte)', 'Fila', 'Jaular', 'Lagunillas (parte)', 'La Mina', 'La Pita', 'Los Monge', 'Playa', 'Sevilla'],
      Cangrejal: ['Cangrejal (centro)', 'Bajo Los Cruces', 'Ceiba Alta (parte)', 'Ceiba Baja', 'Ceiba Este', 'Escuadra', 'Gravilias', 'Lindavista', 'Llano Bonito', 'Mesa', 'Naranjal', 'Perpetuo Socorro', 'Tejar', 'Tiquires'],
      Sabanillas: ['Sabanillas (centro)', 'Alto Parritón', 'Bajo Palma', 'Bajo Pérez', 'Bijagual', 'Breñón', 'Caspirola', 'Colorado', 'Cuesta Aguacate', 'Limas', 'Parritón', 'Plomo', 'Sabanas', 'San Jerónimo', 'Soledad', 'Téruel', 'Tiquiritos', 'Zoncuano'],
    },
    Aserrí: {
      Aserrí: ['Centro', 'Poás', 'Salitrillos'],
      Tarbaca: ['Tarbaca centro', 'Vuelta de Jorco'],
      'Vuelta de Jorco': ['Vuelta de Jorco centro', 'Legua'],
      Monterrey: ['Monterrey centro', 'La Uruca'],
    },
    Desamparados: {
      Frailes: ['Frailes centro', 'Bustamante'],
      'San Cristóbal': ['San Cristóbal Norte', 'San Cristóbal Sur'],
      Rosario: ['Rosario centro', 'La Fila'],
    },
    Mora: {
      Colón: ['Ciudad Colón centro', 'Brasil'],
      Guayabo: ['Guayabo centro', 'Tabarcia'],
      Picagres: ['Picagres centro', 'Jaris'],
    },
    Puriscal: {
      Santiago: ['Santiago centro', 'Mercedes Sur'],
      Barbacoas: ['Barbacoas centro', 'Grifo Alto'],
      Candelarita: ['Candelarita centro', 'Desamparaditos'],
    },
    Tarrazú: {
      'San Marcos': ['San Marcos centro', 'Bajo San Juan'],
      'San Lorenzo': ['San Lorenzo centro', 'Santa Marta'],
      'San Carlos': ['San Carlos centro', 'Bajo Canet'],
    },
  },
};
