# Claude Memory - Project Knowledge Base

> **Last Updated**: February 11, 2026
>
> This file contains all important project information, patterns, and conventions that Claude should remember across sessions.

---

## Project Overview

**Project Name**: Customer API E2E Automation
**Framework**: Cypress v13.17.0 (JavaScript)
**Database**: PostgreSQL
**Purpose**: E2E API tests for Circuly Customer API
**Customer API URL**: `https://customers-api-development-680576524870.europe-west3.run.app`
**API Version**: `2025-01`
**Reporter**: cypress-mochawesome-reporter

---

## File Structure

See `.claude-memory/PROJECT-STRUCTURE.md` for complete directory tree.

**Key Directories:**
- `.claude-memory/` - Claude AI instructions and project memory
- `cypress/e2e/customer-api/` - 14 test suites organized by API domain
- `cypress/support/customer_api/` - 16 command/config files for API interactions
- `cypress/fixtures/` - Test data JSON files
- `docs/` - Technical documentation

---

## Test Suites (14 total)

| # | Suite | File | Key Commands |
|---|-------|------|--------------|
| 01 | Orders | `orders.cy.js` | orderCommands, databaseUtil |
| 02 | Customers | `customers.cy.js` | customerCommands |
| 03 | Invoices | `invoices.cy.js` | invoiceCommands, orderCommands, transactionsCommands, databaseUtil |
| 04 | Payments | `payments.cy.js` | paymentCommands |
| 05 | Subscriptions | `subscriptions.cy.js` | subscriptionsCommands, dayjs |
| 06 | Deliveries | `deliveries.cy.js` | deliveriesCommands, config |
| 07 | Draft Orders | `draft-orders.cy.js` | draftOrdersCommands, config |
| 08 | Transactions | `transactions.cy.js` | transactionsCommands, orderCommands, databaseUtil |
| 09 | Recurring Payments | `recurring-payments.cy.js` | recurringPaymentsCommands |
| 10 | Product Tracking | `product-tracking.cy.js` | productTrackingCommands |
| 11 | Product Variants | `product-variants.cy.js` | productCommands |
| 12 | Retailers | `retailers.cy.js` | retailerCommands |
| 13 | Vouchers | `vouchers.cy.js` | voucherCommands, config |
| 14 | CSS | `css.cy.js` | cssCommands |

---

## Architecture Pattern

**Command Import Pattern:**
- Each test file imports its commands directly from `cypress/support/customer_api/`
- Example: `import "../../support/customer_api/orderCommands"`
- Config is shared: `import { customerApiConfig } from './config'`

**API Request Pattern:**
```javascript
Cypress.Commands.add('commandName', () => {
  cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/endpoint`,
    auth: customerApiConfig.auth,
    headers: { 'x-api-version': '2025-01' },
  });
});
```

**Database Verification:**
- Uses `cy.task('queryDb', sqlString)` defined in `cypress.config.js`
- DB connection configured via environment variables (DB_USER, DB_PASSWORD, DB_HOST, etc.)

---

## NPM Scripts

```bash
npm run cy:open              # Interactive mode
npm run cy:run               # Headless mode
npm run cy:run:chrome        # Chrome headless
npm run api:all              # Run all 14 customer API test suites
npm run api:orders           # Run orders tests only
npm run api:customers        # Run customers tests only
npm run api:invoices         # Run invoices tests only
npm run api:payments         # Run payments tests only
npm run api:subscriptions    # Run subscriptions tests only
npm run api:deliveries       # Run deliveries tests only
npm run api:draft-orders     # Run draft orders tests only
npm run api:transactions     # Run transactions tests only
npm run api:recurring-payments # Run recurring payments tests only
npm run api:product-tracking # Run product tracking tests only
npm run api:product-variants # Run product variants tests only
npm run api:retailers        # Run retailers tests only
npm run api:vouchers         # Run vouchers tests only
npm run api:css              # Run CSS tests only
```

---

## Dependencies

**Runtime:** `dayjs`, `pg`
**Dev:** `cypress`, `cypress-iframe`, `cypress-mochawesome-reporter`, `mochawesome`, `mochawesome-merge`, `mochawesome-report-generator`, `prettier`

---

## Environment

**Working Directory**: C:\Users\shahi\Circuly Project\customer-api-e2e
**Branches**: main

---

## User Preferences

1. ✅ **Selector-Action pairing** - Each selector immediately followed by its action
2. ✅ **Comment everything** - Use `// Selector` and `// Action` labels
3. ✅ **Use this memory file** - Reference instead of searching chat history
4. ✅ **Save documentation in .claude-memory/** - Create docs for future reference
5. ✅ **No time estimates** - Never say "this will take X minutes"
6. ✅ **Don't run tests automatically** - Always ask before running

---

## Important Files to Read

At session start, read:
1. `.claude-memory/claude-memory.md` (this file)
2. `.claude-memory/session-history.md`
3. `.claude-memory/PROJECT-STRUCTURE.md`

---

*This is a living document. Update as project evolves.*
