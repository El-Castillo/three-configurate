import { options } from "preact";
import { IS_BROWSER } from "fresh/runtime";

type ShimGlobal = typeof globalThis & {
  __skipNextPreactReconcilerHook?: boolean;
};

type OptionsWithHook = typeof options & {
  __b?: ((vnode: unknown) => void) | undefined;
};

const shimGlobal = globalThis as ShimGlobal;
const shimmedOptions = options as OptionsWithHook;

if (!IS_BROWSER) {
  let currentHook = shimmedOptions.__b;

  Object.defineProperty(shimmedOptions, "__b", {
    configurable: true,
    get: () => currentHook,
    set: (next) => {
      if (shimGlobal.__skipNextPreactReconcilerHook) {
        shimGlobal.__skipNextPreactReconcilerHook = false;
        return;
      }
      currentHook = next;
    },
  });
}
