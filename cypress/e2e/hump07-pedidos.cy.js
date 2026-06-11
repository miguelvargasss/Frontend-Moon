"use strict";
// ============================================================
// cypress/e2e/hump07-pedidos.cy.ts
// HUMP07 — Visualización de Historial y Detalle de Pedidos
// ============================================================
describe('HUMP07 — Historial y Detalle de Pedidos (Cliente)', () => {
    beforeEach(() => {
        cy.loginAsUser();
    });
    describe('CU07.1 - Listar Mis Pedidos', () => {
        it('debe mostrar la lista de pedidos del usuario', () => {
            cy.visit('/mis-pedidos');
            cy.get('body').should('be.visible');
            cy.get('h1').contains(/Mis Pedidos/i).should('be.visible');
            // Debería existir la tabla o lista de pedidos
            cy.get('body').then(($body) => {
                if ($body.text().includes('No tienes pedidos')) {
                    cy.log('El usuario no tiene pedidos actualmente.');
                }
                else {
                    // Debería haber una tabla
                    cy.get('table').should('exist');
                    // Y algún código de orden visible (M...)
                }
            });
        });
    });
    describe('CU07.2 - Ver Detalle del Pedido', () => {
        it('debe permitir hacer clic en un pedido para ver su detalle', () => {
            cy.visit('/mis-pedidos');
            cy.wait(1500);
            cy.get('body').then(($body) => {
                const detailBtns = $body.find('a[href*="/mis-pedidos/"], button:contains("Ver detalle")');
                if (detailBtns.length > 0) {
                    cy.wrap(detailBtns.first()).click();
                    // Debe redirigir a la vista de detalle
                    cy.url().should('include', '/mis-pedidos/');
                    // Debe mostrar la info del pedido
                    cy.contains(/Detalle del Pedido/i).should('be.visible');
                    cy.contains(/Total/i).should('be.visible');
                }
                else {
                    cy.log('No hay pedidos para probar el detalle.');
                }
            });
        });
    });
});
