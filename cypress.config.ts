import { defineConfig } from 'cypress';
import { createRequire } from 'node:module';

// createRequire permite usar require() desde un módulo ESM
// (necesario porque el proyecto tiene "type": "module" en package.json)
const require = createRequire(import.meta.url);

export default defineConfig({
  // ─── Pruebas E2E ───────────────────────────────────────────
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    // Carpeta donde se almacenan videos de las pruebas
    videosFolder: 'cypress/reports/videos',
    // Carpeta donde se almacenan screenshots en caso de fallo
    screenshotsFolder: 'cypress/reports/screenshots',
    // Configuración del reporter Mochawesome
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports/html',
      charts: true,
      reportPageTitle: 'MoonPhases — Reporte de Pruebas E2E',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
    },
    // Tiempo de espera predeterminado en milisegundos
    defaultCommandTimeout: 10000,
    // Viewport para las pruebas (resolución desktop)
    viewportWidth: 1280,
    viewportHeight: 720,
    experimentalModifyObstructiveThirdPartyCode: false,
    setupNodeEvents(on, config) {
      // Plugin de Mochawesome: necesario para captura de pantallas y reporte
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },

  // ─── Variables de entorno de prueba ────────────────────────
  env: {
    // URL base del API backend
    API_URL: 'http://localhost:3000',
    // Credenciales de usuario cliente de prueba (ajustar a las tuyas)
    TEST_USER_EMAIL: 'testcliente@moonphases.com',
    TEST_USER_PASSWORD: 'Test1234!',
    // Credenciales de administrador de prueba
    TEST_ADMIN_EMAIL: 'testadmin@moonphases.com',
    TEST_ADMIN_PASSWORD: 'Admin1234!',
  },
});
