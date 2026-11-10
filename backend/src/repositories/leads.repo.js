import { query } from '../config/db.js';

export async function crearLead({
  nombre,
  telefono,
  areaLegal = null,
  resumenCaso = null,
  email = null,
  origen = null,
  consentimientoDatos = false,
}) {
  const { rows } = await query(
    `INSERT INTO leads
       (nombre, telefono, area_legal, resumen_caso, email, origen, consentimiento_datos)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, nombre, telefono, area_legal, resumen_caso, fecha_ingreso, estado`,
    [nombre, telefono, areaLegal, resumenCaso, email, origen, consentimientoDatos],
  );
  return rows[0];
}
