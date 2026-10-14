# Visitas y clics públicos

## Qué se registra

- `page_view`: carga de la portada.
- `browse_click`: clic en «Ver negocios» de la portada.
- `link_click`: apertura de un enlace publicado de un negocio de `Sponsors`.
  `SocialLink` recibe el ID real del negocio y la procedencia (`mall`,
  `mall-preview`, `sponsor-strip`). Incluye el directorio sencillo y la ficha.

No registra URLs personalizadas de pedidos, acciones generales de compartir ni
los contactos institucionales sin un ID de negocio del catálogo. No agrega
Clarity ni otra dependencia de analítica.

Se cuenta una vez por sesión cada tipo general y cada combinación ID de negocio
+ URL. Pulsar el mismo enlace en distintos componentes no duplica el conteo.
Distintos negocios con la misma URL conservan contadores separados. Una sesión
vence tras 30 minutos de inactividad y se conserva al recargar la misma pestaña
con `sessionStorage`; si el almacenamiento está bloqueado sólo se usa memoria.
No son personas únicas ni clics brutos. No se cuenta una impresión del logo como
una visita al negocio.

Los eventos se guardan en `PublicAnalyticsEvents` con ID determinista (sesión,
tipo y SHA-256 de negocio/URL). La fecha es `serverTimestamp`. No se incluyen
nombre de cliente, teléfono del visitante, código de pedido, IP ni ubicación en
los documentos de eventos. Las URLs son los contactos públicos del catálogo,
incluido el correo normalizado a `mailto:`.

Las escrituras son asíncronas y no bloquean enlaces ni compra. Errores, bloqueos
del navegador y cierres de pestaña pueden perder mediciones. No se prometen
entregas garantizadas. Las escrituras anónimas no demuestran un clic humano:
las cifras son orientativas y no deben usarse como evidencia de facturación.
Un control fuerte contra manipulación requiere un receptor servidor con límites
por origen/App Check, fuera de la estructura actual sin backend propio.

## Informe

Administradores: `#/admin/analytics/index`, menú «Visitas y clics».
Permite período de hasta 92 días, inclusivo, usando días de Costa Rica (UTC−6).
Por defecto consulta los últimos 30 días. Muestra visitas a la portada, clics en
«Ver negocios», suma por negocio y detalle por URL/red. El filtro de negocio
aplica al resumen y al detalle, no a las métricas globales. «Actualizar» consulta
los datos actuales; no hay un listener permanente ni un contador público.

La consulta usa el índice de `createdAt` y páginas de 500 documentos hasta
agotarlas, sin truncar resultados. Agrega por ID y URL. Los nombres se leen del
catálogo actual; negocios eliminados conservan sus métricas y aparecen por ID.
No hay cifras previas a la activación. La lectura es exclusiva de administradores.
El volumen de visitas determina las escrituras y lecturas de Firestore; aplicar
la política de retención del proyecto si se acumulan grandes volúmenes.

## Reglas y activación

`firestore.rules` permite crear eventos con campos limitados, fecha de servidor,
tipos/procedencias definidos y un documento que corresponde a la sesión/tipo.
Para enlaces comprueba que el negocio esté activo y que la URL esté en sus
`links` o `socialLinks`. Prohíbe modificar/borrar eventos y leerlos públicamente.
No modifica las autorizaciones de las colecciones de clientes y pedidos.

1. Revisar el cambio de reglas y probarlas en el emulador de Firestore con un
   proyecto `demo-…`, nunca contra la base de producción.
2. Desplegar `firestore.rules` al proyecto Firebase confirmado por la
   configuración actual (`progasdb-8c0e4`), mediante el flujo habitual del
   propietario. El frontend no puede crear permisos de Firestore por sí mismo.
3. Publicar la rama de la web. Comprobar que se crea un evento al abrir la portada
   y otro al tocar «Ver negocios». No habilitar lecturas públicas para probarlo.
4. Pulsar un contacto del catálogo desde el mapa o la portada. Verificar ID,
   URL y red en el informe con un administrador. Repetir en la misma sesión y
   comprobar que no se suma; probar otra URL y otro negocio para ver incrementos.
5. Comprobar que un visitante y un colaborador no puedan leer el informe y que
   no se acepten eventos de negocios inactivos, URLs ajenas ni campos adicionales.
6. Probar sin conexión: la navegación debe seguir funcionando. Las métricas no
   deben mostrar ceros falsos si la lectura falla: el panel muestra un error.

Publicar sólo la web, sin las reglas, deja la medición sin autorización. Este
cambio no despliega Firebase ni incorpora historial retroactivo.

## Prueba aislada de reglas

`node scripts/test-analytics-rules.cjs` se ejecuta dentro de
`firebase emulators:exec`, con `--project demo-progas-analytics`. Necesita
Firebase CLI, Java y `@firebase/rules-unit-testing`. Estas herramientas son de
prueba y no se agregan al bundle ni al package.json de la aplicación.

Una instalación temporal, desde la raíz del repositorio:

```sh
npm install --prefix work/rules-tools firebase-tools @firebase/rules-unit-testing
NODE_PATH="$PWD/work/rules-tools/node_modules" FIREBASE_EMULATORS_PATH="$PWD/work/firebase-emulators" XDG_CONFIG_HOME="$PWD/work/firebase-config" work/rules-tools/node_modules/.bin/firebase emulators:exec --only firestore --project demo-progas-analytics "node scripts/test-analytics-rules.cjs"
```

El script usa sólo un proyecto demo, crea negocios/perfiles simulados y verifica
lecturas, enlaces publicados, inmutabilidad y datos inválidos. El intento en este
entorno no pudo descargar `cloud-firestore-emulator-v1.22.0.jar` de Google Storage;
por tanto, la prueba de reglas no se declara aprobada. Debe ejecutarse en un
entorno con acceso a esa descarga antes de activar la medición en producción.
