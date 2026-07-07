# Implementaciones de Accesibilidad (A11y) y Cumplimiento ODS 10

Este documento detalla **todas** las modificaciones y mejoras de accesibilidad (A11y) realizadas en la interfaz de usuario del proyecto **MoonPhases**, alineadas con las pautas **WCAG 2.1 AA** y el **ODS 10 (Reducción de las desigualdades)**.

---

## Justificación y Propósito

El objetivo de estos cambios es asegurar que la plataforma de MoonPhases pueda ser utilizada de forma equitativa por personas con diversas discapacidades (motrices, visuales, cognitivas), eliminando barreras de interacción y garantizando la inclusión digital. Las mejoras siguen los 4 principios P.O.U.R. de WCAG 2.1 AA.

---

## Principio 1: Perceptible

> *La información y los componentes de la interfaz deben ser presentados de manera que los usuarios puedan percibirlos.*

### Alternativas de Texto (Criterio 1.1.1 - Nivel A)

| Archivo | Cambio |
|---|---|
| `ProductDetailPage.tsx` | Imágenes en miniatura pasan de `alt=""` a `alt="Miniatura de [Nombre] - Imagen [N]"` |
| `ProductDetailPage.tsx` | Imagen principal del carrusel cuenta con `alt={product.name}` |
| `ImageUploader.tsx` | Imágenes existentes: `alt="Imagen guardada del producto"` |
| `ImageUploader.tsx` | Imágenes pendientes: `alt="Vista previa de imagen a subir"` |
| `CartToast.tsx` | Icono decorativo de "check" marcado con `aria-hidden="true"` |
| `Navbar.tsx` | Logo SVG decorativo marcado con `aria-hidden="true" focusable="false"` |
| `AdminLayout.tsx` | Logo SVG decorativo marcado con `aria-hidden="true" focusable="false"` |
| `MainLayout.tsx` | SVGs decorativos del footer marcados con `aria-hidden="true" focusable="false"` |

---

## Principio 2: Operable

> *Los componentes de la interfaz de usuario y la navegación deben ser operables.*

### Skip Link — Bypass de Bloques (Criterio 2.4.1 - Nivel A)

**Archivo:** `App.tsx`

**Problema:** Usuarios de teclado debían pasar por toda la barra de navegación en cada carga de página para llegar al contenido.

**Solución:** Se implementó un enlace "Saltar al contenido principal" al inicio del árbol de componentes. Está visualmente oculto (`sr-only`) pero se hace visible al recibir foco por teclado (`focus:not-sr-only`). Al activarse, lleva el foco directamente al elemento `<main id="main-content">`.

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
             focus:z-[99999] focus:px-4 focus:py-2 focus:rounded-lg
             focus:bg-primary focus:text-background focus:font-semibold
             focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
>
  Saltar al contenido principal
</a>
```

### Navegación por Teclado y Focus States (Criterio 2.4.7 - Nivel AA)

| Archivo | Cambio |
|---|---|
| `LoginForm.tsx` | Se eliminó `tabIndex={-1}` del botón "Mostrar contraseña". Añadido `focus-visible:ring-primary`. |
| `RegisterForm.tsx` | Se eliminó `tabIndex={-1}` de ambos botones "Mostrar contraseña". Añadido `focus-visible:ring-primary`. |
| `Navbar.tsx` | Botón del menú de usuario recibe `focus:ring-2 focus:ring-primary focus:ring-offset-2`. |
| `AdminLayout.tsx` | Botón del menú de usuario recibe `focus:ring-2 focus:ring-primary focus:ring-offset-2`. |
| `ImageUploader.tsx` | Botón "Subir imágenes" recibe `focus-visible:ring-2 focus-visible:ring-primary`. |

---

## Principio 3: Comprensible

> *La información y el funcionamiento de la interfaz de usuario deben ser comprensibles.*

### Semántica HTML5 (Criterio 1.3.1 - Nivel A)

| Archivo | Cambio |
|---|---|
| `MainLayout.tsx` | `<main>` recibe `id="main-content" tabIndex={-1}` como destino del Skip Link. |
| `AdminLayout.tsx` | El contenedor de contenido `<div>` reemplazado por `<main id="main-content" tabIndex={-1}>`. |

### Atributos ARIA en Componentes Dinámicos (Criterio 4.1.3 - Nivel AA)

| Archivo | Atributo | Descripción |
|---|---|---|
| `LoginForm.tsx` | `aria-label` + `aria-pressed` | El botón de contraseña anuncia su estado al Screen Reader |
| `RegisterForm.tsx` | `aria-label` + `aria-pressed` | Ambos botones de contraseña anuncian su estado |
| `Navbar.tsx` | `aria-label` + `aria-haspopup` | El botón del menú de usuario indica que abre un popup |
| `AdminLayout.tsx` | `aria-label` + `aria-haspopup` | El botón del menú de admin indica que abre un popup |
| `CartToast.tsx` | `role="status"` + `aria-live="polite"` + `aria-atomic="true"` | El toast se anuncia en tiempo real al agregarse un producto |
| `CartToast.tsx` | `aria-label` en botón "Ver carrito" | Descripción clara de la acción del botón |
| `ProductDetailPage.tsx` | `aria-label="Imagen anterior/siguiente"` | Los botones del carrusel son comprensibles sin texto visible |
| `ImageUploader.tsx` | `aria-label` en botones de eliminar | Los botones de `×` tienen descripción para lectores de pantalla |

---

## Evidencia ODS 10: Reducción de las Desigualdades

La implementación de estos cambios constituye evidencia directa de cumplimiento del **Objetivo de Desarrollo Sostenible 10**, en particular:

- **Meta 10.2:** Potenciar y promover la inclusión social, económica y política de todas las personas. → Al garantizar que las personas con discapacidades visuales y motrices puedan acceder a la tienda y realizar compras de forma autónoma.
- **Meta 10.3:** Garantizar la igualdad de oportunidades. → Al eliminar las barreras de interacción digital que excluían a usuarios de teclado o lectores de pantalla.

**Métricas de cumplimiento aplicadas:** WCAG 2.1, Nivel AA (Criterios 1.1.1, 1.3.1, 2.4.1, 2.4.7, 4.1.3).

---

## Principio 3: Comprensible (Ampliación) — Internacionalización (i18n)

> *La información y el funcionamiento de la interfaz de usuario deben ser comprensibles.*

### Idioma de la Página (Criterio 3.1.1 - Nivel A)

**Problema:** La página no indicaba programáticamente su idioma, y los lectores de pantalla no podían determinar la pronunciación correcta de los textos.

**Solución:** Se implementó un sistema i18n ligero basado en React Context que actualiza dinámicamente el atributo `lang` del elemento `<html>` cada vez que el usuario cambia de idioma. Los valores posibles son `es`, `en` y `qu` (códigos ISO 639-1 válidos).

**Archivo:** `src/core/i18n/i18n.tsx` (LanguageProvider)

### Idioma de las Partes (Criterio 3.1.2 - Nivel AA)

**Problema:** Todos los textos de la interfaz estaban hardcodeados en español, excluyendo a usuarios de otras lenguas.

**Solución:** Se extrajeron **más de 82 claves de traducción** a diccionarios independientes para 3 idiomas:

| Idioma | Archivo | Justificación |
|--------|---------|---------------|
| Español | `src/core/i18n/es.ts` | Idioma base del proyecto |
| English | `src/core/i18n/en.ts` | Accesibilidad internacional |
| Runasimi (Quechua) | `src/core/i18n/qu.ts` | Inclusión de lenguas originarias (ODS 10) |

### Sistema de Cambio de Idioma en el Widget de Accesibilidad

**Archivo:** `AccessibilityWidget.tsx`

Se añadió una nueva sección **"Idioma"** al widget de accesibilidad visual, con 3 botones (🇪🇸 Español, 🇬🇧 English, 🏔️ Runasimi) que incluyen:

- `aria-pressed` para indicar el idioma activo
- `aria-label` traducido dinámicamente
- Transición visual de **pantalla blanca (flash)** como feedback del cambio

### Archivos Modificados para i18n

| Archivo | Textos traducidos |
|---------|------------------|
| `App.tsx` | Skip link |
| `Navbar.tsx` | Carrito, login, menú de usuario, logout |
| `MainLayout.tsx` | Footer |
| `AdminLayout.tsx` | Sidebar, header, dropdown |
| `HeroBanner.tsx` | Título, subtítulo, descripción |
| `ShopPage.tsx` | Búsqueda, resultados, loading |
| `ProductCard.tsx` | Ver Detalles, aria-labels |
| `EmptyProducts.tsx` | Mensajes de estado vacío |
| `CategoryTabs.tsx` | Tab "Todos" |
| `LoginForm.tsx` | Labels, botones, mensajes |
| `RegisterForm.tsx` | Labels, requisitos de contraseña, botones |
| `BrandingPanel.tsx` | Slogan, descripción, chips de categoría |
| `CartToast.tsx` | Notificación, botones |

---

## Evidencia ODS 10: Reducción de las Desigualdades (Ampliación)

La implementación de la internacionalización amplía el cumplimiento del **ODS 10**:

- **Meta 10.2 (Inclusión):** La disponibilidad de Quechua (Runasimi) permite que hablantes de lenguas originarias del Perú accedan a la plataforma en su idioma nativo.
- **Meta 10.3 (Igualdad):** Usuarios angloparlantes y quechuahablantes tienen la misma experiencia de compra que los hispanohablantes.

**Métricas de cumplimiento aplicadas:** WCAG 2.1, Nivel AA/AAA (Criterios 1.1.1, 1.3.1, 2.4.1, 2.4.7, 3.1.1, 3.1.2, 3.1.3, 4.1.3).


