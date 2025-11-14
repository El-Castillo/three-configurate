// Minimal DOM shim to allow DOM-dependent packages to be imported during SSR.
type MinimalElementInstance = Record<string, unknown>;
type MinimalElementConstructor = new (
  ...args: unknown[]
) => MinimalElementInstance;

const globalScope = globalThis as typeof globalThis & {
  HTMLElement?: MinimalElementConstructor;
  HTMLCanvasElement?: MinimalElementConstructor;
};

if (!globalScope.HTMLElement) {
  const HTMLElementPolyfill: MinimalElementConstructor = class {
    [key: string]: unknown;
  };
  globalScope.HTMLElement = HTMLElementPolyfill;
}

if (!globalScope.HTMLCanvasElement) {
  const HTMLCanvasElementPolyfill: MinimalElementConstructor = class
    extends (globalScope.HTMLElement as MinimalElementConstructor) {
    [key: string]: unknown;
  };
  globalScope.HTMLCanvasElement = HTMLCanvasElementPolyfill;
}
