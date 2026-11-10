/**
 * Aplica las migraciones pendientes de `db/` y lleva registro de cuáles ya
 * corrieron.
 *
 *   node --env-file=.env scripts/migrar.js            aplica lo que falte
 *   node --env-file=.env scripts/migrar.js --estado   solo informa, no toca nada
 *
 * ── Por qué hace falta ──────────────────────────────────────────────────────
 * `schema.sql` solo crea `paginas`, `leads` y `chat_logs`. TODO lo demás —los
 * bloques de la portada, el catálogo de imágenes, los usuarios del panel, las
 * sesiones y el registro de publicaciones— vive en las migraciones numeradas.
 * Una base recién creada con `schema.sql` arranca sin panel y sin portada: el
 * `astro build` falla porque no hay bloques que pedir.
 *
 * Antes esto no estaba automatizado y el único sitio donde se habían aplicado
 * era la máquina donde se escribieron. Clonar el repositorio en otro equipo
 * dejaba una base inservible sin decir por qué.
 *
 * ── Por qué con registro y no reejecutando todo ─────────────────────────────
 * Las migraciones NO son todas idempotentes: `003` inserta los bloques de la
 * portada, `005` corrige la ciudad y `009` copia colores dentro de cada
 * lámina. Reejecutarlas duplica contenido o pisa valores que alguien ya editó
 * desde el panel. Por eso se anota cada una en `migraciones_aplicadas` y nunca
 * se repite.
 *
 * ── Adopción de una base que ya estaba migrada ──────────────────────────────
 * Las bases que existían antes de este script no tienen registro, pero sí las
 * tablas. Reaplicarles `003` les duplicaría la portada. Cuando el registro
 * está vacío pero `bloques` ya existe, se da por hecho que la base viene de
 * esa época y se marcan todas como aplicadas SIN ejecutarlas. Es el único
 * modo seguro: lo contrario es destruir contenido real.
 */
import { readdir, readFile } from 'node:fs/promises';
import { pool, cerrarPool } from '../src/config/db.js';

const CARPETA = new URL('../db/', import.meta.url);
// `schema.sql` lo carga el contenedor al crearse y `seed.sql` son datos de
// ejemplo opcionales: ninguno de los dos es una migración.
const NO_SON_MIGRACIONES = new Set(['schema.sql', 'seed.sql']);
const soloEstado = process.argv.includes('--estado');

const listar = async () => (await readdir(CARPETA))
  .filter((f) => f.endsWith('.sql') && !NO_SON_MIGRACIONES.has(f))
  .sort();                       // 002, 003, … El orden es el del nombre.

await pool.query(`
  CREATE TABLE IF NOT EXISTS migraciones_aplicadas (
    nombre      TEXT PRIMARY KEY,
    aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const archivos = await listar();
const yaAplicadas = new Set(
  (await pool.query('SELECT nombre FROM migraciones_aplicadas')).rows.map((r) => r.nombre),
);
const pendientes = archivos.filter((f) => !yaAplicadas.has(f));

if (soloEstado) {
  for (const f of archivos) {
    console.log(`  ${yaAplicadas.has(f) ? '✓' : '·'} ${f}`);
  }
  console.log(`\n${yaAplicadas.size} aplicadas, ${pendientes.length} pendientes.`);
  await cerrarPool();
  process.exit(0);
}

if (!pendientes.length) {
  console.log('La base ya está al día: no hay migraciones pendientes.');
  await cerrarPool();
  process.exit(0);
}

/*
 * Adopción: registro vacío pero tablas presentes. Se marcan sin ejecutar.
 * Se mira `bloques` porque es la tabla que crea la primera migración (002):
 * si existe, esa migración ya corrió aunque nadie lo anotara.
 */
if (yaAplicadas.size === 0) {
  const { rows } = await pool.query("SELECT to_regclass('public.bloques') AS t");
  if (rows[0].t) {
    console.log('Esta base ya tenía las tablas del panel pero no el registro.');
    console.log('Se marcan como aplicadas SIN ejecutarlas, para no duplicar contenido:');
    for (const f of pendientes) {
      await pool.query('INSERT INTO migraciones_aplicadas (nombre) VALUES ($1)', [f]);
      console.log(`  ✓ ${f}`);
    }
    console.log('\nSi alguna no estuviera aplicada de verdad, bórrela del registro:');
    console.log("  DELETE FROM migraciones_aplicadas WHERE nombre = '0XX-....sql';");
    await cerrarPool();
    process.exit(0);
  }
}

for (const nombre of pendientes) {
  const sql = await readFile(new URL(nombre, CARPETA), 'utf8');
  const cliente = await pool.connect();
  try {
    /*
     * Cada migración va en SU transacción. Si una falla, se deshace entera y
     * las anteriores se quedan aplicadas y anotadas: el siguiente intento
     * retoma justo donde se rompió, en vez de volver a empezar.
     */
    await cliente.query('BEGIN');
    await cliente.query(sql);
    await cliente.query('INSERT INTO migraciones_aplicadas (nombre) VALUES ($1)', [nombre]);
    await cliente.query('COMMIT');
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    await cliente.query('ROLLBACK');
    console.error(`  ✗ ${nombre}\n\n${e.message}\n`);
    console.error('No se aplicó esta migración ni las siguientes. La base queda');
    console.error('en el último estado bueno; corrija el SQL y vuelva a ejecutar.');
    cliente.release();
    await cerrarPool();
    process.exit(1);
  }
  cliente.release();
}

console.log(`\n${pendientes.length} migración(es) aplicada(s).`);
await cerrarPool();
