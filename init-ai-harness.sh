#!/bin/bash

# ==============================================================================
# Script de Inicialización: Arquitectura de Agentes IA y SDD
# ==============================================================================

echo "🚀 Inicializando estructura de Agentes IA y SDD..."

# 1. Crear estructura de carpetas
mkdir -p docs specs/template .agents/skills/experto-stack .agents/commands

# 2. Crear AGENTS.md (El archivo estático de reglas)
cat << 'EOF' > AGENTS.md
# Configuración Global del Agente (AGENTS.md)

## Reglas Innegociables
1. **Memoria Viva:** Al iniciar cualquier sesión, lee `MEMORY.md` para entender el contexto. Al finalizar cualquier tarea, actualiza `MEMORY.md`.
2. **Flujo SDD:** Nunca escribas código para una nueva funcionalidad sin antes pasar por las fases de Especificación (`spec.md`), Planificación (`plan.md`) y Tareas (`tasks.md`) dentro de la carpeta `specs/`.
3. **Constitución:** Respeta siempre los principios arquitectónicos definidos en `docs/constitution.md`.

## Tecnologías del Proyecto
[NOTA PARA EL DEV: Reemplazar con el stack del proyecto. Ej: Next.js, Tailwind, Prisma]
EOF

# 3. Crear MEMORY.md (La bitácora viva)
cat << 'EOF' > MEMORY.md
# MEMORY.md - Estado Vivo del Proyecto (Máx. 50 líneas)

## Estado Actual
- Proyecto inicializado con estructura de Agentes y SDD.

## Decisiones Técnicas y Aprendizajes
- Ninguna decisión técnica registrada aún.

## Pendientes / Próximos Pasos
- Definir el stack tecnológico en `AGENTS.md`.
- Crear la especificación `001` en la carpeta `specs/`.
EOF

# 4. Crear la Constitución del Proyecto
cat << 'EOF' > docs/constitution.md
# Constitución Arquitectónica

1. **Simplicidad:** Priorizar código legible sobre soluciones complejas.
2. **Separación de Responsabilidades:** Mantener la lógica de negocio aislada de la interfaz de usuario.
3. **Seguridad:** No exponer credenciales ni confiar ciegamente en datos del cliente.
EOF

# 5. Crear un Comando de ejemplo (/feature)
cat << 'EOF' > .agents/commands/feature.md
---
description: Inicia el flujo SDD para una nueva funcionalidad.
agent: plan
---
Quiero implementar la siguiente funcionalidad: $ARGUMENTS

Por favor, actúa como Arquitecto de Software y sigue el flujo SDD:
1. Lee `AGENTS.md` y `docs/constitution.md`.
2. Hazme las preguntas necesarias para resolver ambigüedades.
3. Cuando todo esté claro, redacta la especificación y guárdala en `specs/[nombre-feature]/spec.md`.
EOF

# 6. Crear una Skill de ejemplo (SKILL.md)
cat << 'EOF' > .agents/skills/experto-stack/SKILL.md
---
name: experto-stack
description: Úsala siempre que escribas o modifiques código principal del proyecto para asegurar buenas prácticas del stack seleccionado.
---
# Habilidad: Experto en el Stack Principal
1. Utiliza siempre la sintaxis más moderna y segura de los lenguajes configurados.
2. Evita dependencias innecesarias; utiliza herramientas nativas cuando sea posible.
3. Añade comentarios que expliquen el "por qué" y no el "qué" en lógicas complejas.
EOF

# 7. Crear las plantillas SDD (Spec, Plan, Task)
cat << 'EOF' > specs/template/spec.md
# Especificación Funcional (Spec)
- **Objetivo:** [Qué se va a construir]
- **Requisitos de Negocio:** [Criterios de aceptación]
- **Casos Límite:** [Qué pasa si falla, si no hay datos, etc.]
EOF

cat << 'EOF' > specs/template/plan.md
# Plan Técnico (Plan)
- **Archivos a Modificar:**
- **Archivos a Crear:**
- **Estrategia de Implementación:**
- **Impacto en Base de Datos / Estado:**
EOF

cat << 'EOF' > specs/template/tasks.md
# Tareas de Implementación (Tasks)
- [ ] T1: Configurar modelo de datos.
- [ ] T2: Crear rutas/endpoints.
- [ ] T3: Desarrollar interfaz.
- [ ] T4: Pruebas y validación.
EOF

# (Opcional) Si usas Claude Code, vincular CLAUDE.md a AGENTS.md
cat << 'EOF' > CLAUDE.md
Lee siempre las reglas principales en @AGENTS.md y actualiza @MEMORY.md.
EOF

echo "✅ ¡Estructura creada con éxito! El proyecto está listo para trabajar con agentes."