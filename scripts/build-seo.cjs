// CRA genera el HTML inicial; los rastreadores no necesitan ejecutar React.
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Mismo orden de prioridad que CRA; dotenv ya es una dependencia de react-scripts.
for (const file of ['.env.production.local', '.env.local', '.env.production', '.env']) {
  const envPath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

const configuredUrl = process.env.REACT_APP_SITE_URL;
if (!configuredUrl || !configuredUrl.trim()) {
  console.warn('SEO pendiente: configurar REACT_APP_SITE_URL con la URL pública HTTPS para incluir og:url, og:image y twitter:image.');
  process.exit(0);
}

const siteUrl = new URL(configuredUrl.trim());
if (siteUrl.protocol !== 'https:' || siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash
  || siteUrl.hostname === 'localhost' || siteUrl.hostname.endsWith('.localhost')) {
  throw new Error('REACT_APP_SITE_URL debe ser una URL pública HTTPS sin credenciales, query ni hash.');
}
if (!siteUrl.pathname.endsWith('/')) siteUrl.pathname += '/';
const imageUrl = new URL('acosta-fondo.png', siteUrl).href;
const escapeAttribute = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const buildDirectory = path.resolve(__dirname, '..', 'build');
if (!fs.existsSync(path.join(buildDirectory, 'acosta-fondo.png'))) {
  throw new Error('Falta la imagen de portada acosta-fondo.png en el build.');
}
const htmlPath = path.join(buildDirectory, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
// Permite repetir el paso sin duplicar las etiquetas administradas aquí.
html = html.replace(/<meta\b[^>]*(?:property|name)="(?:og:url|og:image(?::(?:type|width|height))?|twitter:image)"[^>]*>/g, '');
const tags = [
  ['property', 'og:url', siteUrl.href],
  ['property', 'og:image', imageUrl],
  ['property', 'og:image:type', 'image/png'],
  ['property', 'og:image:width', '1672'],
  ['property', 'og:image:height', '941'],
  ['name', 'twitter:image', imageUrl],
].map(([attribute, name, value]) => `<meta ${attribute}="${name}" content="${escapeAttribute(value)}" />`).join('');
if (!html.includes('</head>')) throw new Error('El HTML generado no contiene </head>.');
fs.writeFileSync(htmlPath, html.replace('</head>', `${tags}</head>`));
