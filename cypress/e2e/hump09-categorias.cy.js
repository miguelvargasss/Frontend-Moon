"use strict";
// ============================================================
// cypress/e2e/hump09-categorias.cy.ts
// HUMP09 — Gestión de Categorías por el Administrador
// ============================================================
describe('HUMP09 — Gestión de Categorías (Admin)', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });
    describe('CU09.1 a CU09.4 - CRUD de Categorías', () => {
        it('debe permitir crear, editar y eliminar una categoría', () => {
            // 1. Listar y Crear
            cy.visit('/admin/categorias');
            cy.get('body').should('be.visible');
            cy.contains(/Crear|Nueva/i).click();
            const catName = 'CYPRESS CAT ' + Date.now().toString().slice(-4);
            cy.get('input[name="name"]').type(catName);
            cy.contains('button', /Guardar|Crear/i).click();
            // Validamos que se agregó a la lista
            cy.contains(catName).should('be.visible');
            // 2. Editar
            cy.get('body').then(() => {
                // Asumiendo que la fila contiene el nombre de la categoría y un botón editar
                const fila = cy.contains(catName).parent();
                fila.find('button[aria-label="Editar"], button:contains("Editar")').click();
                const catNameEdited = catName + ' EDIT';
                cy.get('input[name="name"]').clear().type(catNameEdited);
                cy.contains('button', /Guardar|Actualizar/i).click();
                cy.wait(1000);
                cy.contains(catNameEdited).should('be.visible');
                // 3. Eliminar
                const filaModificada = cy.contains(catNameEdited).parent();
                filaModificada.find('button[aria-label="Eliminar"], button:contains("Eliminar")').click();
                // Puede que requiera confirmación en modal
                cy.wait(500);
                cy.get('body').then(($bodyModal) => {
                    const confirmBtn = $bodyModal.find('button:contains("Confirmar"), button:contains("Sí, eliminar")');
                    if (confirmBtn.length > 0) {
                        cy.wrap(confirmBtn).click();
                    }
                });
                // Validar que desapareció
                cy.contains(catNameEdited).should('not.exist');
            });
        });
    });
});
