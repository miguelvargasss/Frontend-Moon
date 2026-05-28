// ============================================================
// cypress/e2e/hump08-admin-pedidos.cy.ts
// HUMP08 — Gestión de Pedidos y Acumulación de MoonPoints (Admin)
// ============================================================

describe('HUMP08 — Gestión de Pedidos y MoonPoints (Admin)', () => {
  // ── Protección de Rutas Admin ─────────────────────────────────

  describe('Protección de Rutas Admin', () => {
    it('debe redirigir al home si usuario no autenticado accede a /admin/pedidos', () => {
      cy.visit('/admin/pedidos');
      cy.url().should('not.include', '/admin/pedidos');
    });
  });

  // ── CU08.x: Validaciones via API Backend ─────────────────────

  describe('CU08.x - Endpoints Admin de Órdenes', () => {
    it('GET /orders/admin/all debe requerir autenticación de admin (401)', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('API_URL')}/orders/admin/all`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('PATCH /orders/admin/:id/status debe requerir autenticación (401)', () => {
      cy.request({
        method: 'PATCH',
        url: `${Cypress.env('API_URL')}/orders/admin/id-cualquiera/status`,
        body: { status: 'CONFIRMADO' },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
