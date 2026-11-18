# Especificación — Página Quiénes Somos (`/quienes-somos/`)

Petición del cliente, 17-11-2026.

## 1. Contexto y Objetivo

Actualmente la ruta `/quienes-somos/` se genera dinámicamente desde la tabla `paginas` a través de `[...slug].astro` con un texto de reserva de dos líneas.
El cliente solicita armar la página `/quienes-somos/` basándose en el contenido y estructura de su sitio anterior (`https://candamilabogados.com/quienes-somos/`, respaldado en `docs/contenido-wordpress/quienes-somos.html` y `quienes-somos.md`), adaptado con una presentación editorial moderna bajo la identidad visual de Candamil Abogados.

## 2. Contenido de Referencia a Integrar

1. **Encabezado Principal:**
   - «Candamil Asociados Abogados» (en tipografía `Playfair Display` con acento de marca).
2. **Bloque «Quiénes somos» + Galería de Especialidades (2 columnas):**
   - **Galería interactiva de 3 áreas (sin JavaScript):**
     1. *Asesoría Penal* — descripción profesional corregida (en el WordPress original quedó por error un borrador de prompt de IA; se sustituye por una descripción jurídica real y sobria).
     2. *Derecho a la Salud* — «El derecho a la salud es fundamental. Como abogado especializado, ofrezco asesoría y representación legal para proteger tus derechos en casos de negligencia médica, acceso a tratamientos y disputas con aseguradoras.»
     3. *Especialista en Derecho Laboral* — «El derecho laboral regula las relaciones entre empleadores y trabajadores, asegurando condiciones justas y derechos protegidos.»
   - **Historia y Linaje Jurídico (texto fiel al original):**
     - Mención al fundador **Diego Antonio Candamil Rengifo**, su linaje jurídico (**Antonio Candamil Villegas** Q.E.D., egresado de la Universidad Nacional y ex juez de la República; y **Heriberto Rengifo**, abuelo línea materna, egresado de la Universidad Externado de Colombia) y al equipo de profesionales con más de 15 años de experiencia en Tuluá y todo el departamento del Valle del Cauca.
     - Rótulo de respaldo: «SOMOS ABOGADOS ALTAMENTE CAPACITADOS PARA ATENDER Y DEFENDER TODAS SUS NECESIDADES».
     - Promesa de valor: «Protegemos su patrimonio garantizando que los casos sean de éxito.»
     - Botón de acción: «Contáctanos» hacia WhatsApp (`enlaceWhatsApp('Necesito una consulta')`).
3. **Bloque del Abogado Especialista (`Diego A. Candamil R.`):**
   - Encabezado: «Diego A. Candamil R. · Abogado Especialista» y bajada «Contácteme para recibir asesoría legal profesional y personalizada. ¡Estoy aquí para ayudar!».
   - Ficha editorial con fotografía vertical oficial (`/img/hero-abogado.webp`, originada en `profile1_1.jpg`), nombre, cargo y **Biografía** íntegra («Abogado con más de 20 años de experiencia, especializado en derecho laboral. Desde el año 2000, ofreciendo asesoría legal de alta calidad, destacándose por su amplio conocimiento en áreas como salud, avalúos, cartera y más. Comprometido con la defensa de los derechos laborales y la resolución efectiva de conflictos legales.»).

## 3. Reglas de Diseño y Arquitectura

- **Cero JavaScript de cliente (0 KB JS):** La galería de 3 especialidades con selector por miniaturas funciona exclusivamente con `<input type="radio">` ocultos + `:has()` en CSS (mismo patrón probado en `Cabecera.astro`), con degradación elegante si `:has()` no está soportado.
- **Sin colisión de rutas:** `[...slug].astro` excluye el slug `'quienes-somos'` (igual que excluye `'inicio'`) para ceder la ruta a la página dedicada `frontend/src/pages/quienes-somos/index.astro`.
- **Fuente única de contacto:** WhatsApp y teléfono desde `frontend/src/data/contacto.js`.
- **Tipografía y Paleta:** Playfair Display en redonda para titulares, pila sans para cuerpo y subtítulos, rojo reservado para los botones de conversión (`btn-primario`).
- **Aislamiento:** No modificar archivos de la portada (`index`).

## 4. Criterios de Aceptación

1. `/quienes-somos/` compila como página estática dedicada (`dist/quienes-somos/index.html`) sin colisión con `[...slug].astro`.
2. Incluye todo el linaje, historia, especialidades y biografía de Diego A. Candamil R. del sitio anterior, corrigiendo el texto incompleto de *Asesoría Penal*.
3. La galería de 3 especialidades con miniaturas cambia de lámina sin JavaScript y es accesible por teclado.
4. Mantiene 0 KB de JavaScript propio en el cliente.
