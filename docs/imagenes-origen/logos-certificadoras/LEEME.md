# Logotipos de las entidades certificadoras

Entregados por el cliente el 12-11-2026. **Son marcas ajenas: no se
redibujan, no se recolorean y no se recortan**, igual que el logotipo del
bufete.

Lo publicado sale de aquí con:

```bash
node herramientas/preparar-logos-certificacion.mjs \
  docs/imagenes-origen/logos-certificadoras/arav.jpg              frontend/public/img/cert-1.webp \
  docs/imagenes-origen/logos-certificadoras/raa.png               frontend/public/img/cert-2.webp \
  docs/imagenes-origen/logos-certificadoras/lonja-de-colombia.png frontend/public/img/cert-3.webp \
  docs/imagenes-origen/logos-certificadoras/delta-force.webp      frontend/public/img/cert-5.webp
```

## `aeronautica-civil-NEGATIVO.png` NO se usa, y el nombre lo dice

Es la versión en negativo: el 63 % de su tinta es blanca y el 33 % navy
`#082858`. Medido, el texto da **1,03:1** sobre la superficie clara y el disco
del emblema **1,08:1** sobre navy. No hay color de casilla que lo salve.

Se conserva para que nadie lo vuelva a intentar. **El que se publica es
`aeronautica-civil.webp`**, la versión positiva: tinta navy `#083888` sobre
blanco.
