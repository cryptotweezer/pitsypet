# PitsyPet — Change-log: Proposal (inicial) → Producto real

> **Propósito (documento interno de trabajo):** mapear qué se **mantuvo**, qué **cambió**, qué se **agregó** y qué se **descartó** entre la propuesta inicial (`PROPOSAL.md`, capstone) y lo que realmente se construyó (`dev_plan.md` + `DEV_LOG.md` + `proposal_vs_implemented.md`, verificados hasta la Sesión 27, 26-jun-2026).
>
> **Uso:** garantizar que el reporte final de Small IT Business incluya **solo lo vigente**. NO es parte del reporte y NO debe reflejar narrativa de cambios ("antes X, ahora Y") en el entregable final.
>
> **Regla:** la propuesta es un punto de partida, no un contrato. Donde el desarrollo divergió, **manda lo construido**.

---

## 1. Lo que se MANTUVO (idea y núcleo intactos)

- **Concepto:** PitsyPet, herramienta educativa de **triage veterinario con IA** para dueños de perros y gatos en Australia.
- **Problema y mercado:** el mismo (dueños no saben evaluar urgencia; costo alto de emergencias; acceso limitado fuera de horario).
- **Clasificación de riesgo Low / Medium / High** con razonamiento clínico y recomendaciones según nivel.
- **Flujo conversacional** de captura de síntomas (chat con IA, no formulario).
- **Primeros auxilios** para riesgo bajo; **contactos de emergencia + derivación** para alto.
- **Disclaimer legal** (herramienta educativa, no diagnóstico).
- **Supabase** (PostgreSQL + pgvector + Auth) y **Vercel** como base.
- **Arquitectura RAG** (recuperación de conocimiento veterinario) — sigue en el diseño.
- **Modelo de negocio freemium** (básico gratis, premium por suscripción; Stripe a futuro).
- **Piloto Australia**, arquitectura pensada para escalar.
- **NFR:** prevención de inyección SQL, responsive 320–1920px, WCAG 2.1 AA, fallback de emergencia <2s.

---

## 2. Lo que CAMBIÓ (divergencias intencionales — manda lo construido)

| Tema | Propuesta inicial | Realidad construida |
|---|---|---|
| Backend / framework | FastAPI + Python en Railway | **Next.js full-stack (TypeScript) en Vercel** — sin backend separado, sin Railway |
| Modelo de IA | Un solo Claude Sonnet 4.5 | **Dos modelos:** Haiku 4.5 (extracción + chat) + Sonnet (clasificación + resumen al vet) |
| Embeddings | `text-embedding-3-large` | **`text-embedding-3-small`** (1536 dims) |
| Índice vectorial | IVFFlat (100 lists) | **HNSW** (`vector_cosine_ops`) |
| Confidence score | Compuerta ≥ 0.75 antes de clasificar | **Solo se registra, nunca es compuerta**; ante la duda, el riesgo se **sube** |
| Urgencia en RAG | Filtro `urgency ≥ 5` (ocultaba chunks) | **Solo señal de re-ordenamiento** (`+0.05·urgency/10`), nunca oculta contenido |
| Mensajes de conversación | Tabla separada "Conversation Messages" | **Columna única `conversation_log` JSONB** en `assessments` |
| Llamadas de IA | Tres llamadas bloqueantes | **Una `streamText` por mensaje** (extrae + responde); RAG + clasificación en `onFinish` |
| Guardado de assessment | Botón "Save to History" + flag `user_saved` | **Auto-guardado al completar** (se eliminó el botón y el flag como compuerta) |
| Email | SMTP propio (Resend) desde el inicio | **Email de Supabase para dev; Resend diferido** (sin cuenta/dominio aún) |
| Framework version | Next.js 14 / React 18 | **Migrado a Next.js 15 / React 19** (Sesión 20, cerró 14 advisories de seguridad) |
| UI kit | shadcn sobre Tailwind v3 / Radix | **Tailwind v4 + shadcn "base-nova" (Base UI)** |

---

## 3. Lo que se AGREGÓ (más allá de la propuesta)

- **Safety override determinista** (rúbrica de emergencias que fuerza "High"; solo escala, nunca baja) — invariante central de seguridad.
- **Fallback basado en reglas** para clasificar cuando el modelo falla.
- **Pet Clinical History Hub (Fase 7.5, gran expansión dirigida por el usuario):**
  - **Medicamentos** por mascota (dosis + unidad, "prescrito por", fechas, activo/finalizado).
  - **Clínicas veterinarias + doctores** a nivel dueño (globales), con horarios y estado Open/Closed en vivo.
  - **Citas (appointments)** con motivo, notas, resultado (outcome) y doctor.
  - **Follow-ups** (re-evaluaciones fechadas dentro del mismo assessment inmutable).
  - **Tracker de síntomas activos** con reconciliación (resolver/mejorar/empeorar/agregar) y deduplicación canónica.
  - **Chats asistentes contextuales** (por mascota + widget de dashboard) con **confirmar-antes-de-escribir** (tarjetas de propuesta → rutas REST validadas/RLS).
- **Exportación PDF para el veterinario** con **resumen clínico generado por IA** (prioridad determinista según el riesgo guardado) — `@react-pdf/renderer`.
- **Seguridad más allá de la propuesta:** RLS en todas las tablas, aislamiento de la service-role key (solo en `scripts/`), **rate limiting + cost guard** (Upstash Redis), **security headers + CSP con nonce**, **Arcjet** (shield + bot detection) en las rutas de IA.
- **Pet soft-delete + Restore + purge** ("Recently deleted").
- **136 tests automatizados (Vitest)** — safety override, fallback, schemas, regresión de triage, rutas.
- **Monitoreo:** Sentry (errores), PostHog (3 eventos: assessment_started/completed, risk_level_shown), UptimeRobot (health check /api/health).
- **`vet_protocol.md`** — protocolo de calibración clínica con veterinario (afina rúbrica/safety/extracción módulo por módulo).
- **Búsqueda de historial** (`/api/search` + `/history`, rate-limited, injection-safe).

---

## 4. Lo que se DESCARTÓ (a propósito)

- **FastAPI / Python / Railway** — reemplazados por Next.js full-stack en Vercel.
- **Tabla separada de mensajes** — colapsada en `conversation_log` JSONB.
- **Botón "Save" + `user_saved` como compuerta** — reemplazados por auto-guardado.
- **Compuerta de confidence 0.75** — eliminada (confidence es solo registro).
- **Filtro de urgencia en la recuperación RAG** — eliminado (solo re-rank).

---

## 5. Lo que sigue PENDIENTE / DIFERIDO (no es "faltante", es más adelante)

- **Ingesta de la base de conocimiento RAG (Fase 4)** — pipeline construido; faltan documentos fuente. El motor RAG corre vacío; la clasificación funciona con el conocimiento del modelo.
- **Email/Resend** — diferido (sin cuenta/dominio): email de cita al doctor + email con resumen de IA + email de auth por SMTP propio.
- **UI/UX polish + accesibilidad responsive (Fase 8)** — diferido por el usuario.
- **Bloque educativo "About these symptoms"** (causas por síntoma / cuándo preocuparse) — no construido como sección propia.
- **Notificaciones push** para riesgo alto — no implementado.
- **Tabla `assessment_analytics`** (métricas diarias) — no implementada.
- **Pruebas manuales:** UAT con 10 usuarios reales, smoke test de producción, targets de performance (Fase 12).
- **Caching del resumen PDF del vet** — hoy llama a Sonnet en cada descarga (optimización anotada).

---

## 6. Estado real del producto HOY (lo que va al reporte como "lo construido")

**Funcional y probado en vivo:** registro/login con verificación por email · perfiles multi-mascota (autocompletado de raza, validación, soft-delete/restore/purge) · **assessment conversacional con IA** (Haiku extrae + Sonnet clasifica) · riesgo **Low/Medium/High** con razonamiento clínico + acción recomendada · **safety override determinista** + fallback por reglas · tracker de síntomas activos con reconciliación · primeros auxilios (riesgo bajo, por síntoma+edad) · **contactos de emergencia por estado** (8 seed + hotline nacional) · **exportación PDF para el vet** con resumen IA · historial + búsqueda · **Hub clínico por mascota** (medicamentos, clínicas/doctores globales, citas, follow-ups) · chats asistentes con confirmar-antes-de-escribir · seguridad (RLS, rate-limit, cost guard, CSP, Arcjet) · monitoreo (Sentry/PostHog/UptimeRobot) · 136 tests.

**Stack real:** Next.js 15 + React 19 (Vercel) · Supabase (PostgreSQL + pgvector HNSW + Auth + RLS) · Claude Haiku 4.5 + Sonnet · OpenAI Embeddings 3-small · Upstash Redis · Tailwind v4 + shadcn base-nova.

**Costo operativo real:** ~USD $80–140/mes (mayormente free tiers; costo de API de IA <1% de un despliegue comercial típico).
