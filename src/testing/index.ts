/* Hand-written (not generated): @astrada.co/ts-astrada-sdk/testing, a fake fetch for your tests.
 *
 * createMockFetch() answers every operation of the API (main, Banking and sandbox) with the
 * example from the API definition (src/testing/examples.ts, regenerated with the SDK), and answers
 * the login with a fake token. Override any operation by its SDK method name.
 */
import { operations, type MockOperation } from './examples.js';

export type { MockOperation } from './examples.js';

/** The request a mock answer is for. */
export interface MockRequest {
    /** The SDK method name, such as `listSubaccounts`. */
    operationId: string;
    method: string;
    url: URL;
    /** Path parameters by name, such as `{ subaccountId: '...' }`. */
    params: Record<string, string>;
    headers: Headers;
    /** The JSON body, parsed, or undefined. */
    body: unknown;
}

/** A mock answer. `body` is sent as JSON; leave it out for an empty body. */
export interface MockAnswer {
    status?: number;
    body?: unknown;
    headers?: Record<string, string>;
}

export type MockHandler = MockAnswer | ((request: MockRequest) => MockAnswer | Promise<MockAnswer>);

export interface MockFetchOptions {
    /**
     * Answers by SDK method name, in place of the example: `{ getSubaccount: { status: 404, body: {...} } }`.
     * An answer without `status` gets the operation's own success status (200, 201 or 202).
     */
    overrides?: Record<string, MockHandler>;
    /** The configuration's basePath when it has a path, such as `http://localhost:4010/astrada`: that path is stripped before matching. */
    basePath?: string;
}

/** A fetch function that also records what it was asked. */
export interface MockFetch {
    (input: string | URL | Request, init?: RequestInit): Promise<Response>;
    /** Every request answered so far, the login included (operationId `login`). */
    readonly calls: MockRequest[];
}

const TOKEN = /\/auth\/realms\/[^/]+\/protocol\/openid-connect\/token$/;

interface Route {
    operation: MockOperation;
    pattern: RegExp;
    names: string[];
}

const routes: Route[] = operations.map((operation) => {
    const names: string[] = [];
    const source = operation.path.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{([^}]+)\}/g, (_, name: string) => {
        names.push(name);
        return '([^/]+)';
    });
    return { operation, pattern: new RegExp(`^${source}$`), names };
});

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
    if (body === undefined || status === 204) {
        return new Response(null, { status, headers });
    }
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

/**
 * Makes a fake fetch for `new Configuration({ ..., fetchApi: createMockFetch() })`. Nothing leaves
 * the process. An unknown route answers 404 with a problem body.
 */
export function createMockFetch(options: MockFetchOptions = {}): MockFetch {
    const calls: MockRequest[] = [];
    const overrides = options.overrides ?? {};
    const prefix = options.basePath ? new URL(options.basePath).pathname.replace(/\/+$/, '') : '';
    for (const name of Object.keys(overrides)) {
        if (!operations.some((o) => o.operationId === name)) {
            throw new RangeError(`createMockFetch: no operation named ${name}`);
        }
    }

    const mock = async (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
        // Like fetch: an aborted signal (the caller's, or the SDK's timeout) rejects with its reason.
        if (init.signal?.aborted) {
            throw init.signal.reason;
        }
        const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
        const pathname = prefix && url.pathname.startsWith(prefix + '/') ? url.pathname.slice(prefix.length) : url.pathname;
        const method = (init.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
        const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined));
        let body: unknown;
        if (typeof init.body === 'string' && init.body !== '') {
            try {
                body = JSON.parse(init.body);
            } catch {
                body = init.body;
            }
        }

        if (method === 'POST' && TOKEN.test(pathname)) {
            calls.push({ operationId: 'login', method, url, params: {}, headers, body });
            return json(200, { access_token: 'mock-access-token', token_type: 'Bearer', expires_in: 300 });
        }

        for (const route of routes) {
            if (route.operation.method !== method) continue;
            const match = route.pattern.exec(pathname);
            if (!match) continue;
            const params: Record<string, string> = {};
            route.names.forEach((name, i) => (params[name] = decodeURIComponent(match[i + 1])));
            const request: MockRequest = { operationId: route.operation.operationId, method, url, params, headers, body };
            calls.push(request);
            const override = overrides[route.operation.operationId];
            if (override !== undefined) {
                const answer = typeof override === 'function' ? await override(request) : override;
                return json(answer.status ?? route.operation.status, answer.body, answer.headers);
            }
            return json(route.operation.status, route.operation.body);
        }

        calls.push({ operationId: 'unknown', method, url, params: {}, headers, body });
        return json(404, { title: 'Not Found', detail: `The mock has no operation for ${method} ${pathname}` });
    };
    return Object.assign(mock, { calls }) as MockFetch;
}

/** Every operation the mock knows, with its example. */
export function mockOperations(): ReadonlyArray<MockOperation> {
    return operations;
}
