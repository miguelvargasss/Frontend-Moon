// ============================================================
// cypress/e2e/hump10-tallas.cy.ts
// HUMP10 — Gestión de Sistemas de Tallas (Size Systems) Admin
// ============================================================

describe('HUMP10 — Gestión de Sistemas de Tallas (Admin)', () => {
  // ── CU10.1: Listado de Size Systems ──────────────────────────

  describe('CU10.1 - Listado de Sistemas de Tallas (Público/Interno)', () => {
    it('GET /categories/size-systems debe responder con 200', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('API_URL')}/categories/size-systems`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('data');
      });
    });
  });

  // ── CU10.2 a CU10.6: Operaciones Admin ───────────────────────

  describe('CU10.2 a CU10.6 - Rutas Admin de Tallas Protegidas', () => {
    it('POST /categories/size-systems debe requerir rol admin (401 sin token)', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/categories/size-systems`,
        body: { name: 'Tallas Test' },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('DELETE /categories/size-systems/:id debe requerir rol admin (401 sin token)', () => {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('API_URL')}/categories/size-systems/id-cualquiera`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('POST /categories/size-systems/:id/options debe requerir rol admin (401 sin token)', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/categories/size-systems/id-cualquiera/options`,
        body: { label: '39', sortOrder: 1 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
