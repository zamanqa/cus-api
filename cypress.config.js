const { defineConfig } = require('cypress');

module.exports = defineConfig({
  defaultCommandTimeout: 20000,
  chromeWebSecurity: false,
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

    setupNodeEvents(on, config) {
      // Mochawesome reporter plugin
      require('cypress-mochawesome-reporter/plugin')(on);

      // Database query task
      on('task', {
        async queryDb(queryString) {
          const { Client } = require('pg');
          const pgConfig = {
            user: 'ZdFFUsWiIuILvub',
            password: 'rxoz32pYOeqYEAMVG263',
            host: 'circuly-development-v12.csmudpdd3zlm.eu-central-1.rds.amazonaws.com',
            database: 'postgres',
            ssl: false,
            port: 5432,
          };
          const client = new Client(pgConfig);
          await client.connect();
          const res = await client.query(queryString);
          await client.end();
          return res.rows;
        },
      });

      return config;
    },
  },
});
