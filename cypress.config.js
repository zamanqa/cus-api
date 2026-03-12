const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  defaultCommandTimeout: 20000,
  chromeWebSecurity: false,
  projectId: "k2bd63",
  reporter: 'cypress-mochawesome-reporter',

  retries: {
    runMode: 1,
  },

  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',

    // Timeouts
    requestTimeout: 15000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,

    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,

    // Media
    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Expose API config as Cypress.env() variables
    env: {
      apiBaseUrl: process.env.API_BASE_URL,
      apiVersion: process.env.API_VERSION,
      apiAuthUsername: process.env.API_AUTH_USERNAME,
      apiAuthPassword: process.env.API_AUTH_PASSWORD,
      companyId: process.env.COMPANY_ID,
    },

    setupNodeEvents(on, config) {
      // Mochawesome reporter plugin
      require('cypress-mochawesome-reporter/plugin')(on);

      // Database query task - supports both string and parameterized { text, values }
      on('task', {
        async queryDb(query) {
          const { Client } = require('pg');
          const pgConfig = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            ssl: false,
            port: parseInt(process.env.DB_PORT, 10),
          };
          const client = new Client(pgConfig);
          await client.connect();
          const res = typeof query === 'string'
            ? await client.query(query)
            : await client.query(query.text, query.values);
          await client.end();
          return res.rows;
        },
      });

      return config;
    },
  },
});
