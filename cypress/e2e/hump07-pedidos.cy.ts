// ============================================================
// cypress/e2e/hump07-pedidos.cy.ts
// HUMP07 — Visualización de Historial y Detalle de Pedidos
// ============================================================

describe('HUMP07 — Historial y Detalle de Pedidos (Cliente)', () => {
  // ── CU07.1: Protección de Ruta /mis-pedidos ──────────────────

  describe('CU07.1 - Protección de Ruta Mis Pedidos', () => {
    it('debe redirigir a /login si usuario no autenticado accede a /mis-pedidos', () => {
      cy.visit('/mis-pedidos');
      cy.url().should('include', '/login');
    });
  });

  // ── CU07.x: Validación via API ───────────────────────────────

  describe('CU07.x - Endpoints de Pedidos (API)', () => {
    it('el endpoint GET /orders debe requerir autenticación (401)', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('API_URL')}/orders`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('el endpoint GET /orders/:id debe requerir autenticación (401)', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('API_URL')}/orders/id-inexistente`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
