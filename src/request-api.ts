/* Hand-written (not generated): call an endpoint the SDK has no method for, with the same login,
 * environment, timeout, typed errors and retry rules as the generated APIs (retries only for GET,
 * HEAD, OPTIONS, PUT and DELETE; a POST or PATCH is sent twice only after a 401, with a new token,
 * as every call is). The sandbox-only operations (src/sandbox-routes.ts, generated from the sandbox
 * API definition) and any /simulate path keep their sandbox check, and the sandbox-only deletes are
 * never retried and wait as long as the sandbox module's.
 */
import { BaseAPI, type HTTPHeaders, type HTTPMethod, type HTTPQuery, type InitOverrideFunction } from './runtime.js';
import { ResponseError } from './errors.js';
import { assertSandbox, SANDBOX_DELETE_TIMEOUT_MS } from './sandbox-guard.js';
import { SANDBOX_ROUTES } from './sandbox-routes.js';

export interface SendOptions {
    /** Query parameters. A list (array or Set) is sent as one pair per item; null and undefined are left out. */
    query?: HTTPQuery;
    /** A JSON body. */
    body?: unknown;
    /** Extra headers, compared without case. Authorization, and Content-Type with a body, are the SDK's. */
    headers?: HTTPHeaders;
}

/**
 * The one path rule of the generic request method, the same in the three SDKs: the path must start
 * with "/"; a "?", "#", "\", space or control character in it, a broken percent escape, or an encoded "/",
 * "\", ".", "?", "#" or control character is refused (so an id containing an encoded slash cannot be sent this way); "." and ".." segments
 * are resolved and empty segments (repeated or trailing slashes) dropped. The result is the path
 * that is sent, and every check runs on that same path, decoded and in lower case.
 */
export function normaliseRequestPath(path: string): { sent: string; decoded: string } {
    const refuse = (why: string) => new RangeError(`send: ${why} (got ${JSON.stringify(path)})`);
    if (typeof path !== 'string' || !path.startsWith('/')) throw refuse('the path must start with "/"');
    // Spaces and control characters: fetch's URL parser drops tab, CR, LF and trailing spaces, so the
    // path sent would differ from the one checked. Send a space as %20.
    if (/[\u0000-\u0020\u007f]/.test(path)) throw refuse('a space or control character (tab, CR, LF and the like) is not allowed in the path; send a space as %20');
    if (/[?#\\]/.test(path)) throw refuse('a "?", "#" or "\\" is not allowed in the path; pass query parameters in options.query');
    if (/%(?![0-9a-f]{2})/i.test(path)) throw refuse('the path has a broken percent escape');
    if (/%(2f|5c|2e|3f|23|[01][0-9a-f]|7f)/i.test(path)) throw refuse('an encoded "/", "\\", ".", "?", "#" or control character is not allowed in the path');
    const segments: string[] = [];
    for (const segment of path.split('/')) {
        if (segment === '' || segment === '.') continue;
        if (segment === '..') {
            segments.pop();
            continue;
        }
        segments.push(segment);
    }
    const sent = '/' + segments.join('/');
    let decoded: string;
    try {
        decoded = decodeURIComponent(sent);
    } catch {
        throw refuse('the path has a broken percent escape');
    }
    return { sent, decoded: decoded.toLowerCase() };
}

export class RequestApi extends BaseAPI {
    /**
     * Sends `method path` and returns the parsed JSON body (undefined for an empty one). Any status
     * outside 200 to 299 throws the same ResponseError subclasses as the generated methods; a 2xx
     * whose body is not JSON throws a ResponseError whose `response` can still be read (the call did
     * succeed). The path follows {@link normaliseRequestPath}.
     *
     * @param path the path after the base URL, starting with `/`, such as `/subaccounts`
     */
    async send<T = unknown>(method: HTTPMethod, path: string, options: SendOptions = {}, initOverrides?: RequestInit | InitOverrideFunction): Promise<T | undefined> {
        const { sent, decoded } = normaliseRequestPath(path);
        const upper = String(method).toUpperCase() as HTTPMethod;
        const route = SANDBOX_ROUTES.find((r) => r.method === upper && r.pattern.test(decoded));
        const sandboxDelete = route !== undefined && upper === 'DELETE';
        if (decoded === '/simulate' || decoded.startsWith('/simulate/') || route !== undefined) {
            assertSandbox(this.configuration);
        }
        // The checks above used `method`, so the overrides may not change it: a different method is
        // refused, and `method` is always taken out of them (object or function form).
        if (initOverrides && typeof initOverrides === 'object' && 'method' in initOverrides && initOverrides.method !== undefined
            && String(initOverrides.method).toUpperCase() !== upper) {
            throw new RangeError('send: give the method as the first argument, not in initOverrides');
        }
        let overrides: RequestInit | InitOverrideFunction | undefined;
        if (typeof initOverrides === 'function') {
            overrides = async (context) => {
                const { method: _ignored, ...rest } = (await initOverrides(context)) ?? {};
                return rest;
            };
        } else if (initOverrides) {
            const { method: _ignored, ...rest } = initOverrides;
            overrides = rest;
        }
        const headers: HTTPHeaders = {};
        const own = new Set(['authorization', ...(options.body !== undefined ? ['content-type'] : [])]);
        const callerAccept = Object.keys(options.headers ?? {}).some((name) => name.toLowerCase() === 'accept');
        if (!callerAccept) headers['Accept'] = 'application/json';
        for (const [name, value] of Object.entries(options.headers ?? {})) {
            if (!own.has(name.toLowerCase())) headers[name] = value;
        }
        if (options.body !== undefined) {
            headers['Content-Type'] = 'application/json';
        }
        if (this.configuration && this.configuration.accessToken) {
            headers['Authorization'] = await this.configuration.accessToken('main-auth', []);
        }
        // The query rule shared by the three SDKs: a list (array or Set) is sent as one pair per item
        // (`status=a&status=b`), and null or undefined values and items are left out.
        const query: HTTPQuery = {};
        for (const [key, value] of Object.entries(options.query ?? {})) {
            if (value === undefined || value === null) continue;
            if (Array.isArray(value) || value instanceof Set) {
                const items = Array.from(value as Iterable<unknown>).filter((item) => item !== undefined && item !== null);
                if (items.length > 0) query[key] = items as Array<string | number | boolean>;
            } else {
                query[key] = value;
            }
        }
        const configured = this.configuration.timeoutMs;
        const response = await this.request({
            path: sent,
            method: upper,
            headers,
            query,
            body: options.body,
            ...(sandboxDelete
                ? { maxRetries: 0, timeoutMs: configured > 0 ? Math.max(configured, SANDBOX_DELETE_TIMEOUT_MS) : configured }
                : {}),
        }, overrides);
        // Read from a copy, so the error below keeps a readable response.
        const text = await response.clone().text();
        if (!text) return undefined;
        try {
            return JSON.parse(text) as T;
        } catch {
            throw new ResponseError(response, `${upper} ${sent} answered ${response.status} with a body that is not JSON; send reads JSON only (the call itself succeeded; error.response still has the body)`);
        }
    }
}
