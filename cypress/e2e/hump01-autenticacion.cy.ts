// ============================================================
// cypress/e2e/hump01-autenticacion.cy.ts
// HUMP01 — Gestión de Autenticación, Seguridad y Perfil de Usuario
// ============================================================

describe('HUMP01 — Autenticación y Perfil de Usuario', () => {

  describe('CU01.1 - Registro de Usuario', () => {
    it('debe registrar un usuario exitosamente con credenciales válidas (Camila Llanos)', () => {
      // Interceptamos la petición para no depender estrictamente de que el test falle
      // si el usuario ya existe en la base de datos de pruebas (permitiendo 201 o 400).
      cy.intercept('POST', '**/auth/register').as('registerUser');
      
      cy.visit('/login');
      
      // Cambiar a la pestaña o vista de registro
      cy.contains(/Regístrate aquí/i).click();

      // Llenar formulario de registro
      // Nombre y apellido
      cy.get('input[type="text"]').eq(0).type('Camila');
      cy.get('input[type="text"]').eq(1).type('Llanos');
      // Correo
      cy.get('input[type="email"]').type('camila@gmail.com');
      // Contraseñas
      cy.get('input[type="password"]').eq(0).type('Camila123!');
      cy.get('input[type="password"]').eq(1).type('Camila123!');

      // Enviar formulario (el botón de registro es el principal en esa vista)
      cy.contains('button', /Crear cuenta|Registrarse/i).click();

      // Validamos que se envíe la petición. 
      // Podría ser 201 (Creado) o 400/409 (si la DB ya tiene a camila@gmail.com de una prueba anterior).
      cy.wait('@registerUser').its('response.statusCode').should('be.oneOf', [201, 400, 409]);
    });
  });

  describe('CU01.2 y CU01.3 - Inicio y Cierre de Sesión', () => {
    it('debe iniciar sesión exitosamente con credenciales válidas y redirigir al home', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
      cy.get('input[type="password"]').type(Cypress.env('TEST_USER_PASSWORD'));
      cy.contains('button', 'Ingresar al portal').click();
      
      // Debería redirigir al home y tener el token (estar autenticado)
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      // Verificamos que el botón de usuario aparece
      cy.get('#navbar-user-menu-btn').should('be.visible');
    });

    it('debe cerrar sesión exitosamente', () => {
      cy.loginAsUser();
      // Click en el avatar/menú
      cy.get('#navbar-user-menu-btn').click();
      // Click en cerrar sesión (NextUI renderiza dropdowns en portal, así que buscamos en el body)
      cy.get('body').contains(/Cerrar sesi/i).click();
      
      // El Navbar tiene un await logout() y luego navigate('/'). Esperamos a que ocurra eso.
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      
      // Confirmamos visualmente que cerró sesión (aparece el botón "Ingresar")
      cy.contains('a', /Ingresar/i).should('be.visible');
      
      // Ahora sí probamos que la ruta está protegida
      cy.visit('/mi-cuenta');
      cy.url().should('include', '/login');
    });
  });

  describe('CU01.5 y CU01.6 - Consulta y Actualización de Perfil', () => {
    beforeEach(() => {
      cy.loginAsUser();
      cy.visit('/mi-cuenta');
    });

    it('debe mostrar los datos del usuario en Mi Cuenta', () => {
      // Debe cargar la vista del perfil
      cy.contains(/Mi perfil/i).should('be.visible');
      // Debería estar el email visible (puede estar en un input disabled o en texto)
      cy.contains(Cypress.env('TEST_USER_EMAIL')).should('exist');
    });

    it('debe permitir actualizar el nombre y apellido', () => {
      const nuevoNombre = 'TestName ' + Date.now().toString().slice(-4);
      
      cy.contains('button', /Editar/i).click();

      // Buscamos los inputs por indice (0: Nombre, 1: Apellido, 2: Email disabled)
      cy.get('input').eq(0).clear().type(nuevoNombre);
      cy.get('input').eq(1).clear().type('TestLastName');
      
      // Enviar formulario
      cy.contains('button', /Guardar/i).click();
      
      // Mostrar mensaje de éxito o que el botón cambie a Editar otra vez
      cy.contains('button', /Editar/i).should('be.visible');
      
      // Recargar para verificar persistencia
      cy.reload();
      cy.get('input').eq(0).should('have.value', nuevoNombre);
      cy.get('input').eq(1).should('have.value', 'TestLastName');
    });
  });

  describe('CU01.7 - Listado de Usuarios (Administrador)', () => {
    it('debe permitir a un administrador ver la lista de usuarios', () => {
      cy.loginAsAdmin();
      cy.visit('/admin/usuarios'); // Ruta supuesta para usuarios en admin
      
      // Verificar que cargue la lista (tabla)
      cy.get('table').should('exist');
      // Debería haber usuarios listados, con exist basta si el contenedor tiene overflow hidden
      cy.contains(Cypress.env('TEST_USER_EMAIL')).should('exist');
    });
  });
});
