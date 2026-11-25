/* Hand-written (not generated): keeps the `sandbox` module in the sandbox.
 *
 * src/sandbox/runtime.ts (written by scripts/generate.sh) exports SandboxBaseAPI as the BaseAPI
 * of every sandbox API class. The check runs before any request, the login included: a sandbox
 * call throws SandboxOnlyError unless the environment is 'sandbox' and the base URL's host is the
 * sandbox API host, or a custom basePath outside Astrada is marked with basePathIsSandbox. No other
 * Astrada host (production, staging, any *.astrada.co) passes, marked or not.
 */
import { BaseAPI, Configuration, sandboxProblem, type InitOverrideFunction, type RequestOpts } from './runtime.js';
import { SandboxOnlyError } from './errors.js';


/**
 * The timeout of the sandbox-only deletes, unless the configuration's is longer or off. They
 * answer only when everything under the deleted resource is gone, which can take minutes.
 */
export const SANDBOX_DELETE_TIMEOUT_MS = 300_000;

/** Throws SandboxOnlyError unless the configuration points at the sandbox (see sandboxProblem). */
export function assertSandbox(configuration: Configuration): void {
    const problem = sandboxProblem(configuration);
    if (problem !== null) {
        throw new SandboxOnlyError(problem);
    }
}

function guarded(configuration: Configuration): Configuration {
    // The generated methods ask for the token before they call request(), so the check sits in
    // front of the token as well.
    return new Proxy(configuration, {
        get(target, property) {
            if (property === 'accessToken') {
                return (name?: string, scopes?: string[]) => {
                    assertSandbox(target);
                    return target.accessToken(name, scopes);
                };
            }
            return Reflect.get(target, property, target);
        },
    });
}

/** The BaseAPI of the sandbox module's API classes. */
export class SandboxBaseAPI extends BaseAPI {
    constructor(configuration: Configuration) {
        super(guarded(configuration));
    }

    protected override async request(context: RequestOpts, initOverrides?: RequestInit | InitOverrideFunction): Promise<Response> {
        assertSandbox(this.configuration);
        if (context.method === 'DELETE') {
            // The sandbox deletes cascade and answer when done. Sending one again while the first
            // still runs is not safe, so they are never retried, and they wait longer.
            const configured = this.configuration.timeoutMs;
            context = {
                ...context,
                maxRetries: 0,
                timeoutMs: configured > 0 ? Math.max(configured, SANDBOX_DELETE_TIMEOUT_MS) : configured,
            };
        }
        return super.request(context, initOverrides);
    }
}
