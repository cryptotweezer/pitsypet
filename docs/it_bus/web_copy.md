# PitsyPet — Web Copy (Landing / Home)

> **IMPLEMENTADO (rama `feat/landing-page`).** El landing completo (11 secciones) ya está en
> código: `src/app/page.tsx` + `src/components/landing/{landing-header,hero-carousel}.tsx`
> + paleta placeholder en `src/app/globals.css`. Base de layout = mockup de Stitch, adaptado
> al stack (Tailwind v4, lucide, CSP-safe) con navbar + Hero según lo acordado.
> **El copy vive ahora en el código**; este doc queda como **checklist de requisitos + registro de
> decisiones**. Se ajusta sección por sección sobre la página renderizada.
>
> **Pendiente sobre el landing:** paleta/branding real (hoy morado placeholder tokenizado) ·
> fotos reales del hero (hoy placeholders) · Stripe Checkout en "Go Premium" · form de contacto
> funcional · mapa real en Emergency locator · Google OAuth en login/register.
>
> Estado por sección: 🔲 pendiente · 🟡 en progreso · ✅ definido.
> Cada sección mapea a un requisito calificado (ver `dev_handoff_demo_requirements.md`).

---

## 1. Header / Nav ✅
*(sticky · logo izquierda · links · Log in + Get started a la derecha)*
*Requisito: navegación a Contact (obligatorio).*

- **Logo / wordmark:** `PitsyPet` (izquierda; ícono + wordmark — ícono pendiente branding, texto ya definido)
- **Nav links:** `How it works` · `Why us` · `Pricing` · `Contact`
- **CTA secundario (Log in):** `Log in` — estilo ghost/texto → `/login` (usuario existente)
- **CTA primario (Get started):** `Get started` — botón sólido → `/register` (usuario nuevo)

**Notas de auth (tarea aparte, no bloquea copy):**
- `Get started` → **register**; `Log in` → **login**. Ambos botones se quedan (usuarios distintos).
- Login con Gmail = **Supabase Google OAuth nativo** (NO Clerk): activar provider Google + botón
  "Continue with Google" en las páginas login/register; reusa `/auth/callback/route.ts` y el trigger
  `handle_new_user` ya existentes. Sin tocar RLS/middleware/triggers.
- Idioma del landing: **inglés**.

---

## 2. Hero 🟡
*(titular problema→solución · subtítulo value-prop · CTA primario + secundario · línea de confianza)*
*Requisito: marketing + core value proposition.*

**Layout decidido (ref. `Downloads/hero.png` = SOLO ubicación de contenido, NO texto ni colores):**
- Hero **partido**: texto a la **izquierda**, **animal a la derecha** ocupando ~media pantalla.
- Fondo con color de marca (**paleta pendiente** — ver `branding.md`).
- Dos CTAs: **sólido (primario)** + **outline (secundario)**.
- Registro emocional = **tranquilizar a un dueño preocupado** (NO "agenda una cita" comercial).
- **Visual (decidido):** **cross-fade cycling** entre **4 fotos estáticas — 2 perros + 2 gatos,
  alternando perro/gato**. Solo `opacity` (GPU), foto ~5s + fundido ~0.8s. Sin scale/float.
  Cada foto AVIF/WebP (~50–120 KB); primera eager, resto lazy/idle. `prefers-reduced-motion`
  → se congela en una foto. NO gif, NO video, NO breathing/scale. Assets propios pendientes.

- **Headline:** `Know what to do when your pet gets sick.`
- **Subhead:** `PitsyPet's AI reads your pet's symptoms and tells you if it's safe to watch at home, worth a vet visit, or an emergency — in minutes, 24/7, at no upfront cost.`
- **CTA primario:** `Get started` → `/register`
- **CTA secundario:** `See how it works` → ancla §4
- **Trust line:** `Educational triage tool — not a diagnosis. Always consult a vet for medical decisions.`

---

## 3. The problem — "Sound familiar?" 🔲
*(susto de las 2 a.m. · difícil juzgar urgencia · costo de emergencias)*
*Requisito: problem statement + customer profile (gancho emocional, nivel HD).*

- **Título:** _(pendiente)_
- **Cuerpo:** _(pendiente)_

---

## 4. How it works 🔲
*(3–4 pasos: describe síntomas → IA extrae → riesgo Low/Med/High → consejo)*
*Requisito: information flow.*

- **Título:** _(pendiente)_
- **Pasos:** _(pendiente)_

---

## 5. Features / What you get — List of available services 🔲
*(triage conversacional · riesgo + razonamiento · primeros auxilios (Low) · contactos de emergencia (High) · multi-mascota · hub clínico · asistente · historial buscable · export PDF para el vet)*
*Requisito: lista de servicios (OBLIGATORIO).*

- **Título:** _(pendiente)_
- **Items:** _(pendiente)_

---

## 6. Why PitsyPet / Safety-first (USP) 🔲
*(safety override determinista · fallback por reglas · calibrado con veterinario · fundamentado en RSPCA/AVA)*
*Requisito: diferenciadores vs competidores.*

- **Título:** _(pendiente)_
- **Cuerpo / puntos:** _(pendiente)_

---

## 7. Emergency vet locator (mapa) 🔲
*(mapa embebido de clínicas 24/7 por estado — usa `emergency_contacts` sembrados)*
*Requisito: BONUS location maps.*

- **Título:** _(pendiente)_
- **Copy de apoyo:** _(pendiente)_

---

## 8. Pricing 🔲
*(Free vs Premium $9.99/mo · comparación de features · CTA → Stripe Checkout)*
*Requisito: pago + marketing.*

- **Título:** _(pendiente)_
- **Plan Free:** _(pendiente)_
- **Plan Premium ($9.99/mo):** _(pendiente)_
- **CTA:** _(pendiente)_

---

## 9. Final CTA band 🔲
*(cierre de conversión — opcional, se puede fusionar con Pricing)*

- **Título:** _(pendiente)_
- **CTA:** _(pendiente)_

---

## 10. Contact 🔲
*(sección ancla + página `/contact` — formulario o email + datos)*
*Requisito: Contact Us (OBLIGATORIO).*

- **Título:** _(pendiente)_
- **Copy / campos:** _(pendiente)_

---

## 11. Footer 🔲
*(ABN/ACN temporal · ambos disclaimers · links a redes · nav · privacy/terms · copyright)*
*Requisito: 3 obligatorios (ABN/ACN, disclaimers) + 1 bonus (social links).*

- **ABN/ACN (temporal):** _(pendiente — "to be registered")_
- **Disclaimer clase:** `This website/app is for a class assignment and not for commercial purposes`
- **Disclaimer médico:** _(pendiente — "educational tool only, not a diagnosis")_
- **Social links:** _(pendiente)_
- **Nav / legal:** _(pendiente)_
