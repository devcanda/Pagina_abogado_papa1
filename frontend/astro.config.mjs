import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://candamilabogados.com',

  // Salida 100% estática: el contenido se consulta a la API durante el build y
  // lo que se sube a public_html son archivos planos. Es lo mejor para LCP/TTFB
  // y evita que una caída de la API tumbe el sitio informativo.
  output: 'static',

  // cPanel sirve /ruta/ desde /ruta/index.html sin redirecciones extra.
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },

  vite: { plugins: [tailwindcss()] },
});
