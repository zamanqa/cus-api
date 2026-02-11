# Test Writing Guide

## Page Object Pattern

Always use selector-action pairing:

```javascript
class PageName {
  // Selector
  get buttonName() {
    return cy.get('selector');
  }

  // Action
  clickButton() {
    this.buttonName.click();
    cy.log('✓ Clicked button');
  }
}
```

## Test Structure

Use single `it()` block with steps:

```javascript
describe('Feature Name', () => {
  it('should complete test flow', () => {
    cy.log('--- Step 1: Description ---');
    // test code

    cy.log('--- Step 2: Description ---');
    // test code
  });
});
```

## Wait Strategies

- `cy.wait(2000)` - after clicks
- `cy.wait(3000)` - after navigation
- `cy.wait(5000)` - after page loads

## Logging

- `cy.log('✓ Verified: ...')` - success
- `cy.log('⚠ Warning: ...')` - optional/missing

## Iframe Handling

For payment iframes:

```javascript
cy.get('iframe[title*="..."]')
  .then(($iframe) => {
    const $body = $iframe.contents().find('body');
    cy.wrap($body).find('input').type('value');
  });
```
