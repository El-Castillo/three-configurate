import type { ThreeElements } from "@react-three/fiber";
import type { ComponentChild } from "preact";

type FiberIntrinsicElements = {
  [TKey in keyof ThreeElements]: Omit<ThreeElements[TKey], "children"> & {
    children?: ComponentChild;
  };
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends FiberIntrinsicElements {}
  }

  namespace preact.JSX {
    interface IntrinsicElements extends FiberIntrinsicElements {}
  }

  namespace React {
    type ReactNode = ComponentChild;

    interface ReactPortal {
      children?: ReactNode;
    }
  }

  namespace React.JSX {
    interface IntrinsicElements extends FiberIntrinsicElements {}
  }

  namespace ReactJSX {
    interface IntrinsicElements extends FiberIntrinsicElements {}
  }
}

declare module "react" {
  export type ReactNode = ComponentChild;
  export interface ReactPortal {
    children?: ReactNode;
  }
}

export {};
