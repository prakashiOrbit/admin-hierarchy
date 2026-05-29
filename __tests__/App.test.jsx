/**
 * Smoke test — verifies App can be imported without throwing.
 * Full integration rendering requires a device/emulator; see Tier 4 tests
 * for component-level coverage.
 */

import App from '../App';

test('App module imports without errors', () => {
  expect(App).toBeDefined();
  expect(typeof App).toBe('function');
});
