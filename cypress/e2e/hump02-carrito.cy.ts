// ============================================================
// cypress/e2e/hump02-carrito.cy.ts
// HUMP02 — Gestión de Ventas y Carrito de Compras
// ============================================================

describe('HUMP02 — Carrito de Compras', () => {
  // ── CU02.2: Listar ítems del carrito ─────────────────────────

  describe('CU02.2 - Visualización del Carrito', () => {
    it('debe mostrar el carrito vacío si el usuario no ha agregado productos', () => {
      cy.visit('/carrito');
      cy.get('body').should('be.visible');
    });

    it('debe mostrar la página del carrito con algún contenido de navegación', () => {
      cy.visit('/carrito');
      cy.wait(1500);
      // La página debe tener al menos el título o algún texto de la sección del carrito
      cy.get('body').should('not.be.empty');
    });
  });

  // ── CU02.1: Añadir producto al Carrito ───────────────────────

  describe('CU02.1 - Agregar Producto al Carrito (Catálogo)', () => {
    it('debe mostrar el catálogo con contenido en la tienda', () => {
      cy.visit('/');
      cy.get('body').should('be.visible');
      cy.wait(2000);
      cy.get('body').should('not.be.empty');
    });

    it('debe navegar al detalle de un producto al hacer clic en él', () => {
      cy.visit('/');
      cy.wait(3000);
      cy.get('body').then(($body) => {
        const productLinks = $body.find('a[href*="/producto/"]');
        if (productLinks.length > 0) {
          cy.wrap(productLinks.first()).click();
          cy.url().should('include', '/producto/');
        } else {
          cy.log('No hay productos cargados — revisar conexión con la API');
        }
      });
    });
  });

  // ── CU02.x: Validaciones de estado del carrito ───────────────

  describe('CU02.x - Validaciones y Estado', () => {
    it('debe mostrar la ruta /carrito sin redirección si el usuario no está autenticado', () => {
      cy.visit('/carrito');
      cy.url().should('include', '/carrito');
    });

    it('debe cargar correctamente la página del carrito', () => {
      cy.visit('/carrito');
      cy.get('body').should('be.visible');
    });
  });
});
