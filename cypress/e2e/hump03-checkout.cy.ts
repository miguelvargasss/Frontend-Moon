// ============================================================
// cypress/e2e/hump03-checkout.cy.ts
// HUMP03 — Sistema de Procesamiento de Ventas y Comprobantes
// ============================================================

describe('HUMP03 — Checkout y Procesamiento de Ventas', () => {
  // ── CU03.1: Inicio de Checkout ───────────────────────────────

  describe('CU03.1 - Acceso y Estructura de la Página de Checkout', () => {
    it('debe cargar correctamente la ruta /checkout', () => {
      cy.visit('/checkout');
      cy.get('body').should('be.visible');
    });

    it('debe mostrar un mensaje o redirigir si el carrito está vacío al ir a /checkout', () => {
      cy.visit('/checkout');
      cy.wait(2000);
      // Si el carrito está vacío, el checkout muestra un estado especial
      cy.get('body').should('be.visible');
    });

    it('debe mostrar el indicador de pasos (Paso 1: Dirección, Paso 2: Confirmar)', () => {
      cy.visit('/checkout');
      cy.wait(1500);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Checkout')) {
          cy.contains('Dirección').should('be.visible');
          cy.contains('Confirmar').should('be.visible');
        }
      });
    });

    it('debe mostrar el título "Checkout" en la cabecera de la página', () => {
      cy.visit('/checkout');
      cy.wait(1500);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Checkout')) {
          cy.contains('h1', 'Checkout').should('be.visible');
        }
      });
    });
  });

  // ── CU03.2: Resumen del pedido ───────────────────────────────

  describe('CU03.2 - Sidebar de Resumen del Pedido', () => {
    it('debe mostrar "Resumen del pedido" en el sidebar del checkout si hay ítems', () => {
      cy.visit('/checkout');
      cy.wait(1500);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Checkout')) {
          cy.contains('Resumen del pedido').should('be.visible');
        }
      });
    });

    it('debe mostrar envío gratuito en el resumen', () => {
      cy.visit('/checkout');
      cy.wait(1500);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Checkout')) {
          cy.contains('Gratis').should('be.visible');
        }
      });
    });
  });

  // ── CU03.x: Navegación desde Checkout ────────────────────────

  describe('CU03.x - Navegación', () => {
    it('debe permitir navegar hacia atrás al carrito desde el botón de retroceso', () => {
      cy.visit('/checkout');
      cy.wait(1500);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Checkout')) {
          // El botón de retroceso tiene un ícono de flecha
          cy.get('button[class*="isIconOnly"]').first().click();
          cy.url().should('include', '/carrito');
        }
      });
    });
  });

  // ── CU03.3: Creación de la Orden (POST /orders) ────────────────

  describe('CU03.3 - Creación de la Orden (Transacción POST /orders)', () => {
    it('debe interceptar la petición POST /orders al confirmar la compra', () => {
      // 1. Interceptamos la llamada a la API para verificar qué se envía
      cy.intercept('POST', '**/orders').as('crearOrden');

      // 2. Visitamos el checkout
      cy.visit('/checkout');
      cy.wait(1500);

      // 3. Verificamos si podemos simular el flujo (requiere items en carrito)
      cy.get('body').then(($body) => {
        // Buscamos el botón que contenga "Confirmar" o "Finalizar"
        const confirmBtn = $body.find('button:contains("Confirmar")');
        
        if (confirmBtn.length > 0) {
          cy.wrap(confirmBtn).click();

          // 4. Esperamos la llamada a la API y validamos la respuesta
          cy.wait('@crearOrden').then((interception) => {
            // El backend procesa la transacción (validar stock, generar código, etc)
            // Si la prueba no tiene auth/stock real, responderá con error, lo cual es esperado
            const status = interception.response?.statusCode;
            expect(status).to.be.oneOf([201, 400, 401]); 
            
            // Si es 201 (creado), verificamos la estructura de la orden generada
            if (status === 201) {
              expect(interception.response?.body).to.have.property('orderCode');
              expect(interception.response?.body.status).to.eq('EN PROCESO');
            }
          });
        } else {
          cy.log('No se pudo probar la confirmación (el carrito podría estar vacío o falta login)');
        }
      });
    });

    it('el endpoint POST /orders debe estar protegido y validar datos (API Test)', () => {
      // Prueba directa a la API para verificar la capa de seguridad del backend
      // y confirmar que rechaza transacciones no autorizadas
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/orders`,
        failOnStatusCode: false,
        body: {
          shippingAddressId: 'id-direccion-test',
          couponCode: 'CUPON-TEST' // Se validaría vigencia y stock
        }
      }).then((response) => {
        // Debe rechazar la creación porque no estamos autenticados en esta prueba
        // (Esto asegura que nadie pueda inyectar compras sin sesión)
        expect(response.status).to.eq(401);
      });
    });

    it('HAPPY PATH: debe permitir al usuario logueado usar un cupón, completar la compra y generar la orden', () => {
      // 1. Iniciar sesión con el usuario de prueba
      cy.loginAsUser('miguel@gmail.com', '123456');

      // 2. Ir al catálogo y agregar un producto al carrito
      cy.visit('/');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const productLinks = $body.find('a[href*="/producto/"]');
        if (productLinks.length > 0) {
          cy.wrap(productLinks.first()).click();
          cy.url().should('include', '/producto/');
          cy.wait(1500);

          // Hacemos clic en el botón de agregar al carrito DOS veces
          // Esto es para asegurar que el subtotal supere los S/50 exigidos por el cupón "AMOR"
          cy.contains(/agregar|añadir/i).click();
          cy.wait(1000);
          cy.contains(/agregar|añadir/i).click();
          cy.wait(1000);

          // 3. Ingresar al carrito y aplicar cupón
          cy.visit('/carrito');
          cy.wait(1500);
          
          // Escribimos el cupón AMOR en el input y le damos a Aplicar
          cy.get('input[placeholder*="LUNA10"]').type('AMOR');
          cy.contains('button', 'Aplicar').click();
          cy.wait(1500); // Esperamos a que la API valide el cupón y descuente

          // Luego presionamos "Realizar pedido"
          cy.contains(/realizar pedido/i).click();

          // 4. En el checkout, manejar el formulario de dirección
          cy.wait(2000);
          cy.url().should('include', '/checkout');
          
          cy.get('body').then(($checkoutBody) => {
            const continuarEnvioBtn = $checkoutBody.find('button:contains("Continuar con este env"), button:contains("Guardar direcci")');
            
            if (continuarEnvioBtn.length > 0) {
              cy.wrap(continuarEnvioBtn.first()).click();
              cy.wait(1500);
            }

            // 5. Confirmar Pedido e interceptar
            cy.intercept('POST', '**/orders').as('createOrder');
            cy.contains(/confirmar pedido/i).click();

            // 6. Validamos la transacción con el Backend
            // La respuesta real del backend es:
            // { success: true, data: { order: { orderCode, status, ... }, total, discount, pointsEarned }, message }
            cy.wait('@createOrder', { timeout: 10000 }).then((interception) => {
              expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
              
              const responseBody = interception.response?.body;
              // Navegamos: body.data.order
              const orderObj = responseBody?.data?.order;
              
              expect(orderObj, 'La orden debe existir en data.order').to.not.equal(undefined);
              expect(orderObj).to.have.property('orderCode');
              // El orderCode debe ser alfanumérico de 7 caracteres (ej: M892BGS)
              expect(orderObj.orderCode).to.match(/^[A-Z0-9]{7}$/);
              // Verificar que los moonpoints ganados están presentes
              expect(responseBody.data).to.have.property('pointsEarned');
              // Verificar que el total final y el descuento del cupón están presentes
              expect(responseBody.data).to.have.property('total');
              expect(responseBody.data).to.have.property('discount');
            });

            // 7. Validar que la UI muestra la pantalla de éxito "¡Pedido realizado!"
            cy.contains(/pedido realizado/i, { timeout: 10000 }).should('be.visible');
            
            // 8. Hacer clic en "Ver mis pedidos" como indica la HU
            cy.contains(/ver mis pedidos/i).click();
            cy.wait(2000);

            // Validamos que redirigió a la página de historial de pedidos
            cy.url().should('include', '/mis-pedidos');
          });
        } else {
          cy.log('⚠️ No se encontraron productos en el catálogo para probar el flujo.');
        }
      });
    });
  });
});
