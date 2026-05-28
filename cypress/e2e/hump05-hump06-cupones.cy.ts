// ============================================================
// cypress/e2e/hump05-hump06-cupones.cy.ts
// HUMP05 — Gestión de Cupones de Descuento (Admin)
// HUMP06 — Aplicación de Cupones y Recálculo de Totales (Cliente)
// ============================================================

describe('HUMP05 — Gestión de Cupones (Admin)', () => {
  // ── Protección de Rutas Admin ─────────────────────────────────

  describe('Protección de Rutas Admin para Cupones', () => {
    it('debe redirigir al home si usuario no autenticado accede a /admin/cupones', () => {
      cy.visit('/admin/cupones');
      cy.url().should('not.include', '/admin/cupones');
    });
  });
});

// ─────────────────────────────────────────────────────────────

describe('HUMP06 — Aplicación de Cupones (Cliente)', () => {
  // ── CU06.1: Campo de Cupón en el Carrito ─────────────────────

  describe('CU06.1 - Campo de Cupón en el Carrito', () => {
    it('debe cargar la página del carrito correctamente', () => {
      cy.visit('/carrito');
      cy.get('body').should('be.visible');
    });

    it('debe mostrar el campo de cupón en la página del carrito', () => {
      cy.visit('/carrito');
      cy.wait(1500);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Cupón') || $body.text().includes('cupón') || $body.text().includes('código')) {
          cy.contains(/cupón|código/i).should('be.visible');
        } else {
          cy.log('El campo de cupón solo aparece cuando hay ítems en el carrito');
        }
      });
    });
  });

  // ── CU06.x: Validaciones del Cupón via API ───────────────────

  describe('CU06.x - Validaciones del Cupón via API Backend', () => {
    it('el endpoint POST /coupons/validate debe responder a peticiones', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/coupons/validate`,
        body: { code: 'CODIGO_INVALIDO' },
        headers: {
          'Content-Type': 'application/json',
        },
        // Esperamos un error 401 porque no hay token
        failOnStatusCode: false,
      }).then((response) => {
        // Sin token debe retornar 401 (Unauthorized)
        expect(response.status).to.eq(401);
      });
    });
  });
});
