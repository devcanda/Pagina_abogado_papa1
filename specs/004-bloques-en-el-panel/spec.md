# Especificación Funcional — El panel se organiza por bloques

## Objetivo

Hoy el panel enseña una **lista plana de huecos de imagen**. Quien entra ve
doce casillas sueltas y tiene que adivinar cuál es cuál por el nombre.

Pasa a enseñar **los bloques de la página**, cada uno con sus imágenes dentro y
con un interruptor para **mostrarlo u ocultarlo al público**.

```
  ANTES                        DESPUÉS
  ─────────────────            ──────────────────────────────────
  [hero-abogado]               ▸ Slider principal        [visible]
  [hero-perito]                    [hero-abogado] [hero-perito] [hero-laboral]
  [hero-laboral]
  [area-civil]                 ▸ Bloque de servicios     [visible]
  [area-penal]                     [area-civil] [area-penal] [area-familia] …
  [area-familia]
  [caso-1]                     ▸ Casos resueltos         [oculto]
  …                                [caso-1] [caso-2] [caso-3]
```

## Requisitos de Negocio

- Las imágenes se agrupan **bajo el bloque donde salen**. Nadie debería tener
  que saber que `area-civil` es «la tarjeta de derecho civil del índice».
- Cada bloque tiene un **nombre en castellano llano**, el que usaría quien
  encarga el cambio: «Slider principal», «Bloque de servicios del índice».
- Cada bloque se puede **mostrar u ocultar** desde el panel, sin tocar código
  ni base de datos.
- Un bloque **sin imágenes** también aparece, porque también se puede ocultar.
- Ocultar un bloque **no lo borra**: sus textos e imágenes siguen ahí y se
  recupera volviendo a encenderlo.
- Subir imágenes tiene que seguir funcionando **exactamente igual**.

## Decisiones tomadas y por qué

### El agrupado se DEDUCE de los bloques, no se configura aparte

Se recorre lo que cada bloque tiene guardado y se busca qué claves de imagen
menciona. Así el panel enseña siempre la estructura **real** de la página.

La alternativa —una columna «grupo» en la tabla de imágenes— se descarta porque
se desincroniza: el día que alguien mueva una imagen de bloque, el panel
seguiría enseñándola donde ya no está, y nadie se enteraría hasta que el
diseñador cambiara la foto equivocada.

### El nombre del bloque se guarda; no se deduce del tipo

El tipo del bloque de la cabecera es `cabecera`, pero quien entra al panel lo
llama «el slider». Deducir el nombre del tipo daría rótulos que no significan
nada para quien los lee. Se añade una columna `rotulo` que el administrador
puede cambiar cuando llegue la pantalla de composición.

### Ocultar es un campo del bloque, no borrarlo de la revisión

Un `visible BOOLEAN` deja el bloque donde está, con su orden y su contenido.
Volver a encenderlo es un clic. Si ocultar significara sacarlo de la revisión,
recuperarlo exigiría reconstruirlo entero.

## Lo que ESTO NO arregla

**El sitio público es estático.** El contenido se consulta durante
`astro build`, así que encender o apagar un bloque cambia la base de datos y la
API al instante, pero **el sitio publicado no cambia hasta que se vuelve a
compilar**. En desarrollo local se ve enseguida porque el servidor de Astro
regenera cada página en cada petición.

Es la misma tensión ya anotada en `docs/` entre generación estática y
publicación instantánea, y se resuelve en su propia tarea: pasando la portada a
SSR o disparando una recompilación al publicar. No se mezcla aquí.

## Casos Límite

| Situación | Comportamiento |
|---|---|
| Imagen que no usa ningún bloque | Va a un grupo «Sin bloque asignado», al final. |
| Bloque sin imágenes | Sale igual, con su interruptor y sin rejilla. |
| Misma imagen en dos bloques | Sale en los dos; es un hueco compartido, no un error. |
| Bloque oculto | La API no lo devuelve. Su ficha sigue en el panel, atenuada. |
| Todos los bloques ocultos | La página se sirve vacía. Es lo que se pidió; no se inventa un mínimo. |
| Hueco `prueba-%` | Sigue sin salir, como hasta ahora. |

## Criterios de Aceptación

- [ ] El panel enseña los bloques de la portada, en su orden real.
- [ ] Cada imagen sale bajo el bloque donde se usa.
- [ ] El interruptor oculta y vuelve a mostrar el bloque.
- [ ] Un bloque oculto desaparece de `/api/paginas/inicio/bloques`.
- [ ] Al recompilar, el bloque oculto no sale en el HTML.
- [ ] Subir una imagen sigue funcionando desde la nueva pantalla.
- [ ] El cambio queda en la auditoría, con quién y cuándo.
- [ ] Sin sesión no se puede cambiar la visibilidad de nada.
