/**
 * Genera la plantilla de encuadre para los fondos de la cabecera.
 *
 *   node herramientas/plantilla-fondo-hero.mjs
 *
 * Dibuja sobre un lienzo de 1920x1080 las tres zonas que importan a quien haga
 * la imagen. Los números NO son de diseño: salen de medir, en el navegador, qué
 * parte del lienzo sobrevive al `object-fit: cover` en cada ancho de pantalla y
 * dónde cae encima la columna de texto.
 *
 * Si algún día cambia el alto de la cabecera o el ancho de la columna de texto,
 * estos límites cambian: hay que volver a medir, no ajustarlos a ojo. El guion
 * que los midió está documentado en `docs/encuadre-fondo-hero.md`.
 */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const sharp = require('sharp');

const W = 1920;
const H = 1080;

// ── Límites medidos ─────────────────────────────────────────────────────────
const SIEMPRE_X0 = 620;  // a la izquierda de aquí, se recorta en móvil
const SIEMPRE_X1 = 1300; // a la derecha de aquí, también
const TEXTO_X1 = 944;    // hasta aquí llega la columna de texto en escritorio
const SEGURO_Y0 = 153;   // por encima, se recorta en pantallas anchas
const SEGURO_Y1 = 927;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .rotulo { font-family: sans-serif; font-weight: 700; fill: #fff; }
    .grande { font-size: 34px; }
    .chico  { font-size: 22px; font-weight: 400; }
  </style>

  <rect width="${W}" height="${H}" fill="#0a2443"/>

  <!-- Lo que se recorta por arriba y por abajo en pantallas anchas -->
  <rect x="0" y="0" width="${W}" height="${SEGURO_Y0}" fill="#000" opacity="0.55"/>
  <rect x="0" y="${SEGURO_Y1}" width="${W}" height="${H - SEGURO_Y1}" fill="#000" opacity="0.55"/>

  <!-- Lo que se recorta por los lados en pantallas estrechas -->
  <rect x="0" y="${SEGURO_Y0}" width="${SIEMPRE_X0}" height="${SEGURO_Y1 - SEGURO_Y0}" fill="#000" opacity="0.4"/>
  <rect x="${SIEMPRE_X1}" y="${SEGURO_Y0}" width="${W - SIEMPRE_X1}" height="${SEGURO_Y1 - SEGURO_Y0}" fill="#000" opacity="0.4"/>

  <!-- Lo que tapa la columna de texto en escritorio -->
  <rect x="${SIEMPRE_X0}" y="${SEGURO_Y0}" width="${TEXTO_X1 - SIEMPRE_X0}" height="${SEGURO_Y1 - SEGURO_Y0}"
        fill="#a0373a" opacity="0.45"/>

  <!-- La zona buena -->
  <rect x="${TEXTO_X1}" y="${SEGURO_Y0}" width="${SIEMPRE_X1 - TEXTO_X1}" height="${SEGURO_Y1 - SEGURO_Y0}"
        fill="#2e6db8" opacity="0.35" stroke="#fff" stroke-width="4"/>

  <text class="rotulo grande" x="${TEXTO_X1 + 16}" y="${SEGURO_Y0 + 48}">AQUÍ LO IMPORTANTE</text>
  <text class="rotulo chico"  x="${TEXTO_X1 + 16}" y="${SEGURO_Y0 + 84}">x ${TEXTO_X1}–${SIEMPRE_X1} · y ${SEGURO_Y0}–${SEGURO_Y1}</text>
  <text class="rotulo chico"  x="${TEXTO_X1 + 16}" y="${SEGURO_Y0 + 116}">se ve en TODAS las pantallas</text>
  <text class="rotulo chico"  x="${TEXTO_X1 + 16}" y="${SEGURO_Y0 + 148}">y no lo tapa el texto</text>

  <text class="rotulo chico" x="${SIEMPRE_X0 + 16}" y="${SEGURO_Y0 + 48}">Detrás del texto</text>
  <text class="rotulo chico" x="${SIEMPRE_X0 + 16}" y="${SEGURO_Y0 + 80}">(fondo, sin detalle)</text>

  <text class="rotulo chico" x="40" y="${SEGURO_Y0 + 48}">Se recorta en móvil</text>
  <!-- Más abajo que el de la izquierda: a la misma altura se solapaba con el
       título del recuadro bueno, que es ancho. -->
  <text class="rotulo chico" x="${SIEMPRE_X1 + 24}" y="${SEGURO_Y0 + 230}">Se recorta en móvil</text>
  <text class="rotulo chico" x="40" y="60">Se recorta en pantallas anchas (arriba y abajo)</text>

  <text class="rotulo chico" x="40" y="${H - 36}">Lienzo 1920 × 1080 · relación 16:9 · plantilla de encuadre</text>
</svg>`;

const salida = new URL('../docs/encuadre-fondo-hero.png', import.meta.url);
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(salida, png);
console.log('plantilla escrita en docs/encuadre-fondo-hero.png', `${Math.round(png.length / 1024)} KB`);
