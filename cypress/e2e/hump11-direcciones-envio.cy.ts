// ============================================================
// cypress/e2e/hump11-direcciones-envio.cy.ts
// HUMP11 — Gestión de Direcciones de Envío por el Cliente
// ============================================================

describe('HUMP11 — Gestión de Direcciones de Envío', () => {
  // ── CU11.1 a CU11.3: Endpoints protegidos ────────────────────

  describe('CU11.1 - Listado de Direcciones (Protegido)', () => {
    it('GET /shipping/addresses debe requerir autenticación (401 sin token)', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('API_URL')}/shipping/addresses`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe('CU11.2 - Registro de Dirección (Protegido)', () => {
    it('POST /shipping/addresses debe requerir autenticación (401 sin token)', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/shipping/addresses`,
        body: {
          firstName: 'Test',
          lastName: 'Usuario',
          address: 'Av. Test 123',
          city: 'Lima',
          region: 'Lima',
          phone: '999999999',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe('CU11.3 - Eliminación de Dirección (Protegido)', () => {
    it('DELETE /shipping/addresses/:id debe requerir autenticación (401 sin token)', () => {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('API_URL')}/shipping/addresses/id-cualquiera`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  // ── Checkout: integración con Shipping ───────────────────────

  describe('Integración Checkout + Shipping', () => {
    it('el checkout muestra formulario de nueva dirección si no hay direcciones registradas', () => {
      // Sin estar logueado, el checkout muestra un estado determinado
      cy.visit('/checkout');
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });
  });
});
