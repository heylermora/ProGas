# Spike técnico: direcciones de clientes y entregas en Costa Rica

## 1. Alcance y decisión que debe habilitar

Este documento describe el comportamiento que existe hoy y propone una arquitectura objetivo. **No implementa todavía el nuevo modelo, un proveedor de geocodificación ni una migración.** La decisión recomendada es separar:

1. el catálogo territorial oficial y versionado;
2. las direcciones guardadas por el cliente;
3. la fotografía inmutable de la dirección utilizada por cada pedido; y
4. la geocodificación, detrás de un adaptador del servidor que no ate el dominio a Google, Mapbox u otro proveedor.

## 2. Inventario del sistema actual

### 2.1 Persistencia y entidades

La aplicación es un cliente React que accede directamente a Firestore mediante funciones genéricas. No hay en este repositorio una API propia, controladores HTTP, base de datos relacional, tablas ni DTOs de backend.

| Concepto | Implementación actual | Persistencia |
| --- | --- | --- |
| Cliente | `ClientItem` | Documento en `Clients` |
| Dirección principal del cliente | Objeto opcional `ClientItem.address` | Anidado en el documento del cliente |
| Dirección del pedido | Objeto obligatorio `OrderItem.location` | Anidado en el documento de `Orders` |
| Borrador del checkout | `CustomerDraft` / `CustomerDraftAddress` | `sessionStorage`, clave `gasMemoCustomerDraft` |
| Resultado de geocodificación inversa | `ReverseGeocodeItem` | Solo interfaz; no tiene consumidor ni persistencia |

`ClientItem.address` contiene textos opcionales para `province`, `canton`, `district`, `neighborhood` y `details`, además de `coordinates` y `locationUrl`. No existe `Address`, `DeliveryAddress` o `CustomerAddress` como entidad independiente, ni soporte para varias direcciones o una dirección predeterminada.

`OrderItem.location` no replica la estructura territorial. Guarda una sola cadena `address`, `lat`/`lng` opcionales, una cadena opcional `coordinates` y una URL opcional. El pedido se vincula lógicamente con el cliente por `clientId`, pero no hay una referencia a una dirección guardada ni una versión del domicilio.

### 2.2 Catálogos geográficos

No existen colecciones, tablas, JSON, seeders ni scripts para provincias, cantones, distritos o localidades. El único catálogo está codificado dentro de `CustomerInfo.tsx` como un objeto `locationOptions`:

- solo ofrece la provincia San José;
- incluye una selección parcial de cantones vecinos de Acosta;
- ofrece distritos parciales;
- usa una lista artesanal llamada `neighborhood` para barrios o localidades;
- no guarda códigos territoriales ni versión/fuente del dato.

Por lo tanto, los nombres se almacenan como texto libre y no pueden distinguirse de forma estable ante homónimos, cambios de nombre o correcciones ortográficas.

### 2.3 Flujo público actual

1. `CustomerData` busca al cliente por cédula. Si existe, copia su dirección al borrador de sesión. Si no existe, intenta recuperar el nombre y continúa.
2. `CustomerInfo` inicializa valores predeterminados (`San José`, `Acosta`, `San Ignacio`, `Centro`), presenta selects dependientes sobre el catálogo embebido y exige nombre y señas.
3. Al crear un cliente, `ClientService.createPublic` guarda el objeto `address` dentro de `Clients/{hash-de-cédula}`. Si el cliente ya existe, este flujo **no actualiza** la dirección que haya corregido en pantalla; solo actualiza el borrador de sesión.
4. `Products` permite usar la dirección del borrador o escribir una dirección alternativa para ese pedido. Convierte la dirección estructurada del cliente en texto usando solo distrito, barrio y señas; provincia y cantón se pierden en `OrderItem.location.address`.
5. El pedido guarda la dirección resultante como una fotografía textual, las coordenadas como cadena y un enlace de Maps.

### 2.4 GPS, mapas y geocodificación

`DeviceLocationMap` usa `navigator.geolocation.getCurrentPosition` con precisión alta. El resultado:

- se redondea a seis decimales y se almacena como la cadena `"latitud,longitud"`;
- genera una URL pública de búsqueda de Google Maps;
- se muestra en un `iframe` de Google Maps construido con una URL sin API key.

No hay llamada de geocodificación inversa. Usar ubicación actual **no completa** provincia, cantón, distrito ni pueblo. La interfaz `ReverseGeocodeItem` menciona Mapbox y posee un `raw: any`, pero está huérfana: no existe servicio, hook o componente que la utilice. Aunque `leaflet`, `@types/leaflet` y `@types/react-leaflet` figuran en dependencias, no hay importaciones de Leaflet en `src`.

El panel administrativo conserva rastros de un contrato anterior para campos dinámicos de tipo `location` (`coords`, `address`, `isManualAddress`), mientras el modelo vigente espera `address`, `lat`, `lng`, `coordinates` y `locationUrl`. No se encontró un renderer activo para ese tipo. Esta divergencia hace que la creación/edición administrativa sea especialmente frágil.

### 2.5 Validaciones actuales

- Cliente: cédula no vacía, teléfono de al menos ocho dígitos, nombre y señas requeridos, y límites básicos de longitud.
- Territorio: el navegador limita las opciones a las claves del pequeño objeto local, pero los modelos y Firestore no validan catálogo, jerarquía o códigos.
- GPS: no se valida que la coordenada esté en Costa Rica, dentro del área de servicio, ni que la cadena tenga formato/rango válido.
- Pedido: solo se exige que `effectiveAddress` no esté vacía.
- No se valida coherencia entre texto y coordenadas, precisión, antigüedad, proveedor, consentimiento o confianza de la detección.

### 2.6 Uso operativo real

La dirección actual sirve para:

- mostrar señas al personal;
- generar enlaces de Google Maps/Waze y mensajes de entrega;
- visualizar un mapa durante el checkout.

No se encontró lógica que use provincia, cantón, distrito, localidad o distancia para calcular tarifa, disponibilidad, zona de cobertura, asignación de repartidor, ETA u optimización de ruta. Hoy esos datos son informativos; stock, total y pagos no dependen de la dirección.

## 3. Problemas y riesgos

1. **Cobertura territorial incompleta.** Un catálogo embebido y parcial no soporta Costa Rica ni puede actualizarse sin desplegar frontend.
2. **Ausencia de identidad territorial.** Guardar solo nombres impide integridad referencial y análisis confiable.
3. **“Barrio” no equivale necesariamente a pueblo/localidad.** La lista mezcla centros, barrios y poblados, sin fuente o código.
4. **Dos contratos incompatibles.** Cliente y pedido representan la misma dirección con formas distintas; además existe el contrato legado `coords`.
5. **Duplicación inconsistente.** Coordenadas aparecen como cadena y también como `lat`/`lng`; el enlace de mapas es dato derivable y puede quedar desactualizado.
6. **Snapshot incompleto.** El pedido pierde provincia y cantón, dificultando auditoría y reconstrucción histórica.
7. **Una sola dirección por cliente.** No hay casa/trabajo, alias, predeterminada, historial ni baja lógica.
8. **GPS sin reverse geocoding.** Obtener coordenadas no satisface el autocompletado territorial solicitado.
9. **Corrección insuficiente.** La localidad solo puede elegirse del arreglo fijo; no ofrece cercanas ni texto corregible con procedencia.
10. **Privacidad y seguridad.** Direcciones y coordenadas son PII. El flujo público llama Firestore directamente, mientras las reglas versionadas restringen `Clients` y `Orders` a personal autenticado; el contrato de seguridad y el checkout público no son compatibles al desplegar esas reglas.
11. **Dependencia implícita de un proveedor.** Se persisten URLs de Google y existe una interfaz nominal de Mapbox, sin una frontera de integración clara.

El modelo permite completar un pedido básico con señas, pero **no** permite garantizar una jerarquía territorial válida, ofrecer localidades cercanas confiables, calcular cobertura por zona, cambiar de proveedor sin migrar datos, ni mantener múltiples direcciones de cliente con trazabilidad.

## 4. Arquitectura objetivo recomendada

### 4.1 Modelo canónico

Definir un `AddressValue` compartido por frontend y backend:

```ts
type AddressSource = 'gps' | 'manual' | 'saved';

interface AddressValue {
  province: { code: string; name: string };
  canton: { code: string; name: string };
  district: { code: string; name: string };
  locality: { id?: string; name: string; source?: string };
  exactAddress: string;
  additionalDirections?: string;
  position?: { latitude: number; longitude: number; accuracyMeters?: number };
  captureSource: AddressSource;
  geocoding?: {
    provider: string;
    providerPlaceId?: string;
    confidence?: number;
    precision?: string;
    resolvedAt: string;
  };
  catalogVersion: string;
}
```

Reglas del modelo:

- códigos y nombres territoriales se guardan juntos: el código da identidad y el nombre preserva el snapshot legible;
- latitud/longitud son números, no una cadena; para Firestore puede evaluarse `GeoPoint`, manteniendo un DTO serializable en los límites;
- `locationUrl` no es dato fuente: se genera al mostrar/compartir;
- localidad admite identificador cuando el catálogo lo ofrece, pero también nombre corregido por el usuario;
- `exactAddress` y `additionalDirections` permanecen separados;
- nunca se persiste la respuesta `raw` completa del proveedor.

### 4.2 Separación entre cliente y pedido

**Direcciones de cliente** (`Clients/{clientId}/addresses/{addressId}` o colección equivalente): múltiples registros, alias, `isDefault`, timestamps, estado activo y `AddressValue`.

**Pedido**: debe copiar un `deliveryAddressSnapshot: AddressValue` completo al confirmar. Puede guardar `customerAddressId` como trazabilidad, pero nunca depender de leer la dirección actual del cliente: editar “Casa” no debe cambiar pedidos históricos.

Durante una transición, conservar `location.address` como texto de compatibilidad generado desde el snapshot y leer ambos formatos con un adaptador. No hacer una migración destructiva en el primer despliegue.

### 4.3 Catálogo territorial

Crear un catálogo versionado fuera del componente, generado desde una fuente oficial validada antes de implementar. Mínimo:

- `Province(code, name)`;
- `Canton(code, provinceCode, name)`;
- `District(code, cantonCode, name)`;
- `Locality(id, districtCode, name, aliases?, centroid?, source, sourceVersion)`.

Provincia/cantón/distrito deben ser jerárquicos y estables por código. Para pueblos/localidades conviene una capa más flexible: las fuentes y granularidades pueden variar, por lo que el nombre corregido debe poder convivir con una sugerencia catalogada.

Para el tamaño de Costa Rica, una primera versión puede publicarse como artefactos JSON estáticos, versionados y cacheables. Si administración necesita actualizaciones sin deploy o búsquedas geoespaciales, migrar el catálogo a un servicio/colecciones de solo lectura. El repositorio debe incluir un importador idempotente, validación de jerarquía, checksum, fuente y fecha de corte; no un arreglo escrito manualmente.

### 4.4 Servicios y fronteras

Añadir estas abstracciones, independientemente del proveedor elegido:

- `TerritoryCatalogService`: lista provincias/cantones/distritos y busca localidades por distrito/texto.
- `GeocodingGateway` en backend: `reverse(latitude, longitude)` y, solo si se necesita, `forward(address)`.
- `TerritoryResolver`: normaliza la respuesta del proveedor contra códigos oficiales y devuelve candidatos/confianza, sin inventar coincidencias.
- `CustomerAddressService`: CRUD de direcciones guardadas con autorización.
- `DeliveryPolicyService` futuro: cobertura, tarifa y reglas de negocio. No mezclarlo con geocodificación.

La clave del proveedor y sus llamadas deben estar en un backend/función, con cuotas, timeout, caché, observabilidad y normalización. El frontend no debe conocer respuestas propietarias.

## 5. Flujos propuestos

### 5.1 Usar ubicación actual

1. Explicar finalidad y solicitar permiso del navegador solo al pulsar el botón.
2. Capturar latitud, longitud y precisión.
3. Enviar coordenadas al endpoint de reverse geocoding.
4. Resolver provincia/cantón/distrito contra el catálogo oficial.
5. Presentar los campos detectados como **propuesta editable**, junto con nivel de confianza.
6. Mostrar localidades cercanas del mismo distrito ordenadas por distancia/relevancia y permitir “Escribir otra”.
7. Exigir señas exactas; las coordenadas no sustituyen la descripción para la entrega.
8. Confirmar la ubicación en mapa y validar cobertura, cuando exista esa política.

Si falla permiso, precisión o proveedor, preservar lo escrito y cambiar al flujo manual sin bloquear el pedido.

### 5.2 Dirección 100 % manual

1. Provincia → Cantón → Distrito con selects dependientes por código.
2. Pueblo/localidad como combobox buscable con sugerencias del distrito y opción de texto libre.
3. Dirección exacta/señas requerida.
4. Indicaciones adicionales opcionales.
5. Geocodificación directa opcional únicamente para sugerir un punto; nunca reemplazar silenciosamente lo ingresado.

### 5.3 Corrección de pueblo

Conservar tres valores distinguibles: sugerencia del proveedor, localidad resuelta del catálogo y texto final confirmado por la persona. Las sugerencias cercanas deben limitarse al distrito detectado/seleccionado salvo confirmación explícita de cambio territorial.

## 6. API/DTOs sugeridos

- `GET /territories/provinces`
- `GET /territories/cantons?provinceCode=...`
- `GET /territories/districts?cantonCode=...`
- `GET /territories/localities?districtCode=...&q=...&lat=...&lng=...`
- `POST /geocoding/reverse` con coordenadas y respuesta normalizada, candidatos y confianza
- CRUD autenticado `/customers/{id}/addresses`
- `POST /orders` recibiendo `deliveryAddressSnapshot`

Si se mantiene Firebase, estos endpoints pueden ser Functions/Cloud Run y los catálogos pueden ser recursos estáticos o colecciones de solo lectura. La creación pública de clientes/pedidos debe pasar por ese límite confiable; no debe relajarse el acceso anónimo a todas las PII en reglas.

## 7. Plan incremental y migración

### Fase 0 — decisiones y datos

- validar fuente oficial, licencia, frecuencia de actualización y alcance real de “pueblo”;
- definir zona de servicio y si tarifa/ruta necesita polígonos, distancia vial o solo distrito;
- elegir proveedor mediante una prueba con direcciones rurales de Acosta, no solo centros urbanos;
- acordar retención, consentimiento y acceso a coordenadas.

### Fase 1 — compatibilidad

- introducir `AddressValue`, formateador y parser de legado;
- crear catálogo versionado y sus pruebas de integridad;
- escribir nuevos pedidos con snapshot canónico y campo legado derivado;
- leer primero el snapshot y hacer fallback a `location`.

### Fase 2 — experiencia

- implementar selects completos, localidad editable y direcciones guardadas;
- integrar reverse geocoding detrás de `GeocodingGateway`;
- mostrar precisión/confianza y fallback manual.

### Fase 3 — migración y operación

- backfill no destructivo: parsear únicamente coincidencias inequívocas y marcar el resto `needsReview`;
- permitir corrección por personal/cliente sin alterar pedidos históricos;
- medir fallos de geocodificación, correcciones de localidad y entregas fuera de cobertura;
- retirar contratos `coords`, `coordinates` y URLs persistidas cuando no existan lectores antiguos.

## 8. Pruebas y criterios de aceptación para la implementación futura

- integridad completa provincia → cantón → distrito para la versión del catálogo;
- selección manual y teclado/móvil sin depender del mapa;
- GPS aceptado, denegado, timeout, baja precisión y coordenadas fuera de Costa Rica;
- normalización con tildes, homónimos y localidades no catalogadas;
- sugerencias cercanas restringidas y corrección manual persistida;
- edición de dirección del cliente sin mutar el snapshot de pedidos anteriores;
- compatibilidad de lectura con pedidos/clientes existentes;
- autorización: un cliente solo administra sus direcciones; personal accede según rol;
- no registrar PII/coordenadas en logs ni analítica general;
- pruebas contractuales del adaptador para poder cambiar proveedor.

## 9. Preguntas abiertas antes de construir

1. ¿Cuál es exactamente la zona de entrega y cómo se determina el recargo?
2. ¿“Pueblo” debe corresponder a poblado oficial, barrio, caserío o una etiqueta operativa propia?
3. ¿Se permiten entregas fuera del distrito/catálogo sugerido?
4. ¿Cuántas direcciones puede guardar un cliente y quién puede editarlas?
5. ¿La ruta necesita distancia por carretera/ETA o basta el punto para navegación?
6. ¿Qué antigüedad y precisión mínima de GPS se acepta?
7. ¿Qué proveedor cumple cobertura rural, costo, términos y licencia para almacenar resultados derivados?

## 10. Recomendación del spike

Avanzar con **catálogo oficial versionado + localidad flexible + geocodificador intercambiable en backend + direcciones múltiples de cliente + snapshot inmutable en pedido**. No extender el objeto `locationOptions` actual ni convertir una respuesta de Maps en la fuente de verdad. Primero deben resolverse zona de servicio, fuente territorial, definición de pueblo y política de privacidad; luego puede implementarse por fases sin romper pedidos existentes.
