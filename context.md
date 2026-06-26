# MoonPhases - Contexto del Proyecto

## ¿Qué es MoonPhases?
MoonPhases es una plataforma web de comercio electrónico (E-commerce) moderna y escalable. Está diseñada para ofrecer una experiencia de compra de extremo a extremo, abarcando desde la exploración de productos hasta el proceso de pago (checkout) y gestión de pedidos. La aplicación destaca por su enfoque en la accesibilidad (cumplimiento WCAG, widgets de accesibilidad), una interfaz de usuario atractiva con animaciones y elementos 3D, y un panel de administración integral.

## Stack Tecnológico Principal
El frontend está construido utilizando tecnologías modernas:
- **Core:** React 19, TypeScript, Vite.
- **Estilos y UI:** Tailwind CSS, NextUI, Framer Motion (para animaciones).
- **Elementos 3D:** React Three Fiber y Three.js.
- **Gestión de Estado:** Zustand (utilizado para autenticación, carrito de compras, etc.).
- **Enrutamiento:** React Router DOM.
- **Formularios y Validación:** React Hook Form y Zod.
- **Testing:** Cypress (E2E).

## Arquitectura y Módulos
El proyecto sigue una arquitectura modular y estructurada, dividida principalmente en `core` (configuraciones globales, HTTP, rutas base) y `modules` (características de negocio aisladas).

Los módulos principales incluyen:
- **`shop` / `products` / `categories`**: Catálogo de productos, exploración, filtrado y visualización de detalles de los artículos a la venta.
- **`cart` / `checkout`**: Gestión del carrito de compras de los usuarios y el flujo completo de pago y finalización de la compra.
- **`auth` / `users` / `profile`**: Gestión de identidades, inicio de sesión, registro y perfiles de usuario.
- **`admin`**: Panel de control administrativo para gestionar el negocio (productos, usuarios, pedidos, etc.).
- **`orders` / `shipping` / `coupons`**: Lógica de negocio post-venta y promociones, incluyendo seguimiento de envíos y aplicación de descuentos.

## Lógica de Negocio
La aplicación soporta dos flujos principales de usuarios:

1. **Flujo del Cliente (B2C):**
   - Un usuario visitante puede navegar por el catálogo (`shop`), visualizar productos (potencialmente con interactividad 3D o galerías avanzadas) y filtrarlos por `categories`.
   - Puede agregar productos al carrito (`cart`). El estado del carrito se sincroniza y persiste de manera reactiva (manejado por `useCartStore` con Zustand).
   - Para finalizar la compra (`checkout`), el usuario típicamente debe autenticarse (`auth`).
   - Durante el proceso de pago, puede aplicar `coupons` de descuento y gestionar detalles de `shipping`.
   - Una vez realizada la compra, el cliente puede revisar el historial y estado de sus `orders` desde su `profile`.

2. **Flujo Administrativo (B2B / Backoffice):**
   - Usuarios con roles administrativos acceden al módulo `admin`.
   - Tienen la capacidad de realizar operaciones sobre el inventario de la tienda (`products`, `categories`), visualizar y procesar `orders`, administrar `users` de la plataforma, y configurar reglas de negocio como ofertas especiales (`coupons`) y tarifas/zonas de envío (`shipping`).

## Aspectos Destacados
- **Accesibilidad (A11y):** Prioridad en el diseño accesible, evidenciado por la implementación de enlaces de salto ("Skip to content") en el `App.tsx` y un `AccessibilityWidget` global para adaptar la interfaz a diferentes necesidades (WCAG).
- **Rendimiento e Interactividad:** Uso de librerías como `framer-motion` para transiciones fluidas y `react-three-fiber` que sugiere una presentación visual rica y diferencial.
- **Reactividad Global:** Rehidratación automática del estado de la aplicación. Por ejemplo, al detectar un usuario autenticado al inicio de la aplicación, automáticamente se sincroniza la información de su carrito de compras con el servidor/estado local.