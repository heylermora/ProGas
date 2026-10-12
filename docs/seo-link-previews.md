# SEO y previsualizaciones

## Estructura y decisiones

React 17, TypeScript, Create React App 5 y React Router 5 con `HashRouter`.
No hay SSR, prerender ni servidor de metadatos. `public/index.html` es la fuente
del head inicial. No se encontró Helmet ni otra administración de metadatos.
La descripción y el título existentes se conservan; el título ya identifica
el contenido y la marca. Se retira `itemprop` del título por no existir un scope
de datos estructurados que lo utilice.

Rutas públicas: `/`, `/mall`, `/portfolio`, `/customer/data`, `/customer/info`,
`/customer/products` y `/customer/view-order`. `/sponsors/packages` redirige a
`/mall`; `/auth` contiene autenticación y `/admin/*` usa rutas protegidas.
Las URLs reales llevan `#`. Ese fragmento no se envía en HTTP, por lo que todos
los enlaces reciben los mismos metadatos generales. Modificarlos con React no
resuelve las previsualizaciones de los rastreadores. Para previews específicas
de comercios, portafolio u otro contenido hacen falta URLs HTTP diferenciadas y
HTML estático o renderizado en servidor. Esto requiere una tarea separada,
conservando compatibilidad con los enlaces actuales. No incluir datos privados
de clientes o pedidos en metadatos públicos.

## Valores reutilizados

- Título: `Negocios de Acosta | Gas Memo`, de `public/index.html`.
- Descripción: texto original de `public/index.html`, también usado para OG y X.
- Marca: `Gas Memo`, del título, `PublicHeader.tsx` y `PublicFooter.tsx`.
- Imagen: `public/social-preview.jpg`, creada por solicitud del propietario
  exclusivamente para previsualizaciones. JPEG de 1200 × 630, 143685 bytes
  (aproximadamente 144 KB). Incluye los textos existentes «Negocios de Acosta»,
  «Gas Memo», «Productos y servicios de nuestra comunidad, reunidos en un solo
  lugar.» y «Ver negocios», de `public/index.html` y `Home.tsx`.
  El paisaje y los comercios son una ilustración, no una fotografía de negocios
  reales. La portada de la interfaz `acosta-fondo.png` se conserva sin cambios.
- `robots.txt` permite rastreo. Se eliminó el sitemap de `simmmple.com`, ajeno
  al proyecto. No hay sitemap propio comprobado para reemplazarlo.

## Configuración pendiente

La URL pública confirmada por el propietario es `https://progasmemo.netlify.app`.
Está configurada en `.env.production` mediante `REACT_APP_SITE_URL`; la imagen
se resuelve a `https://progasmemo.netlify.app/social-preview.jpg`.
El entorno del build o `.env.production.local` pueden sobrescribirla si cambia
el destino. Ejecutar `npm run build`. `postbuild` agrega `og:url`, `og:image`, tipo y
dimensiones, y `twitter:image` al HTML generado. La imagen se resuelve bajo la
URL configurada, independientemente de `homepage: "."`. No agregar rutas con
hash a esta variable. No ejecutar solamente `react-scripts build`, porque eso
omite el paso de SEO.

Sin la URL se generan las etiquetas de texto y `twitter:card`, pero se omiten
las URLs: las previews con imagen quedan pendientes. No se emiten placeholders.
El script valida el formato de la URL y la existencia del recurso local;
la accesibilidad pública sólo puede comprobarse después del despliegue.
No se agregó una cuenta `twitter:site` porque no hay una cuenta X verificada.

## Validación

1. Construir con la URL confirmada. Inspeccionar `build/index.html`: una sola
   etiqueta por propiedad, título/descripciones coherentes, imágenes HTTPS
   absolutas y sin variables sin resolver.
2. Publicar mediante el procedimiento habitual. Consultar el HTML por HTTP,
   sin ejecutar JavaScript, tanto con un navegador como con User-Agent
   `facebookexternalhit`, `Twitterbot`, `LinkedInBot` y `Discordbot`.
   Verificar que no haya login, bloqueo de bots ni challenge del hosting.
3. Abrir la URL de `og:image` sin sesión: respuesta 200, `Content-Type: image/jpeg`,
   archivo real y acceso permitido por robots/CDN. Repetir desde fuera de la red
   local. Verificar también la URL de `twitter:image`.
4. Facebook: usar Sharing Debugger y solicitar un nuevo rastreo.
   LinkedIn: usar Post Inspector para volver a consultar el enlace.
5. WhatsApp y Discord: enviar la URL en una conversación de prueba y revisar
   título, descripción, imagen y recorte. Las cachés pueden retrasar los cambios;
   quitar y volver a pegar el enlace no garantiza un nuevo rastreo.
6. X: usar Card Validator si está disponible para la cuenta y confirmar el
   resultado en un borrador/publicación de prueba. Revisar el recorte de la imagen.
7. Comparar enlaces con `#/mall` y `#/portfolio`: tendrán la misma preview
   general por la arquitectura actual. Comprobar que la navegación siga funcionando.

La comprobación remota mediante la herramienta de navegación no pudo acceder
al sitio ni a la imagen. Ese resultado no demuestra que el sitio esté caído;
queda pendiente la comprobación HTTP pública con los rastreadores tras desplegar.

La presencia de etiquetas en el build no garantiza por sí sola que el hosting
permita el acceso de cada plataforma. No se ha verificado producción ni se ha
publicado como parte de este cambio.
