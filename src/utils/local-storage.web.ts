// Browsers ship `localStorage`. Importing the expo-sqlite polyfill here would pull
// its WebAssembly worker into the web bundle for nothing.
export {};
