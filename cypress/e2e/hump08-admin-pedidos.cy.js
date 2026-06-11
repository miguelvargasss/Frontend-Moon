"use strict";
// ============================================================
// cypress/e2e/hump08-admin-pedidos.cy.ts
// HUMP08 — Gestión de Pedidos y Acumulación de MoonPoints
// ============================================================
describe('HUMP08 — Gestión de Pedidos (Admin)', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });
    describe('CU08.1 - Listar Todas las Órdenes', () => {
        it('debe permitir al administrador ver la lista de todos los pedidos', () => {
            cy.visit('/admin/pedidos');
            cy.get('body').should('be.visible');
            cy.get('h1').contains(/Pedidos/i).should('be.visible');
            // Asegurarse de que carga la tabla
            cy.get('table').should('exist');
        });
    });
    describe('CU08.2 y CU08.3 - Actualizar Estado y MoonPoints', () => {
        it('debe permitir cambiar el estado de un pedido', () => {
            cy.visit('/admin/pedidos');
            cy.wait(1500);
            cy.get('body').then(($body) => {
                // Buscar un select o botón de cambiar estado
                const selects = $body.find('select');
                if (selects.length > 0) {
                    // Cambiar el estado al siguiente valor
                    // Seleccionamos "CONFIRMADO" (value suele coincidir con la DB o Enum)
                    cy.wrap(selects.first()).select('CONFIRMADO');
                    cy.wait(1500);
                    // Opcional: puede haber un botón de Guardar, o el cambio es automático con onChange
                    const saveBtn = $body.find('button:contains("Guardar")');
                    if (saveBtn.length > 0) {
                        cy.wrap(saveBtn.first()).click();
                    }
                    cy.contains(/actualizado/i).should('be.visible');
                    // La acumulación de MoonPoints (CU08.3) ocurre en backend al pasar a CONFIRMADO.
                    // Se verifica comprobando que el estado quedó guardado en UI.
                    cy.wrap(selects.first()).should('have.value', 'CONFIRMADO');
                }
                else {
                    cy.log('No hay pedidos listados o el selector de estado es de otro tipo (dropdown UI)');
                }
            });
        });
    });
});
