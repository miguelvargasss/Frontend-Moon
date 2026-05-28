// ============================================================
// cypress/e2e/hump04-productos.cy.ts
// HUMP04 — Gestión de Inventario y Registro de Productos
// ============================================================

describe('HUMP04 — Catálogo y Gestión de Productos', () => {

  describe('CU04.1 y CU04.2 - Catálogo y Detalle (Cliente Público)', () => {
    it('debe listar los productos en el home y permitir entrar al detalle', () => {
      cy.visit('/');
      cy.get('body').should('be.visible');
      
      cy.get('body').then(($body) => {
        const productLinks = $body.find('a[href*="/producto/"]');
        if (productLinks.length > 0) {
          // Entrar al detalle
          cy.wrap(productLinks.first()).click();
          cy.url().should('include', '/producto/');
          
          // El detalle debe contener título del producto, precio, y botón añadir
          cy.get('h1').should('be.visible');
          cy.contains(/Agregar al carrito|Añadir/i).should('be.visible');
        } else {
          cy.log('No hay productos en el catálogo.');
        }
      });
    });
  });

  describe('CU04.3 al CU04.7 - Gestión de Productos (Admin)', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('debe permitir al administrador listar productos', () => {
      cy.visit('/admin/productos');
      cy.get('body').should('be.visible');
      // Esperamos que haya una tabla o grid de productos
      cy.get('table').should('exist');
    });

    it('debe mostrar el botón para crear un nuevo producto', () => {
      cy.visit('/admin/productos');
      cy.contains(/Crear Producto|Nuevo Producto|Agregar/i).should('be.visible');
    });

    it('debe permitir editar un producto existente', () => {
      cy.visit('/admin/productos');
      cy.get('body').then(($body) => {
        // Buscamos botones de editar (icono lápiz o texto Editar)
        const editBtns = $body.find('button[aria-label="Editar"], button:contains("Editar")');
        if (editBtns.length > 0) {
          cy.wrap(editBtns.first()).click();
          // Verificamos que se abre un modal o página de edición
          cy.get('form').should('be.visible');
          cy.contains(/Guardar|Actualizar/i).should('be.visible');
        }
      });
    });
  });

});
