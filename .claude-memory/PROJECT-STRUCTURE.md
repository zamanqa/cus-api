# Project Structure

> **Last Updated**: February 11, 2026
>
> This file documents the complete project structure. Update this file when adding new folders or significant files.

---

## Complete Directory Structure

```
customer-api-e2e/
├── .claude-memory/                      # Claude AI instruction files
│   ├── claude-instructions.md           # Token optimization & session protocols
│   ├── claude-memory.md                 # Project knowledge base
│   ├── session-starter.md               # Session start/end guide
│   ├── session-history.md               # Recent work tracking (last 5 sessions)
│   └── PROJECT-STRUCTURE.md             # This file - directory structure
│
├── cypress/
│   ├── e2e/
│   │   └── customer-api/                # 14 Customer API test suites
│   │       ├── 01-orders/orders.cy.js
│   │       ├── 02-customers/customers.cy.js
│   │       ├── 03-invoices/invoices.cy.js
│   │       ├── 04-payments/payments.cy.js
│   │       ├── 05-subscriptions/subscriptions.cy.js
│   │       ├── 06-deliveries/deliveries.cy.js
│   │       ├── 07-draft-orders/draft-orders.cy.js
│   │       ├── 08-transactions/transactions.cy.js
│   │       ├── 09-recurring-payments/recurring-payments.cy.js
│   │       ├── 10-product-tracking/product-tracking.cy.js
│   │       ├── 11-product-variants/product-variants.cy.js
│   │       ├── 12-retailers/retailers.cy.js
│   │       ├── 13-vouchers/vouchers.cy.js
│   │       └── 14-css/css.cy.js
│   │
│   ├── support/
│   │   ├── customer_api/                # Customer API commands & config (16 files)
│   │   │   ├── config.js                # API base URL & auth configuration
│   │   │   ├── orderCommands.js         # Order API commands
│   │   │   ├── customerCommands.js      # Customer API commands
│   │   │   ├── invoiceCommands.js       # Invoice API commands
│   │   │   ├── paymentCommands.js       # Payment API commands
│   │   │   ├── subscriptionsCommands.js # Subscription API commands
│   │   │   ├── deliveriesCommands.js    # Delivery API commands
│   │   │   ├── draftOrdersCommands.js   # Draft Order API commands
│   │   │   ├── transactionsCommands.js  # Transaction API commands
│   │   │   ├── recurringPaymentsCommands.js # Recurring Payment API commands
│   │   │   ├── productTrackingCommands.js   # Product Tracking API commands
│   │   │   ├── productCommands.js       # Product Variant API commands
│   │   │   ├── retailerCommands.js      # Retailer API commands
│   │   │   ├── voucherCommands.js       # Voucher API commands
│   │   │   ├── cssCommands.js           # CSS API commands
│   │   │   └── databaseUtil.js          # Database verification utilities
│   │   │
│   │   ├── e2e.js                       # Support file (auto-loaded)
│   │   └── commands.js                  # Command registration (minimal)
│   │
│   └── fixtures/                        # Test data (empty/minimal)
│
├── docs/                                # Technical documentation
│   ├── SETUP.md                         # Project setup guide
│   ├── test-writing-guide.md            # Test patterns and conventions
│   └── CUSTOM-COMMANDS-GUIDE.md         # Custom commands documentation
│
├── .env                                 # Environment variables (NOT in git)
├── .env.example                         # Environment template (in git)
├── .gitignore                           # Git ignore rules
├── .claudecodeignore                    # Claude Code ignore rules
├── cypress.config.js                    # Cypress configuration
├── package.json                         # NPM dependencies & scripts
└── README.md                            # Project README
```

---

## Directory Purposes

| Directory | Purpose |
|-----------|---------|
| `.claude-memory/` | Claude AI instructions and project memory |
| `cypress/e2e/customer-api/` | 14 test suites organized by API domain |
| `cypress/support/customer_api/` | Custom Cypress commands for each API domain + config |
| `cypress/fixtures/` | Test data JSON files |
| `docs/` | Technical documentation |

---

## Naming Conventions

### Test Files
- Pattern: `NN-feature-name/feature-name.cy.js` (numbered directories)
- Examples: `01-orders/orders.cy.js`, `05-subscriptions/subscriptions.cy.js`

### Command Files
- Pattern: `featureCommands.js` (camelCase)
- Examples: `orderCommands.js`, `subscriptionsCommands.js`
- Each file registers Cypress commands via `Cypress.Commands.add()`

### Import Pattern
- Test files import commands directly: `import "../../support/customer_api/orderCommands"`

---

## How to Update This File

When adding new directories or files:

1. Add to the structure tree above
2. Update the "Directory Purposes" table if adding new directories
3. Update "Naming Conventions" if establishing new patterns
4. Commit with message: "docs: update project structure"

---

*Keep this file updated as the project grows.*
