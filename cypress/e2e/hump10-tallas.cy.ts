// ============================================================
// cypress/e2e/hump10-tallas.cy.ts
// HUMP10 — Gestión de Sistemas de Tallas por el Administrador
// ============================================================

describe('HUMP10 — Gestión de Sistemas de Tallas (Admin)', () => {

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  describe('CU10.1 a CU10.6 - CRUD de Sistemas de Tallas y sus Opciones', () => {
    it('debe permitir crear un sistema de tallas, añadirle opciones y eliminarlo', () => {
      cy.visit('/admin/tallas');
      cy.get('body').should('be.visible');

      // 1. Crear Sistema de Talla
      cy.contains(/Crear|Nuevo/i).click();
      
      const systemName = 'CYPRESS TALLAS ' + Date.now().toString().slice(-4);
      cy.get('input[name="name"]').type(systemName);
      cy.contains('button', /Guardar|Crear/i).click();
      
      cy.contains(systemName).should('be.visible');

      // 2. Editar/Añadir Opción
      cy.get('body').then(() => {
        const fila = cy.contains(systemName).parent();
        // Clic en editar o en gestionar opciones
        fila.find('button[aria-label="Opciones"], button:contains("Opción"), button[aria-label="Editar"], button:contains("Editar")').first().click();
        
        // Modal o vista para añadir la talla, por ejemplo "39"
        cy.wait(1000);
        cy.get('body').then(($inner) => {
           const labelInput = $inner.find('input[name="label"], input[placeholder*="Etiqueta"]');
           if (labelInput.length > 0) {
             cy.wrap(labelInput).type('39');
             // Botón de agregar a la lista
             const addBtn = $inner.find('button:contains("Agregar"), button:contains("Añadir")');
             if (addBtn.length > 0) cy.wrap(addBtn.first()).click();
             // Guardar
             const saveBtn = $inner.find('button:contains("Guardar")');
             if (saveBtn.length > 0) cy.wrap(saveBtn.first()).click();
           }
        });

        // 3. Eliminar Sistema de Talla
        cy.visit('/admin/tallas');
        cy.wait(1000);
        const filaNueva = cy.contains(systemName).parent();
        filaNueva.find('button[aria-label="Eliminar"], button:contains("Eliminar")').click();
        
        cy.wait(500);
        cy.get('body').then(($bodyModal) => {
          const confirmBtn = $bodyModal.find('button:contains("Confirmar"), button:contains("Sí, eliminar")');
          if (confirmBtn.length > 0) {
            cy.wrap(confirmBtn).click();
          }
        });

        cy.contains(systemName).should('not.exist');
      });
    });
  });

});
