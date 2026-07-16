export type LocationOptions = Record<string, Record<string, Record<string, string[]>>>;

// División Territorial Administrativa de Costa Rica (IGN, edición 2024).
// Source: https://www.snitcr.go.cr/ico_servicios_ogc_info?k=bm9kbzo6MjY=&nombre=IGN%20Divisi%C3%B3n%20Territorial%20Administrativa
// “Barrio” is not a closed administrative level: the DTA catalogs both barrios
// and poblados, while local names can change without creating a new district.
export const locationOptions: LocationOptions = {
  'San José': {
    Acosta: {
      'San Ignacio': ['Centro', 'Chirraca', 'Turrujal'],
      Guaitil: ['Guaitil centro', 'La Cruz'],
      Palmichal: ['Palmichal centro', 'Bajo Arias'],
      Cangrejal: ['Cangrejal centro'],
      Sabanillas: ['Sabanillas centro', 'Bajos de Jorco'],
    },
    Aserrí: {
      Aserrí: ['Centro', 'Poás'],
      Tarbaca: ['Tarbaca centro'],
      'Vuelta de Jorco': ['Vuelta de Jorco centro'],
      'San Gabriel': ['San Gabriel centro'],
      Legua: ['Legua centro'],
      Monterrey: ['Monterrey centro'],
      Salitrillos: ['Salitrillos centro'],
    },
    Desamparados: {
      Desamparados: ['Centro'],
      'San Miguel': ['San Miguel centro'],
      'San Juan de Dios': ['San Juan de Dios centro'],
      'San Rafael Arriba': ['San Rafael Arriba centro'],
      'San Antonio': ['San Antonio centro'],
      Frailes: ['Frailes centro', 'Bustamante'],
      Patarrá: ['Patarrá centro'],
      'San Cristóbal': ['San Cristóbal Norte', 'San Cristóbal Sur'],
      Rosario: ['Rosario centro', 'La Fila'],
      Damas: ['Damas centro'],
      'San Rafael Abajo': ['San Rafael Abajo centro'],
      Gravilias: ['Gravilias centro'],
      'Los Guido': ['Los Guido centro'],
    },
    Mora: {
      Colón: ['Ciudad Colón centro', 'Brasil'],
      Guayabo: ['Guayabo centro'],
      Tabarcia: ['Tabarcia centro'],
      'Piedras Negras': ['Piedras Negras centro'],
      Picagres: ['Picagres centro'],
      Jaris: ['Jaris centro'],
      Quitirrisí: ['Quitirrisí centro'],
    },
    Puriscal: {
      Santiago: ['Santiago centro'],
      'Mercedes Sur': ['Mercedes Sur centro'],
      Barbacoas: ['Barbacoas centro'],
      'Grifo Alto': ['Grifo Alto centro'],
      'San Rafael': ['San Rafael centro'],
      Candelarita: ['Candelarita centro'],
      Desamparaditos: ['Desamparaditos centro'],
      'San Antonio': ['San Antonio centro'],
      Chires: ['Chires centro'],
    },
    Tarrazú: {
      'San Marcos': ['San Marcos centro', 'Bajo San Juan'],
      'San Lorenzo': ['San Lorenzo centro', 'Santa Marta'],
      'San Carlos': ['San Carlos centro', 'Bajo Canet'],
    },
  },
};
