import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  /*
   * `site` no es decorativo: es el único requisito del sitemap, y lo que
   * convierte cada ruta en una URL absoluta. Sin él la integración no emite
   * nada y lo hace en silencio.
   */
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
   * `strictPort` para que falle en vez de saltar al siguiente libre: un
   * servidor en un puerto que nadie espera es peor que ninguno.
   *
   * OJO: **Astro no tiene una opción `preview` de primer nivel.** `astro
   * preview` usa este mismo `server.port`, así que el 4340 se le pasa por la
   * línea de órdenes, en el guion `preview` de `package.json`. Aquí hubo una
   * clave `preview: { port: 4340 }` que Astro ignoraba en silencio; pareció
   * funcionar porque había un servidor del puerto correcto levantado de antes,
   * y las pruebas dieron verde contra él.
   */
  server: { port: 4321, strictPort: true },

  /*
   * ── Sitemap (spec 014) ──────────────────────────────────────────────────
   *
   * `robots.txt` llevaba meses anunciando `sitemap-index.xml`, que es
   * justamente el nombre que genera esta integración. Alguien la dio por
   * instalada y no lo estaba: **el archivo al que mandábamos a Google
   * devolvía 404**, y es lo primero que lee un rastreador.
   *
   * Se usa la integración oficial en vez de escribir el XML a mano porque
   * mantiene `lastmod` sola y no hay que acordarse de añadir cada página
   * nueva. Es dependencia de COMPILACIÓN: no añade un byte a lo que descarga
   * el visitante, igual que `sharp` cuando se compone una foto de fondo.
   *
   * **El 404 se excluye.** Lleva `noindex, nofollow`, así que listarlo en el
   * sitemap es pedirle a Google que indexe algo que le decimos que no indexe;
   * Search Console lo señala como contradicción.
   */
  integrations: [
    sitemap({
      filter: (pagina) => !pagina.includes('/404'),
      i18n: undefined,
      /*
       * `changefreq` y `priority` son PISTAS que Google ignora desde hace
       * años, pero Bing y otros aún las leen y no cuestan nada. La portada
       * manda; las legales van al fondo a propósito: existen para cumplir, no
       * para competir.
       */
      serialize: (item) => {
        const ruta = item.url.replace(/^https?:\/\/[^/]+/, '');
        if (ruta === '/') return { ...item, changefreq: 'weekly', priority: 1.0 };
        if (ruta.startsWith('/politica') || ruta.startsWith('/tratamiento')
            || ruta.startsWith('/terminos')) {
          return { ...item, changefreq: 'yearly', priority: 0.2 };
        }
        return { ...item, changefreq: 'monthly', priority: 0.7 };
      },
    }),
  ],

  vite: { plugins: [tailwindcss()] },
});
