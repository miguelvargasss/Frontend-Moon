// ============================================================
// cypress/e2e/hump09-categorias.cy.ts
// HUMP09 — Gestión de Categorías por el Administrador
// ============================================================

describe('HUMP09 — Gestión de Categorías', () => {
  // ── CU09.1: Listado Público de Categorías ────────────────────

  describe('CU09.1 - Categorías Públicas via API', () => {
    it('GET /categories debe responder con 200 y un array', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('API_URL')}/categories`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        // La respuesta debe contener un campo "data" que sea un arreglo
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.be.an('array');
      });
    });
  });

  // ── CU09.2 a CU09.4: Operaciones Admin ───────────────────────

  describe('CU09.2 a CU09.4 - Rutas Admin de Categorías Protegidas', () => {
    it('POST /categories debe requerir rol admin (401 sin token)', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/categories`,
        body: { name: 'Categoria Test' },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('PATCH /categories/:id debe requerir rol admin (401 sin token)', () => {
      cy.request({
        method: 'PATCH',
        url: `${Cypress.env('API_URL')}/categories/id-cualquiera`,
        body: { name: 'Categoria Editada' },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('DELETE /categories/:id debe requerir rol admin (401 sin token)', () => {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('API_URL')}/categories/id-cualquiera`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('debe redirigir al home si usuario no autenticado accede a /admin/categorias', () => {
      cy.visit('/admin/categorias');
      cy.url().should('not.include', '/admin/categorias');
    });
  });
});
