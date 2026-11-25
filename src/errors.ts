/* Hand-written (not generated): the errors the SDK throws.
 *
 * The main API and the Banking API share this module through src/runtime.ts, so one
 * `instanceof ResponseError` check covers both.
 *
 * An Astrada error response is a problem document (RFC 9457 style):
 *   { "title": "Conflict", "detail": "...", "code": "CARD_ENROLLMENT_OFF", "errors": [...] }
 * `title` and `detail` are always there; `code` and `errors` only on some responses. The Banking
 * API answers { "statusCode", "message", "code", "error" } and the token endpoint answers in the
 * OAuth2 shape ({ "error", "error_description" }); all three are read into the same fields.
 */

/** One entry of a problem's `errors` list, most often a field that failed validation. */
export interface ApiErrorItem {
    title?: string;
    detail?: string;
    /** Where the problem is, such as a JSON pointer to the field. */
    instance?: string;
    [key: string]: unknown;
}

/** The parsed error body. Fields the SDK does not know about are kept. */
export interface ApiErrorBody {
    type?: string;
    title?: string;
    detail?: string;
    instance?: string;
    code?: string;
    errors?: ApiErrorItem[];
    [key: string]: unknown;
}

/**
 * Thrown when the API answers with a status outside 200 to 299. Subclasses name the common cases,
 * so `catch (e) { if (e instanceof NotFoundError) ... }` works; every one of them is also a
 * `ResponseError`.
 */
export class ResponseError extends Error {
    override name: string = 'ResponseError';
    /** The HTTP status, such as 404. */
    readonly status: number;
    /** The problem's `title`, such as "Not Found". */
    readonly title?: string;
    /** The problem's `detail`: what went wrong, in words. */
    readonly detail?: string;
    /** A stable machine-readable code when the API sends one, such as `LINK_NAME_NOT_ALLOWED`. */
    readonly code?: string;
    /** Field-level problems, on validation errors. */
    readonly errors: ApiErrorItem[];
    /** The parsed body, or undefined when it was empty or not JSON. */
    readonly body?: ApiErrorBody;
    /** The response headers. */
    readonly headers: Headers;

    constructor(public response: Response, msg?: string, body?: ApiErrorBody) {
        super(msg ?? describe(response.status, body));
        this.status = response.status;
        this.body = body;
        this.title = body?.title;
        this.detail = body?.detail;
        this.code = body?.code;
        this.errors = Array.isArray(body?.errors) ? body!.errors : [];
        this.headers = response.headers;
    }
}

/** 400 or 422: the request was refused as invalid; see `errors` for the fields. */
export class ValidationError extends ResponseError {
    override name = 'ValidationError';
}

/** 401: the credentials were refused, or the token request failed. */
export class AuthenticationError extends ResponseError {
    override name = 'AuthenticationError';
}

/** 403: the token lacks the scope, or the resource is not this account's. */
export class PermissionDeniedError extends ResponseError {
    override name = 'PermissionDeniedError';
}

/**
 * 403 on an operation that needs a scope (`requiredScope`). The likely cause is that this API
 * client does not have the scope, but as with any PermissionDeniedError the resource may also not
 * be this account's. Also a PermissionDeniedError and a ResponseError.
 */
export class ScopeRequiredError extends PermissionDeniedError {
    override name = 'ScopeRequiredError';
    /** The scope the operation needs, such as `banking:admin`. */
    readonly requiredScope: string;

    constructor(response: Response, requiredScope: string, body?: ApiErrorBody) {
        super(
            response,
            `(403) This operation needs the \`${requiredScope}\` scope. The likely cause is that your API client `
                + 'does not have it; if so, ask Astrada to enable it. A 403 can also mean the resource is not '
                + "this account's."
                + (body?.detail ? ` (${body.detail})` : ''),
            body,
        );
        this.requiredScope = requiredScope;
    }
}

/** 404: no such resource for this account. */
export class NotFoundError extends ResponseError {
    override name = 'NotFoundError';
}

/** 409: the request conflicts with the resource's current state; `code` says which rule. */
export class ConflictError extends ResponseError {
    override name = 'ConflictError';
}

/** 429: too many requests. `retryAfterMs` is the wait the API asked for, when it sent one. */
export class RateLimitError extends ResponseError {
    override name = 'RateLimitError';
    get retryAfterMs(): number | undefined {
        return retryAfterMs(this.headers);
    }
}

/** 500 and above: a failure on Astrada's side. Safe to retry for reads. */
export class InternalServerError extends ResponseError {
    override name = 'InternalServerError';
}

/**
 * The request did not reach the API, no response came back (DNS, TLS, connection reset), or the
 * body of a 2xx answer could not be read whole (the connection dropped while it arrived).
 */
export class FetchError extends Error {
    override name: string = 'FetchError';
    constructor(public cause: Error, msg?: string) {
        super(msg ?? `The request failed: ${cause.message}`);
    }
}

/** No response, or not the whole body of a 2xx answer, within `timeoutMs`. */
export class TimeoutError extends FetchError {
    override name = 'TimeoutError';
    constructor(public readonly timeoutMs: number, cause?: Error) {
        super(cause ?? new Error('timeout'), `No response within ${timeoutMs} ms`);
    }
}

/** A required parameter was not given. Thrown before any request is sent. */
export class RequiredError extends Error {
    override name: 'RequiredError' = 'RequiredError';
    constructor(public field: string, msg?: string) {
        super(msg);
    }
}

function describe(status: number, body?: ApiErrorBody): string {
    const head = body?.title ? `${status} ${body.title}` : `HTTP ${status}`;
    const code = body?.code ? ` (${body.code})` : '';
    return body?.detail ? `${head}${code}: ${body.detail}` : `${head}${code}`;
}

/**
 * Reads the error body once; the response stays readable for the caller (`error.response`). A body
 * that cannot be read counts as no body, except a timeout or an abort of `signal` (the caller's),
 * which propagate.
 */
export async function readErrorBody(response: Response, signal?: AbortSignal | null): Promise<ApiErrorBody | undefined> {
    let text: string;
    try {
        text = await response.clone().text();
    } catch (e) {
        if (e instanceof TimeoutError || signal?.aborted) {
            throw e;
        }
        return undefined;
    }
    if (!text) {
        return undefined;
    }
    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch {
        // A gateway error page or other non-JSON body: keep a short excerpt as the detail.
        return { detail: text.slice(0, 200) };
    }
    if (json === null || typeof json !== 'object' || Array.isArray(json)) {
        return undefined;
    }
    const body = { ...(json as ApiErrorBody) };
    const other = json as { error?: unknown; error_description?: unknown; message?: unknown; statusCode?: unknown };
    if (typeof other.message === 'string' || typeof other.statusCode === 'number') {
        // The Banking API shape: { statusCode, message, code?, error? (the status name), reason?, errors? }.
        if (body.detail === undefined && typeof other.message === 'string') body.detail = other.message;
        if (body.title === undefined && typeof other.error === 'string') body.title = other.error;
    } else {
        // The OAuth2 token endpoint shape: { error, error_description }.
        if (body.code === undefined && typeof other.error === 'string') body.code = other.error;
        if (body.detail === undefined && typeof other.error_description === 'string') body.detail = other.error_description;
    }
    return body;
}

/** Builds the error subclass for a status. */
export async function errorFromResponse(response: Response, prefix?: string, signal?: AbortSignal | null): Promise<ResponseError> {
    const body = await readErrorBody(response, signal);
    const message = prefix ? `${prefix}: ${describe(response.status, body)}` : undefined;
    const status = response.status;
    const Type =
        status === 400 || status === 422 ? ValidationError
        : status === 401 ? AuthenticationError
        : status === 403 ? PermissionDeniedError
        : status === 404 ? NotFoundError
        : status === 409 ? ConflictError
        : status === 429 ? RateLimitError
        : status >= 500 ? InternalServerError
        : ResponseError;
    return new Type(response, message, body);
}

/** The `Retry-After` header in milliseconds (seconds or an HTTP date), or undefined. */
export function retryAfterMs(headers: Headers): number | undefined {
    const value = headers.get('retry-after');
    if (value === null || value.trim() === '') {
        return undefined;
    }
    const seconds = Number(value);
    if (Number.isFinite(seconds)) {
        return Math.max(0, seconds * 1000);
    }
    const date = Date.parse(value);
    return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

/**
 * A `sandbox` module call outside the sandbox. Thrown before any request (the login included),
 * unless the configuration's environment is 'sandbox' and its base URL is the sandbox API host
 * (or a custom basePath marked with basePathIsSandbox).
 */
export class SandboxOnlyError extends Error {
    override name: 'SandboxOnlyError' = 'SandboxOnlyError';
}

/**
 * mintSdkAccessToken's token carries scopes outside `allowedScopes`, or the login did not say which
 * scopes it carries: a problem in the SDK client's setup on Astrada's side, not in the call. The
 * token is not returned. `extraScopes` lists the extra ones (empty when the login stated none).
 */
export class UnexpectedScopesError extends Error {
    override name: 'UnexpectedScopesError' = 'UnexpectedScopesError';
    constructor(readonly extraScopes: string[], message: string) {
        super(message);
    }
}
