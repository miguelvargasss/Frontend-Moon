"use strict";
// ============================================================
// cypress/e2e/hump11-direcciones-envio.cy.ts
// HUMP11 — Gestión de Direcciones de Envío por el Cliente
// ============================================================
describe('HUMP11 — Direcciones de Envío (Cliente)', () => {
    beforeEach(() => {
        cy.loginAsUser();
    });
    describe('CU11.1 a CU11.3 - Listar, Registrar y Eliminar Direcciones', () => {
        it('debe permitir añadir una dirección y luego eliminarla', () => {
            // 1. Listar Direcciones en "Mi Cuenta"
            cy.visit('/mi-cuenta');
            cy.wait(1000);
            cy.get('body').should('be.visible');
            cy.get('body').then(($body) => {
                // Encontrar pestaña/sección de direcciones
                const tabDirecciones = $body.find('button:contains("Direcciones"), a:contains("Direcciones")');
                if (tabDirecciones.length > 0)
                    cy.wrap(tabDirecciones.first()).click();
            });
            cy.wait(1000);
            // 2. Registrar Dirección
            cy.contains(/Añadir|Agregar|Nueva dirección/i).click();
            cy.get('form').should('be.visible');
            const addressLine = 'Av. Cypress Test ' + Date.now().toString().slice(-4);
            // Completar formulario asumiendo campos típicos
            cy.get('input[name="firstName"], input[name="name"], input[placeholder*="Nombre"]').first().clear().type('John');
            cy.get('input[name="lastName"], input[placeholder*="Apellido"]').first().clear().type('Doe');
            cy.get('input[name="addressLine1"], input[placeholder*="Dirección"], input[name="address"]').first().clear().type(addressLine);
            cy.get('input[name="city"], input[placeholder*="Ciudad"]').first().clear().type('Lima');
            cy.get('input[name="region"], input[placeholder*="Región"]').first().clear().type('Lima');
            cy.get('input[name="postalCode"], input[placeholder*="Código postal"]').first().clear().type('15001');
            cy.get('input[name="phone"], input[placeholder*="Teléfono"]').first().clear().type('999888777');
            cy.get('input[name="dni"], input[placeholder*="DNI"]').first().clear().type('12345678');
            cy.contains('button', /Guardar|Agregar/i).click();
            // Verificar que se agregó a la lista
            cy.wait(1000);
            cy.contains(addressLine).should('be.visible');
            // 3. Eliminar Dirección
            cy.get('body').then(() => {
                const filaDir = cy.contains(addressLine).parent().parent();
                filaDir.find('button[aria-label="Eliminar"], button:contains("Eliminar")').first().click();
                // Confirmación si la hay
                cy.wait(500);
                cy.get('body').then(($bodyModal) => {
                    const confirmBtn = $bodyModal.find('button:contains("Confirmar"), button:contains("Sí, eliminar")');
                    if (confirmBtn.length > 0) {
                        cy.wrap(confirmBtn).click();
                    }
                });
                // Validar que desapareció
                cy.contains(addressLine).should('not.exist');
            });
        });
    });
});
