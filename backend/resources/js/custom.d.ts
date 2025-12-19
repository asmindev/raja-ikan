import { route as routeFn } from 'ziggy-js';

// Allow importing CSS and other style files in TypeScript without errors.
// This file is picked up by the project's tsconfig (includes **/*.d.ts).

declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';
declare module '*.styl';

// CSS modules (optional typed shape)
declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}

// Vite / ImportMeta helpers (minimal)
interface ImportMetaEnv {
    readonly VITE_APP_NAME?: string;
    // add other VITE_ prefixed env vars here as needed
    readonly [key: string]: string | undefined;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
    // minimal typing for Vite's import.meta.glob
    // Use `unknown` instead of `any` to avoid eslint no-explicit-any warnings.
    glob(pattern: string): Record<string, () => Promise<unknown>>;
    globEager?(pattern: string): Record<string, unknown>;
}

declare global {
    var route: typeof routeFn;
}
