# Diagrama de Paquetes — Modelo Arquitectónico Frontend MoonPhases

## Diagrama de Paquetes del Sistema (Frontend)

La arquitectura del Frontend sigue un modelo **Modular Clean Architecture** (o Feature-Sliced Design). Se ha estructurado dividiendo el proyecto en los mismos módulos de negocio que el Backend, garantizando un acoplamiento coherente y mantenible. 

```mermaid
graph TB

    subgraph PRES["Capa de Presentación (UI)"]
        direction LR
        subgraph AUTH_C["Módulo Auth"]
            AC1["LoginPage / RegisterPage"]
            AC2["Componentes Auth (Forms)"]
        end
        subgraph USER_C["Módulo Users"]
            UC1["ProfilePage"]
        end
        subgraph PROD_C["Módulo Products"]
            PC1["CatalogPage / DetailPage"]
            PC2["ProductCard"]
        end
        subgraph CART_C["Módulo Cart"]
            CRC1["CartDrawer / CartPage"]
            CRC2["CartItem UI"]
        end
        subgraph ORD_C["Módulo Orders"]
            OC1["CheckoutPage / MyOrdersPage"]
        end
    end

    subgraph SHARE["Capa Transversal (Shared & Core)"]
        direction LR
        subgraph S_CORE["Core"]
            CR1["Router (React Router)"]
            CR2["Config (Env)"]
            CR3["HTTP Client (Axios wrapper)"]
        end
        subgraph S_UI["Shared UI"]
            SH1["Componentes UI (Button, Input, Modal)"]
            SH2["Layouts (MainLayout, AuthLayout)"]
            SH3["Hooks genéricos"]
        end
    end

    subgraph APP["Capa de Aplicación (Estado y Casos de Uso)"]
        direction LR
        subgraph AUTH_UC["Auth App"]
            AUC1["auth.store (Gestor global)"]
            AUC2["useAuth (Hook / View-Model)"]
        end
        subgraph PROD_UC["Products App"]
            PUC1["useProducts (Logica listar/filtrar)"]
        end
        subgraph CART_UC["Cart App"]
            CRUC1["cart.store (Estado global)"]
            CRUC2["useCart (Lógica de negocio)"]
        end
        subgraph ORD_UC["Orders App"]
            OUC1["useCheckout"]
            OUC2["useOrders"]
        end
    end

    subgraph DOMINIO["Capa de Dominio (Entidades e Interfaces)"]
        direction LR
        subgraph AUTH_D["Auth Domain"]
            AD1["IAuthRepository"]
            AD2["AuthUser (Model/Interface)"]
        end
        subgraph PROD_D["Product Domain"]
            PD1["IProductRepository"]
            PD2["Product (Model/Interface)"]
        end
        subgraph CART_D["Cart Domain"]
            CRD1["ICartRepository"]
            CRD2["CartItem (Model)"]
        end
        subgraph ORD_D["Order Domain"]
            OD1["IOrderRepository"]
            OD2["Order / OrderItem (Models)"]
        end
    end

    subgraph INFRA["Capa de Infraestructura (Adaptadores y API)"]
        direction LR
        subgraph REPOS["API Repositories"]
            IR1["AuthApiRepository"]
            IR2["UserApiRepository"]
            IR3["ProductApiRepository"]
            IR4["CartApiRepository"]
            IR5["OrderApiRepository"]
            IR6["... rest API ..."]
        end
    end

    subgraph EXT["Servicios Externos (Backend)"]
        direction LR
        subgraph BE["MoonPhases API"]
            BE1["NestJS REST API"]
        end
    end

    PRES -.->|"utiliza"| SHARE
    PRES -.->|"consume estado/lógica"| APP
    APP -.->|"orquesta y abstrae"| DOMINIO
    APP -.->|"llama dependencias"| INFRA
    INFRA -.->|"implementa contratos"| DOMINIO
    INFRA -.->|"realiza peticiones HTTP"| EXT
    INFRA -.->|"usa"| S_CORE

    style PRES fill:#DBEAFE,stroke:#3B82F6,stroke-width:2px
    style SHARE fill:#E5E7EB,stroke:#6B7280,stroke-width:2px
    style APP fill:#FEF3C7,stroke:#F59E0B,stroke-width:2px
    style DOMINIO fill:#D1FAE5,stroke:#10B981,stroke-width:2px
    style INFRA fill:#FEE2E2,stroke:#EF4444,stroke-width:2px
    style EXT fill:#EDE9FE,stroke:#8B5CF6,stroke-width:2px
```

---

## Diagrama del Patrón Interno por Módulo (Frontend)

Cada módulo en el frontend (ej. *Auth*, *Products*, *Cart*) replica una estructura interna consistente para aislar la lógica y la UI.

```mermaid
graph TB

    subgraph MOD["Estructura de Carpetas por Módulo (src/modules/nombre-modulo/)"]

        subgraph PRES_PKG["presentacion/"]
            PAGES["pages/"]
            COMPS["components/"]
        end

        subgraph APP_PKG["aplicacion/"]
            HOOKS["hooks/ (Custom Hooks)"]
            STORE["store/ (Estado Global)"]
        end

        subgraph DOM_PKG["dominio/"]
            MODELS["models/ (Types, Interfaces)"]
            REPO_INT["repositories/ (Interfaces)"]
        end

        subgraph INFRA_PKG["infraestructura/"]
            API_REPO["api-repository/(Clase implementada)"]
            DTOS["dtos/ (Mapeo Backend)"]
        end
    end

    PRES_PKG -->|"Maneja UI y \nllamar hooks"| APP_PKG
    APP_PKG -->|"Define lógica sobre"| DOM_PKG
    INFRA_PKG -.->|"Implementa interfaces\ndependiendo de"| DOM_PKG
    INFRA_PKG -.->|"Llamadas API con"| DTOS

    style PRES_PKG fill:#DBEAFE,stroke:#3B82F6,stroke-width:2px
    style APP_PKG fill:#FEF3C7,stroke:#F59E0B,stroke-width:2px
    style DOM_PKG fill:#D1FAE5,stroke:#10B981,stroke-width:2px
    style INFRA_PKG fill:#FEE2E2,stroke:#EF4444,stroke-width:2px
```

---

## Guía para Recrear en Draw.io (Modelo Frontend)

### 1. Convenciones Visuales de Capas

| Capa | Fill (fondo) | Stroke (borde) | ¿Qué incluye en Frontend? |
|---|---|---|---|
| Presentación | Azul claro (`#DBEAFE`) | Azul (`#3B82F6`) | Componentes React, Páginas, Assets |
| Compartido (Shared) | Gris claro (`#E5E7EB`) | Gris (`#6B7280`) | UI Components base, Config, Cliente HTTP (Axios) |
| Aplicación | Amarillo claro (`#FEF3C7`) | Amarillo (`#F59E0B`) | Hooks que manejan UseCases (React Query/SWR), Estado Global (Zustand, Context) |
| Dominio | Verde claro (`#D1FAE5`) | Verde (`#10B981`) | Interfaces TypeScript, Entidades de negocio, Contratos |
| Infraestructura | Rojo claro (`#FEE2E2`) | Rojo (`#EF4444`) | Fetch/Axios API Repositories, DTOs de adaptadores |
| External (Backend) | Púrpura claro (`#EDE9FE`) | Púrpura (`#8B5CF6`) | App NestJs |

### 2. Estructura recomendada para el Canvas

1. Crear paquetes organizados verticalmente (Presentación arriba, Dominio, Infraestructura abajo).
2. Dejar el bloque `Shared / Core` a la derecha de la capa de presentación (como soporte).
3. Utiliza la herramienta UML → **Package** para envolver el modelo, y usa **Dashed Arrows** (líneas punteadas) para indicar las llamadas y usos inter-capas.

### 3. La Estructura de Folders Implementada

La base de carpetas que ya se encuentra creada en el proyecto para seguir esta arquitectura en `./src` es:
```text
src/
├── core/
│   ├── config/ (variables del entorno, etc.)
│   ├── http/ (cliente axios base)
│   └── routes/ (configurador principal de las vistas)
├── shared/
│   ├── components/ (ej: botones reusables)
│   ├── hooks/ (comunes)
│   ├── layouts/ (Navbar, Footer, etc.)
│   └── utils/ (formatters, validadors base)
└── modules/
    ├── auth/ -> (domain, application, infrastructure, presentation)
    ├── users/ -> (domain, application, infrastructure, presentation)
    ├── products/ -> (domain, application, infrastructure, presentation)
    ├── categories/ -> (domain, application, infrastructure, presentation)
    ├── cart/ -> (domain, application, infrastructure, presentation)
    ├── coupons/ -> (domain, application, infrastructure, presentation)
    ├── shipping/ -> (domain, application, infrastructure, presentation)
    └── orders/ -> (domain, application, infrastructure, presentation)
```
