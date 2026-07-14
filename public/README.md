# public/ — imágenes y assets del landing (todo en esta misma carpeta)

Todo lo estático va **aquí, plano** (sin subcarpetas). Se sirve desde la raíz de la URL:
`public/logo.png` → el código lo usa como `/logo.png`.

**Nombres sugeridos (para que yo los cablee fácil):**

| Archivo | Para qué |
|---|---|
| `logo.png` (o `.svg`) | Logo / wordmark (navbar + footer) |
| `icon.png` / `favicon.ico` | Ícono / favicon del sitio |
| `hero-dog-1.webp` | Hero — perro 1 (cross-fade) |
| `hero-cat-1.webp` | Hero — gato 1 |
| `hero-dog-2.webp` | Hero — perro 2 |
| `hero-cat-2.webp` | Hero — gato 2 |
| `why-us.webp` | Sección "Why us" (mascota + dueño/vet) |
| `og.png` | Imagen para compartir en redes (opcional) |

**Formato:** ideal **`.webp`**/`.avif`; si solo tienes `.jpg`/`.png`/`.svg`, sírvelo igual
(Next.js optimiza con `next/image`; el logo `.svg` va perfecto). Hero = fotos verticales;
Why us = horizontal. Peso por imagen < 300 KB ya optimizada.

Los nombres son sugerencia: pon lo que tengas y dime cómo se llaman, y yo los conecto en el código.
