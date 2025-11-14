import { IS_BROWSER } from "fresh/runtime";

type CustomElementShimState = typeof globalThis & {
  customElements: CustomElementRegistry;
  __skipNextPreactReconcilerHook?: boolean;
};

if (!("customElements" in globalThis)) {
  type CustomElementConstructor = new (...args: unknown[]) => HTMLElement;
  type Constructor = CustomElementConstructor & {
    observedAttributes?: string[];
    prototype?: Record<string, unknown>;
  };

  const registry = new Map<string, Constructor>();

  const shimState = globalThis as CustomElementShimState;

  const define = (
    name: string,
    ctor: Constructor,
    _options?: ElementDefinitionOptions,
  ) => {
    if (registry.has(name)) {
      throw new Error(`Custom element '${name}' already defined`);
    }
    registry.set(name, ctor);
    if (!IS_BROWSER && name === "preact-reconciler") {
      shimState.__skipNextPreactReconcilerHook = true;
    }
  };

  const get = (name: string) => registry.get(name);

  const whenDefined = (name: string) => {
    return new Promise<Constructor>((resolve) => {
      if (registry.has(name)) {
        resolve(registry.get(name)!);
        return;
      }
      const interval = setInterval(() => {
        if (registry.has(name)) {
          clearInterval(interval);
          resolve(registry.get(name)!);
        }
      }, 0);
    });
  };

  const getName = (
    _constructor: CustomElementConstructor,
  ): string | null => null;

  // Minimal customElements interface
  shimState.customElements = {
    define,
    get,
    whenDefined,
    upgrade(_root: Node) {
      /* no-op on server */
    },
    getName,
  };
}
