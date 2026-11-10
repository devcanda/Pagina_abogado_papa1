# Contenido rescatado del WordPress

Extraído el 22 de octubre de 2026 desde la API de WordPress del sitio en vivo,
**antes de borrarlo**. Esta carpeta es el respaldo: si el WordPress desaparece,
el contenido sigue aquí.

## Lo que más importa de este rescate

**El sitio que construimos no refleja el negocio real.** La portada que hay en
local habla de un bufete genérico con áreas de práctica. El negocio real es un
**catálogo de servicios con precio fijo y planes de suscripción**.

## El catálogo real de servicios

Quince servicios en cuatro categorías, cada uno con su icono propio en
`imagenes/`:

| Categoría | Servicios |
|---|---|
| **Avalúos** | Comercial · Urbano · Rural |
| **Demandas** | Laboral · Familiar · Penal · Civil |
| **Documentos** | Derechos de petición · Poderes · Tutelas · Informes judiciales |
| **Otros** | Trámites de tránsito · Peritaje de automotores · Conciliación extrajuicio · Particiones en sucesiones |

## Los planes de suscripción

| Plan | Precio | Qué incluye |
|---|---|---|
| **Importante** | $100.000 / consulta | Situaciones urgentes (capturas, denuncias, violencia intrafamiliar). Videollamada de hasta 30 min. |
| **Mensual** | $120.000 / mes | Asesoría continua. 3 consultas al mes, respuesta en 24 h o menos, escrita o en vídeo. |
| **Redacción de documentos** | $150.000 / documento | Redacción para trámites jurídicos o comerciales. Respuesta escrita o telefónica. |

Esto es un producto, no un bufete tradicional. Cambia qué debería decir la
portada y qué bloques hacen falta: una **tabla de planes** y una **rejilla de
servicios con precio** no existen hoy en el catálogo de bloques.

## Páginas que son herramientas internas, no páginas públicas

- **`/recibo/`** — generador de comprobantes de pago: nombre, identificación,
  concepto, valor, e imprimir. Es una herramienta de uso interno.
- **`/tarjeta/`** — tarjeta de presentación digital de **Diego Antonio
  Candamil**, abogado especialista.

Ninguna de las dos debería migrarse como página pública sin preguntar.

## Archivos de esta carpeta

| Archivo | Qué es |
|---|---|
| `<slug>.md` | Texto legible de cada página |
| `<slug>.html` | HTML original tal cual lo devuelve la API, con los atajos de WPBakery |
| `_medios.json` | Volcado de la biblioteca de medios |
| `imagenes/` | 48 archivos descargados |

El contenido venía codificado en **base64 dentro de atajos `[vc_raw_html]`** de
WPBakery, por lo que la API lo devolvía aparentemente vacío. Está decodificado.

## Las imágenes rescatadas

**Los 15 iconos de servicio** (1024×1024), que cubren exactamente el catálogo:
`comercial-1`, `urbano-1`, `rural-1`, `Laboral1`, `familia1`, `penal-1`,
`civil-1`, `derecho_peticion`, `poder`, `tutela`, `informe_judicial`,
`transito1`, `peritaje1`, `conciliacion1`, `particion1`.

**Fotografía real utilizable:**
- `profile1_1.jpg` (796×1104) — **retrato del abogado**, en vertical. Encaja
  casi exacto con lo que pide el hero (900×1100).
- `HOMBRE-CON-TRAJE-3-PSD_2.jpg` y `HOMBRE-TRAJE.jpg` (1917×540) — cabeceras.
- `Fondo-2_2.jpg`, `TULUA-PAGINA.jpg`, `labo1`.

**Ocho logotipos de clientes:** `Cliente_tradex`, `Cliente_ofies`,
`Cliente_camara`, `cliente_carmelita`, `cliente_dixtrital`, `cliente_redes`,
`cliente_dolormed`. Dan para un bloque de "confían en nosotros" que hoy no
existe.

**Restos de la plantilla, descartables:** `lawyer_*.jpeg`,
`home-5-video-slide_*`, `que-dicen*`, `woocommerce-placeholder.png`.

> Los iconos pesan entre 900 KB y 2,4 MB cada uno. **Hay que convertirlos a
> WebP y reducirlos antes de publicarlos**, o se llevan por delante todo el
> trabajo de rendimiento.

## Qué falta por decidir

1. ¿La portada nueva debe presentar el **catálogo de servicios con precios**,
   en lugar de las áreas de práctica genéricas que tiene ahora?
2. ¿Entran los **planes de suscripción** en la portada o en página aparte?
3. ¿`/recibo/` y `/tarjeta/` se migran, se dejan fuera o pasan al panel privado?
4. ¿El bloque de **logotipos de clientes** se añade al catálogo?
