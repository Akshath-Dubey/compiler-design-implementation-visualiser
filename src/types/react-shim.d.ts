// Shim for environments where React type declarations are missing.
// This project uses Vite + React; normally these come from @types/react.
// Keep this minimal so it won't break real typing if @types/react is installed.

declare module "react" {
  // Fallback typing only. Prefer real @types/react when available.
  export type FC<P = {}> = (props: P) => any;
  export type Key = string | number;
  export const StrictMode: any;
  export function createElement(
    type: any,
    props?: any,
    ...children: any[]
  ): any;

  export function useEffect(
    effect: () => void | (() => void),
    deps?: any[],
  ): void;
  export function useState<S>(initial: S): [S, (next: S) => void];
  export type ReactNode = any;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
