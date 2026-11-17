import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Node 25+ adds its own global localStorage, which hides the test browser's (jsdom) storage.
    // Turning it off makes tests behave the same on every Node version.
    execArgv: ['--no-experimental-webstorage'],
  },
});
