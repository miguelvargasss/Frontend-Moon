// ============================================================
// cypress/support/commands.ts
// Comandos personalizados reutilizables para todas las pruebas.
// IMPORTANTE: El import 'cypress' convierte este archivo en un módulo ES,
// lo cual es requerido para que "declare global" funcione correctamente.
// ============================================================
import 'cypress';

// ── Declaración de tipos ─────────────────────────────────────
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Inicia sesión como usuario cliente via la UI de MoonPhases.
       * @param email    Correo del usuario (default: TEST_USER_EMAIL)
       * @param password Contraseña (default: TEST_USER_PASSWORD)
       */
      loginAsUser(email?: string, password?: string): void;

      /**
       * Inicia sesión como administrador via la UI de MoonPhases.
       */
      loginAsAdmin(): void;

      /**
       * Navega al catálogo (página principal de la tienda).
       */
      goToShop(): void;

      /**
       * Navega al carrito de compras.
       */
      goToCart(): void;

      /**
       * Navega al panel de administración.
       */
      goToAdmin(): void;
    }
  }
}

// ── Implementación de comandos ───────────────────────────────

/**
 * loginAsUser — Navega a /login, rellena el formulario y envía.
 */
Cypress.Commands.add('loginAsUser', (email?: string, password?: string) => {
  const userEmail = email ?? Cypress.env('TEST_USER_EMAIL');
  const userPassword = password ?? Cypress.env('TEST_USER_PASSWORD');

  cy.visit('/login');
  cy.contains('Bienvenid@ de vuelta').should('be.visible');
  cy.get('input[type="email"]').type(userEmail, { delay: 30 });
  cy.get('input[type="password"]').type(userPassword, { delay: 30 });
  cy.contains('button', 'Ingresar al portal').click();
  cy.url().should('eq', Cypress.config('baseUrl') + '/');
});

/**
 * loginAsAdmin — Navega a /login y entra como administrador.
 */
Cypress.Commands.add('loginAsAdmin', () => {
  const adminEmail = Cypress.env('TEST_ADMIN_EMAIL');
  const adminPassword = Cypress.env('TEST_ADMIN_PASSWORD');

  cy.visit('/login');
  cy.contains('Bienvenid@ de vuelta').should('be.visible');
  cy.get('input[type="email"]').type(adminEmail, { delay: 30 });
  cy.get('input[type="password"]').type(adminPassword, { delay: 30 });
  cy.contains('button', 'Ingresar al portal').click();
  cy.url().should('eq', Cypress.config('baseUrl') + '/');
});

/**
 * goToShop — Visita la página principal de la tienda.
 */
Cypress.Commands.add('goToShop', () => {
  cy.visit('/');
});

/**
 * goToCart — Navega a la vista del carrito.
 */
Cypress.Commands.add('goToCart', () => {
  cy.visit('/carrito');
});

/**
 * goToAdmin — Navega al panel de administración.
 */
Cypress.Commands.add('goToAdmin', () => {
  cy.visit('/admin');
  cy.url().should('include', '/admin');
});
