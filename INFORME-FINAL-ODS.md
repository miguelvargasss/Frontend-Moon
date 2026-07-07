# Informe Final de Implementaciones: Accesibilidad Web y ODS 10

Este informe técnico documenta todas las mejoras de Accesibilidad (A11y) y Diseño Universal implementadas en el proyecto **MoonPhases**. Todo el desarrollo ha sido diseñado para cumplir de manera estricta con las pautas **WCAG 2.1 (Niveles A, AA y AAA)** y contribuir activamente al **Objetivo de Desarrollo Sostenible (ODS) 10: Reducción de las Desigualdades**.

---

## 1. Justificación y Propósito (Alineación con ODS 10)

La tecnología debe ser un puente, no una barrera. El propósito de estas implementaciones es asegurar que la plataforma sea utilizada equitativamente por personas con diversas condiciones y habilidades (motrices, visuales, cognitivas o barreras lingüísticas).

**Evidencia de Cumplimiento ODS 10:**
- **Meta 10.2 (Inclusión Social):** Al implementar soporte para lectores de pantalla y navegación por teclado, se incluye económicamente a personas con discapacidades severas. La inclusión de **Runasimi (Quechua)** incluye a las comunidades originarias del Perú, permitiéndoles acceder a plataformas digitales comerciales.
- **Meta 10.3 (Igualdad de Oportunidades):** Todos los usuarios, sin importar su lengua natal o capacidad física, tienen la misma experiencia de compra autónoma en la plataforma.

---

## 2. Implementaciones según los Principios WCAG (P.O.U.R.)

Las mejoras estructurales siguen los cuatro principios fundamentales de la accesibilidad web: **Perceptible, Operable, Comprensible y Robusto**.

### Principio 1: Perceptible
*La información debe ser presentada a los usuarios de manera que puedan percibirla.*

**Criterio 1.1.1: Contenido no textual (Nivel A)**
- Todos los elementos visuales decorativos (`<svg>`) fueron ocultados a los lectores de pantalla usando `aria-hidden="true"` y `focusable="false"`.
- Todas las imágenes de productos (carruseles y miniaturas) ahora cuentan con atributos `alt` dinámicos (ej. `alt="Miniatura de Polos Frases Divertidas"`).

### Principio 2: Operable
*Los componentes de la interfaz de usuario deben ser operables por cualquier medio (no solo ratón).*

**Criterio 2.4.1: Evitar bloques (Nivel A) - "Skip Link"**
- Se implementó un enlace oculto ("Saltar al contenido principal") que se hace visible automáticamente cuando el usuario presiona la tecla `Tab`. Esto evita que las personas con problemas motores escuchen el menú completo cada vez que cargan la página.

**Criterio 2.4.7: Foco visible (Nivel AA)**
- Formularios de autenticación, la barra de navegación y los componentes de carga de imágenes ahora poseen indicadores de foco de alto contraste (`focus-visible:ring-primary`), guiando visualmente a quienes navegan con el teclado.

### Principio 3: Comprensible
*La información y el funcionamiento de la interfaz de usuario deben ser comprensibles.*

**Criterio 3.1.1 y 3.1.2: Idioma de la página y las partes (Nivel A y AA)**
- **Integración i18n Nativa:** Se implementó un sistema de internacionalización basado en React Context. Este actualiza dinámicamente el atributo `lang` en la etiqueta `<html>`.
- **Traducción Universal:** Más de 82 claves de interfaz, además de los datos de productos y categorías dinámicas, fueron traducidas.

**Criterio 1.4.8: Presentación Visual (Nivel AAA) - Widget de Accesibilidad**
Se construyó un panel global de accesibilidad que permite al usuario modificar su entorno:
- **Tamaño de texto:** Escalabilidad sin romper el layout.
- **Modos de Color:**
  - *Normal:* Paleta original.
  - *Modo Claro:* Invierte los colores oscuros por fondos blancos con texto negro (sin afectar a las imágenes).
  - *Alto Contraste:* Optimizado para personas con baja visión.
  - *Simulaciones daltónicas:* Deuteranopia, Protanopia, Tritanopia, y Escala de Grises.

**Criterio 4.1.3: Mensajes de Estado (Nivel AA)**
- Se implementaron alertas de notificaciones o *Toasts* (ej. "Producto agregado al carrito") con los atributos `role="status"`, `aria-live="polite"` y `aria-atomic="true"`. El lector de pantalla avisa automáticamente al usuario de las interacciones asíncronas sin necesidad de enfocar la ventana.

---

## 3. Arquitectura del Sistema de Internacionalización (i18n)

Para cumplir con la meta de **Inclusión Lingüística**, se desarrolló un motor `i18n` sin dependencias externas:

| Idioma | Código | Justificación |
|--------|--------|---------------|
| **Español** | `es` | Idioma original de la plataforma y del público general. |
| **English** | `en` | Idioma de acceso universal, fundamental para la accesibilidad global. |
| **Runasimi** | `qu` | Lengua nativa Quechua. Demuestra un impacto real en el ODS 10 para poblaciones originarias. |

**Flujo Tecnológico:**
1. El usuario abre el *Widget de Accesibilidad* y selecciona "Runasimi".
2. Una transición visual de 600ms suaviza el redibujado total del DOM.
3. El estado de la aplicación cambia a `qu` (guardado automáticamente en `localStorage`).
4. Todos los componentes de React consumen el hook `useLanguage` y cambian instantáneamente los textos.
5. El lector de pantalla cambia su motor de pronunciación al detectar `lang="qu"`.

---

## 4. Resultados de Validación Automatizada (WAVE y AXE)

El proyecto superó las pruebas de las herramientas de auditoría estándar de la industria, arrojando cero errores críticos de accesibilidad.

| Métrica Evaluada | Herramienta | Estado | Observación |
|------------------|-------------|--------|-------------|
| **Language `lang` attribute** | WAVE | ✅ PASS | El idioma raíz (`<html>`) muta entre `es`, `en` y `qu`. |
| **Color Contrast (4.5:1)** | AXE / WAVE | ✅ PASS | Los colores en "Alto Contraste" superan el ratio 7:1. |
| **Missing alt text** | WAVE | ✅ PASS | Todas las imágenes críticas, incluyendo dinámicas, tienen `alt`. |
| **ARIA valid attributes** | AXE | ✅ PASS | `aria-hidden`, `aria-live`, y `aria-pressed` configurados según W3C. |
| **Bypass blocks** | WAVE | ✅ PASS | Skip link funciona correctamente. |

---

## 5. Conclusión General

La plataforma **MoonPhases** ha dejado de ser un simple aplicativo web comercial para convertirse en un ecosistema digital equitativo. 
Al ofrecer una navegación que no requiere ratón, descripciones para ciegos, configuraciones de color flexibles para deficiencias visuales (Modo Claro, Daltónicos, Alto Contraste) y un sistema multilingüe con énfasis en lenguas originarias, se asegura el alineamiento completo con el **ODS 10**, demostrando que la empatía en la ingeniería de software es fundamental para el desarrollo sostenible.
