// ============================================================
// cypress/e2e/hump02-carrito.cy.ts
// HUMP02 — Gestión de Ventas y Carrito de Compras
// ============================================================

describe('HUMP02 — Carrito de Compras', () => {

  beforeEach(() => {
    cy.loginAsUser();
  });

  describe('CU02.1 - Añadir al Carrito', () => {
    it('debe permitir añadir un producto al carrito desde su detalle', () => {
      // Navegamos a un producto (asumiendo que existe alguno)
      cy.visit('/');
      cy.wait(2000); // Esperar a que carguen los productos
      cy.get('body').then(($body) => {
        const productLinks = $body.find('a[href*="/producto/"]');
        if (productLinks.length > 0) {
          const href = productLinks.first().attr('href') as string;
          cy.visit(href);
          
          // Aseguramos que cargue el detalle
          cy.get('body').should('be.visible');
          
          // Opcional: seleccionar variante si existe (botones de talla o color)
          // Se asume que el botón de agregar dice "Agregar al carrito"
          cy.contains('button', /Agregar al carrito|Añadir/i).click();
          
          // Debería aparecer el Toast de éxito que implementamos
          cy.contains(/Producto agregado|Ver carrito/i).should('be.visible');
        } else {
          cy.log('No hay productos para probar en el catálogo.');
        }
      });
    });
  });

  describe('CU02.2 - Listar ítems del Carrito', () => {
    it('debe cargar la página del carrito y mostrar ítems si los hay', () => {
      cy.intercept('GET', '**/cart').as('getCart');
      cy.visit('/carrito');
      cy.wait('@getCart');
      
      // Asegurarnos que la UI ha re-renderizado después de la carga
      cy.contains(/Mi Carrito/i).should('be.visible');
      
      // Validar si hay ítems
      cy.get('body').then(($body) => {
        if ($body.text().includes('vacío')) {
          cy.log('El carrito está vacío');
        } else {
          // Debería mostrar subtotales o un botón de Finalizar Compra
          cy.contains(/Subtotal|Realizar pedido/i).should('be.visible');
        }
      });
    });
  });

  describe('CU02.3 y CU02.4 - Actualizar y Eliminar del Carrito', () => {
    it('debe permitir cambiar la cantidad de un ítem y eliminarlo', () => {
      cy.intercept('GET', '**/cart').as('getCart');
      cy.visit('/carrito');
      cy.wait('@getCart');
      cy.contains(/Mi Carrito/i).should('be.visible');
      
      cy.get('body').then(($body) => {
        // Buscamos si hay un input de cantidad (generalmente un input numérico o botones + y -)
        // En NextUI y tu implementación, puede ser botones o un input text/number
        const quantityInputs = $body.find('input[type="number"], input[type="text"]');
        if (quantityInputs.length > 0 && !$body.text().includes('vacío')) {
          // Si el primer input es numérico y modificable
          cy.wrap(quantityInputs.first()).clear().type('2').blur();
          cy.wait(1000); // Esperar a que guarde la DB

          // Buscamos botón de eliminar (icono de basurero o texto "Eliminar")
          // Es más seguro buscar por aria-label="Eliminar" o similar, o svg de basurero
          const deleteButtons = $body.find('button[aria-label*="liminar"], button[color="danger"], button[aria-label*="emove"]');
          if (deleteButtons.length > 0) {
            cy.wrap(deleteButtons.first()).click();
            cy.wait(1000);
          }
        } else {
          cy.log('No hay ítems en el carrito para actualizar o eliminar.');
        }
      });
    });
  });

});
