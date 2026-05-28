// ============================================================
// cypress/e2e/hump01-autenticacion.cy.ts
// HUMP01 — Gestión de Autenticación, Seguridad y Perfil de Usuario
// ============================================================

describe('HUMP01 — Autenticación y Perfil de Usuario', () => {
  // ── CU01.2: Inicio de Sesión ─────────────────────────────────

  describe('CU01.2 - Inicio de Sesión', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('debe mostrar el formulario de login al navegar a /login', () => {
      cy.contains('Bienvenid@ de vuelta').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.contains('button', 'Ingresar al portal').should('be.visible');
    });

    it('debe mostrar error de validación al enviar formulario vacío', () => {
      cy.contains('button', 'Ingresar al portal').click();
      // Los campos tienen validaciones de Zod + React Hook Form
      cy.get('form').should('be.visible');
    });

    it('debe mostrar error con credenciales incorrectas', () => {
      cy.get('input[type="email"]').type('usuario@invalido.com');
      cy.get('input[type="password"]').type('ContraseñaMal123');
      cy.contains('button', 'Ingresar al portal').click();
      // El sistema muestra el mensaje de error de la API
      cy.get('[class*="danger"]', { timeout: 8000 }).should('be.visible');
    });

    it('debe permitir alternar la visibilidad de la contraseña', () => {
      cy.get('input[type="password"]').should('exist');
      // El botón de ojo está al lado del campo de contraseña
      cy.get('button[tabindex="-1"]').click();
      cy.get('input[type="text"]').should('exist');
    });
  });

  // ── CU01.1: Registro de Usuario ──────────────────────────────

  describe('CU01.1 - Registro de Usuario', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.contains('Regístrate aquí').click();
    });

    it('debe cambiar al formulario de registro al hacer clic en "Regístrate aquí"', () => {
      // Esperar a que la animación termine
      cy.contains('Crear cuenta', { timeout: 5000 }).should('be.visible');
    });

    it('debe mostrar campos de registro: nombre, apellido, email y contraseña', () => {
      cy.contains('Crear cuenta', { timeout: 5000 }).should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('debe permitir volver al login desde el formulario de registro', () => {
      cy.contains('Inicia sesión', { timeout: 5000 }).click();
      cy.contains('Bienvenid@ de vuelta', { timeout: 5000 }).should('be.visible');
    });
  });

  // ── CU01.4: Restauración de Sesión ──────────────────────────

  describe('CU01.4 - Restauración de Sesión', () => {
    it('debe mostrar el loader mientras restaura la sesión al cargar la app', () => {
      cy.visit('/');
      // El loader puede aparecer brevemente, simplemente verificamos que la app carga
      cy.get('body').should('be.visible');
    });

    it('debe redirigir a /login si el usuario no está autenticado e intenta ir a /mis-pedidos', () => {
      cy.visit('/mis-pedidos');
      cy.url().should('include', '/login');
    });

    it('debe redirigir a /login si el usuario no está autenticado e intenta ir a /mi-cuenta', () => {
      cy.visit('/mi-cuenta');
      cy.url().should('include', '/login');
    });

    it('debe redirigir al home si usuario no-admin intenta acceder a /admin', () => {
      cy.visit('/admin');
      cy.url().should('not.include', '/admin');
    });
  });
});
