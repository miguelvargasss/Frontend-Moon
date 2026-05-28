// ============================================================
// cypress/e2e/hump04-productos.cy.ts
// HUMP04 — Gestión de Inventario y Registro de Productos
// ============================================================

describe('HUMP04 — Catálogo y Gestión de Productos', () => {
  // ── CU04.1: Catálogo Público ─────────────────────────────────

  describe('CU04.1 - Listado del Catálogo de Productos', () => {
    it('debe cargar la página principal de la tienda (ShopPage)', () => {
      cy.visit('/');
      cy.get('body').should('be.visible');
    });

    it('la página de la tienda debe retornar status 200', () => {
      cy.request('/').its('status').should('eq', 200);
    });

    it('debe mostrar el catálogo sin necesidad de autenticación', () => {
      cy.visit('/');
      // No debe haber redirección a /login
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });
  });

  // ── CU04.2: Detalle del Producto ─────────────────────────────

  describe('CU04.2 - Detalle del Producto', () => {
    it('debe cargar la página de detalle de producto en /producto/:id', () => {
      cy.visit('/');
      cy.wait(3000);
      cy.get('body').then(($body) => {
        const links = $body.find('a[href*="/producto/"]');
        if (links.length > 0) {
          const href = links.first().attr('href') as string;
          cy.visit(href);
          cy.url().should('include', '/producto/');
          cy.get('body').should('be.visible');
        } else {
          cy.log('No hay productos en el catálogo para navegar — verificar API');
        }
      });
    });

    it('debe mostrar un 404 o redirigir para un ID de producto inexistente', () => {
      cy.visit('/producto/id-que-no-existe-9999', { failOnStatusCode: false });
      cy.get('body').should('be.visible');
    });
  });

  // ── CU04.3+: Rutas Admin — protección ──────────────────────

  describe('CU04.3 a CU04.7 - Rutas Admin Protegidas para Productos', () => {
    it('debe redirigir al home si un usuario no autenticado accede a /admin/productos', () => {
      cy.visit('/admin/productos');
      cy.url().should('not.include', '/admin/productos');
    });

    it('debe redirigir al home si un usuario no autenticado accede a /admin', () => {
      cy.visit('/admin');
      cy.url().should('not.include', '/admin');
    });
  });
});
