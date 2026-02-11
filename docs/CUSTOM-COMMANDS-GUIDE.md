# Custom Commands Guide

## Available Commands

### Database Commands

```javascript
// Execute a database query
cy.queryDatabase('SELECT * FROM table WHERE id = 1');
```

### API Commands

```javascript
// Make API request
cy.apiRequest('GET', '/api/endpoint');
cy.apiRequest('POST', '/api/endpoint', { data: 'value' });

// Check API health
cy.checkApiHealth('https://api.example.com');
```

## Adding New Commands

1. Create file in `cypress/support/commands/`
2. Add command:
   ```javascript
   Cypress.Commands.add('commandName', (params) => {
     // implementation
   });
   ```
3. Import in `cypress/support/commands.js`:
   ```javascript
   import './commands/your-commands';
   ```

## Best Practices

- Keep commands focused on single responsibility
- Add logging with `cy.log()`
- Handle errors gracefully
- Document parameters and return values
