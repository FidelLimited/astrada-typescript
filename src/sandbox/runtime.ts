/* Written by scripts/generate.sh: the sandbox module shares the main runtime (src/runtime.ts), with
 * a BaseAPI that throws SandboxOnlyError before any request outside the sandbox. */
export * from '../runtime.js';
export { SandboxBaseAPI as BaseAPI } from '../sandbox-guard.js';
