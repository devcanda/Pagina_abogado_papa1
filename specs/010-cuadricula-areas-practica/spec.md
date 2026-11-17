# Especificación — Página de Áreas de Práctica con Cuadrícula Moderna de 3 Columnas

Petición del usuario, 17-11-2026.

## 1. Contexto y Objetivo

Actualmente, los enlaces de navegación de la cabecera (`Navbar.astro`), pie (`Footer.astro`) y botones del hero/bloques apuntan a `/areas/`, pero dicha ruta respondía 404.

El usuario solicita:
1. Analizar la página de demostración: `https://max-themes.net/demos/lawyerbase/practice-areas-modern-3-columns.html` (LawyerBase - Practice Areas Modern 3 Columns).
2. Construir la página `/areas/` con una cuadrícula moderna de 3 columnas inspirada en dicha referencia, adaptada a la identidad visual de Candamil Abogados.
3. **Ajustes de encabezado:** Retirar las migas de pan ("INICIO/Áreas de práctica") y el rótulo superior ("Defensa jurídica y peritajes") para dejar un hero limpio, potente y centrado.
4. **Catálogo completo de servicios:** Incorporar todos los servicios del bufete rescatados del negocio real (15 servicios en cuadrícula simétrica 5×3 de 3 columnas) y los planes de asesoría con tarifa establecida ($100.000 consulta urgente, $120.000/mes asesoría continua, $150.000 redacción jurídica).
5. **Autonomía operativa:** Trabajar con autonomía completa y consultar al usuario únicamente en caso de dudas de decisión no triviales.
6. **Aislamiento de la portada:** Trabajar exclusivamente en `/areas/`, respetando los archivos del `index` que modifica en paralelo el agente Claude.

## 2. Análisis de la Referencia (LawyerBase Modern 3 Columns)

- **Estructura general:**
  - Encabezado con título centrado y descripción de práctica.
  - Sección principal con cuadrícula de 3 columnas (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`).
- **Diseño de las tarjetas (`gdlr-modern-practice`):**
  - Proporción de aspecto apaisada fija (~7:4).
  - Imagen de fondo representativa con carga diferida.
  - Velo de acento con opacidad atenuada al hacer hover.
  - Título centrado en la tarjeta en tipografía display/serif, color blanco y drop shadow.
  - Comportamiento hover: micro-zoom suave (`scale-105`) y reducción del velo para revelar la foto sin comprometer la legibilidad del texto.

## 3. Adaptación a la Identidad y Arquitectura de Candamil Abogados

1. **Cero JavaScript de cliente (0 KB JS):**
   - Transiciones e interacción resueltas con CSS puro y Tailwind CSS 4.
2. **Paleta de Marca:**
   - Estructura y confianza: Azul `#195BA9` (`marino-600`) y Navy `#0A2443` (`marino-900`) / `#0E345E` (`marino-800`).
   - El rojo `#A0373A` (`rojo-500`) se reserva estrictamente para acciones reales de conversión (botones WhatsApp y llamadas a la acción).
3. **Catálogo de 15 Servicios (5×3):**
   - *Litigios y Demandas:* Derecho Laboral, Derecho Civil, Derecho de Familia, Sucesiones y Particiones, Derecho Penal, Derecho Inmobiliario, Derecho Administrativo, Derecho a la Salud y Tutelas.
   - *Peritajes y Avalúos:* Perito Avaluador Certificado, Avalúos Comerciales y Muebles, Avalúos Rurales y Terrenos, Peritaje de Automotores.
   - *Trámites y Soluciones:* Tránsito y Accidentes, Conciliación Extrajuicio, Redacción de Documentos Legales.
4. **Modalidades y Tarifas de Atención (Planes):**
   - Consulta Urgente: $100.000 / consulta (asistencia inmediata en videollamada hasta 30 min).
   - Asesoría Continua: $120.000 / mes (hasta 3 consultas mensuales en 24h o menos).
   - Redacción de Documentos: $150.000 / documento (derechos de petición, poderes, contratos).
5. **Cierre de Conversión:**
   - Bloque de orientación con botones de WhatsApp directo y llamada telefónica desde `contacto.js`.

## 4. Criterios de Aceptación

1. La ruta `/areas/` compila limpiamente en SSG y responde 200 OK.
2. No aparecen las migas de pan ni el rótulo superior en el hero de la página.
3. Se presentan los 15 servicios organizados en 3 columnas en escritorio y adaptables en móvil.
4. Se presenta la sección de tarifas y planes de asesoría con sus características y llamadas de contratación por WhatsApp.
5. Se mantiene 0 KB de JavaScript añadido al cliente.
6. Ningún archivo del `index` ha sido alterado.
