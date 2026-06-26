// ============================================================
// cypress/support/e2e.ts
// Archivo de soporte global — se ejecuta antes de cada spec.
// Aquí se importan el plugin de mochawesome y los comandos custom.
// ============================================================
import 'cypress-mochawesome-reporter/register';
import './commands';
