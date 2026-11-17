# Plan Técnico — Entidades certificadoras

## Forma del dato

Un grupo en `servicioDestacado`, como los demás del proyecto:

```
tituloCertificaciones    rótulo de la franja
certificaciones[]        hasta 6
├── nombre               obligatorio. Es el texto alternativo
├── imagen               320×160, ajuste 'contener'
└── enlace               opcional, a la ficha de la entidad
```

Va en el registro, así que el formulario del panel sale solo y se pueden
añadir, quitar y reordenar entidades sin tocar código.

## El panel tiene que aprender a CONTENER

`redimensionar()` escala con `Math.max` —cubre y recorta el lado largo—, que es
lo correcto para una fotografía y destructivo para un logotipo.

Se añade un tercer argumento, `ajuste`, que con `'contener'` usa `Math.min`. El
lienzo nace transparente y WebP guarda el canal alfa, así que el logotipo llega
al sitio sin fondo. El campo lo declara en el registro y el control lo lleva en
`data-ajuste`.

**No se duplica la decisión en el componente:** el sitio pinta con
`object-contain`, pero si el archivo ya llegara recortado no habría nada que
hacer. Las dos mitades hacen falta.

## El rótulo NO va en el rojo de marca

`etiqueta-seccion-clara` es `rojo-300`. Aquí no sirve, por dos razones que ya
están escritas en el proyecto:

- **Sobre una foto el rojo no aguanta.** Sobre navy plano da 5,92:1; sobre un
  duotono cae a 2,31:1. Este rótulo queda centrado justo donde el velo solo
  está a medias.
- **El rojo se reserva a la acción.** El botón «Solicitar un avalúo» está dos
  centímetros más arriba. Dos rojos seguidos dejan de señalar cuál hay que
  pulsar.

Se pinta en `marino-100`. Medido en la página: `rgb(220, 232, 245)`.

## Migración

`014-certificaciones-perito.sql`:

1. Cinco huecos `cert-1`…`cert-5` de 320×160, con el relleno de 1×1.
2. El rótulo y cinco entradas **solo con nombre**, provisionales.

No toca nada más del bloque.

## Pruebas

Se amplía `perito.test.mjs`, no se crea una suite nueva: es el mismo bloque y
la misma copia de seguridad.

- Sale una casilla por entidad. **Cuántas hay se le pregunta a la base**, no se
  escribe «cinco»: el cliente va a añadir y quitar entidades.
- Una entidad sin logotipo enseña su nombre.
- Todo logotipo lleva `alt`.
- El rótulo no va en rojo.
- El control del logotipo pide `contener`.

## Riesgos

| Riesgo | Qué hacemos |
|---|---|
| Un logotipo claro desaparece sobre la casilla blanca | La casilla es blanca al 95 %; si alguno falla, su entidad puede llevar enlace y nombre |
| La sección crece demasiado | Medido: de 689 a 922 px a 1440. Se asume; es contenido que vende |
| Alguien sube un logotipo con fondo blanco opaco | Se ve un recuadro dentro de la casilla. Se pide PNG con transparencia en la ayuda del campo |
