# Project Setup Guide

## Prerequisites

- Node.js v16+
- npm or yarn
- Chrome browser

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment template:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database credentials

## Running Tests

### Interactive Mode
```bash
npm run cy:open
```

### Headless Mode
```bash
npm run cy:run
```

## Project Structure

See `.claude-memory/PROJECT-STRUCTURE.md` for complete directory structure.

## Configuration

- `cypress.config.js` - Main Cypress configuration
- `.env` - Environment variables (database, URLs)

## Database Setup

The project uses PostgreSQL for data verification. Configure in `.env`:

```
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=your_host
DB_NAME=postgres
DB_PORT=5432
```
