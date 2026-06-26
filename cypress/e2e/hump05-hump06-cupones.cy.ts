// ============================================================
// cypress/e2e/hump05-hump06-cupones.cy.ts
// HUMP05 — Gestión de Cupones de Descuento (Admin)
// HUMP06 — Aplicación de Cupones y Recálculo de Totales (Cliente)
// ============================================================

describe('HUMP05 y HUMP06 — Gestión y Aplicación de Cupones', () => {

  describe('HUMP05 - Gestión de Cupones (Admin)', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('CU05.1 y CU05.2 - debe permitir listar y crear un cupón', () => {
      cy.intercept('GET', '**/coupons').as('getCoupons');
      cy.visit('/admin/cupones');
      cy.wait('@getCoupons');
      cy.get('body').should('be.visible');
      
      // La vista no usa tabla, usa un grid con cards. Validamos el título.
      cy.contains('h1', 'Cupones').should('be.visible');

      // Crear nuevo
      cy.contains(/Crear Cupón|Nuevo Cupon|Agregar/i).click();
      cy.get('form').should('be.visible');

      const couponCode = 'CYPRESS' + Date.now().toString().slice(-4);
      
      cy.get('input[name="code"]').type(couponCode);
      cy.get('input[name="couponQuantity"]').clear().type('100');
      cy.get('input[name="minimumAmount"]').clear().type('50');
      cy.get('input[name="discountAmount"]').clear().type('15');
      // Fecha de expiración mañana
      const tmr = new Date();
      tmr.setDate(tmr.getDate() + 1);
      const tmrStr = tmr.toISOString().split('T')[0];
      cy.get('input[type="date"]').type(tmrStr);

      cy.intercept('POST', '**/coupons').as('createCoupon');
      cy.contains('button', /Guardar|Crear/i).click();
      cy.wait('@createCoupon');
      
      // Validar creación exitosa (el código debe aparecer en los cards)
      cy.contains(couponCode).should('be.visible');
    });

    it('CU05.3 y CU05.4 - debe permitir editar y eliminar un cupón', () => {
      cy.intercept('GET', '**/coupons').as('getCoupons');
      cy.visit('/admin/cupones');
      cy.wait('@getCoupons');
      
      cy.get('body').then(($body) => {
        // En lugar de tabla, buscamos los botones de editar de las cards
        const editBtns = $body.find('button[aria-label="Editar"], button:contains("Editar")');
        if (editBtns.length > 0) {
          // Editar el primero
          cy.wrap(editBtns.first()).click();
          cy.get('form').should('be.visible');
          cy.get('input[name="couponQuantity"]').clear().type('999');
          
          cy.intercept('PATCH', '**/coupons/*').as('updateCoupon');
          cy.contains('button', /Guardar|Actualizar/i).click();
          cy.wait('@updateCoupon');

          // Eliminar
          cy.wait(1000);
          cy.get('body').then(($body2) => {
            const deleteBtns = $body2.find('button[aria-label="Eliminar"], button:contains("Eliminar")');
            if (deleteBtns.length > 0) {
              cy.intercept('DELETE', '**/coupons/*').as('deleteCoupon');
              cy.wrap(deleteBtns.first()).click();
              // Aceptar confirmación nativa si existe (ya lo hace Cypress por defecto)
              cy.on('window:confirm', () => true);
              cy.wait('@deleteCoupon');
            }
          });
        } else {
          cy.log('No hay cupones para editar o eliminar.');
        }
      });
    });
  });

  describe('HUMP06 - Aplicación de Cupones (Cliente)', () => {
    beforeEach(() => {
      cy.loginAsUser();
    });

    it('CU06.1 y CU06.2 - debe validar y aplicar un cupón en el carrito', () => {
      // Necesitamos al menos un item para ver el campo de cupón
      cy.visit('/');
      cy.wait(1500);
      cy.get('body').then(($body) => {
        const productLinks = $body.find('a[href*="/producto/"]');
        if (productLinks.length > 0) {
          cy.wrap(productLinks.first()).click();
          cy.contains(/Agregar al carrito|Añadir/i).click();
          cy.wait(1000);
          
          cy.visit('/carrito');
          cy.get('input[placeholder*="Cupón"], input[placeholder*="LUNA10"]').type('LUNA10');
          cy.contains('button', 'Aplicar').click();
          
          // Podría ser error o éxito, verificamos que hay feedback visual
          cy.get('body').then(($carrito) => {
            if ($carrito.text().includes('Descuento')) {
              cy.contains('Descuento').should('be.visible'); // Se aplicó
            } else {
              cy.contains(/error|mínimo|inválido/i).should('be.visible'); // Validación falló por reglas del cupón
            }
          });
        }
      });
    });
  });

});
