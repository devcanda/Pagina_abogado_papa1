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

  /*
   * Dos puertos, y no son intercambiables.
   *
   *   4321  `npm run dev`      — para editar, con recarga en caliente.
   *   4340  `npm run preview`  — el sitio YA COMPILADO, desde `dist/`.
   *
   * Las herramientas de captura, el previsualizador de fondos y las suites de
   * `.pruebas/` apuntan todas al 4340 **a propósito**: comprueban el
   * resultado publicado, que es lo que ve el visitante. Contra el servidor de
   * desarrollo los números salen mal —Vite inyecta los estilos por JavaScript
   * y al medir todavía no están aplicados—, y las comprobaciones de
   * maquetación fallan por algo que no es un fallo del sitio.
   *
   * Se declaran explícitos para que no dependan del valor por defecto de
   * Astro, y con `strictPort` para que fallen en vez de saltar al siguiente
   * libre: un servidor en un puerto que nadie espera es peor que ninguno.
   */
  server: { port: 4321, strictPort: true },
  preview: { port: 4340, strictPort: true },

  vite: { plugins: [tailwindcss()] },
});
