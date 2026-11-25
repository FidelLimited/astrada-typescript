/* Hand-written (not generated): checks that a webhook came from Astrada.
 *
 * Astrada delivers webhooks through Svix. Each delivery carries `webhook-id`, `webhook-timestamp`
 * and `webhook-signature` headers (Svix also sends the same values as `svix-id`, `svix-timestamp`
 * and `svix-signature`). The signature is `v1,` + base64(HMAC-SHA256(key, `${id}.${timestamp}.${body}`)),
 * where the key is the base64-decoded webhook secret returned once by `POST /webhooks`.
 */
import { createHmac, timingSafeEqual } from 'crypto';

export class WebhookVerificationError extends Error {
    override name: string = 'WebhookVerificationError';
}

/**
 * The delivery is signed, but its body does not have the shape of its event type (a field the typed
 * payload needs is missing). Also a WebhookVerificationError, so one catch covers both.
 */
export class WebhookPayloadError extends WebhookVerificationError {
    override name = 'WebhookPayloadError';
    /** What made the body unreadable, when something threw (a JSON or model error). */
    readonly cause?: unknown;

    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        if (options && options.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}

export type WebhookHeaders =
    | Record<string, string | string[] | undefined>
    | { get(name: string): string | null };

export interface VerifyWebhookOptions {
    /** Largest accepted difference between the delivery time and now, in seconds. Default 300. */
    toleranceSeconds?: number;
    /** The current time; for tests. */
    now?: Date;
}

function header(headers: WebhookHeaders, name: string): string | undefined {
    if (typeof (headers as { get?: unknown }).get === 'function') {
        return (headers as { get(name: string): string | null }).get(name) ?? undefined;
    }
    const record = headers as Record<string, string | string[] | undefined>;
    const key = Object.keys(record).find((k) => k.toLowerCase() === name);
    const value = key === undefined ? undefined : record[key];
    return Array.isArray(value) ? value[0] : value;
}

// Standard base64, padding optional. Buffer.from(…, 'base64') skips characters outside the
// alphabet instead of failing, so a mistyped secret is caught here rather than reported later as
// a signature mismatch.
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

function secretKey(secret: string): Buffer {
    if (typeof secret !== 'string' || secret === '') {
        // Most often an unset environment variable.
        throw new RangeError('The webhook secret is missing');
    }
    const base64 = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
    if (!BASE64.test(base64) || base64.replace(/=+$/, '').length % 4 === 1) {
        // A configuration mistake, not a forged delivery: a different error so it is not answered as one.
        throw new RangeError('The webhook secret is empty or not base64');
    }
    return Buffer.from(base64, 'base64');
}

/**
 * Checks the signature and age of a webhook delivery and returns the parsed body.
 * Throws WebhookVerificationError when the delivery must be rejected.
 *
 * @throws WebhookVerificationError if the signature does not match or the delivery is too old or too new
 * @throws RangeError for a configuration mistake: a missing or non-base64 secret, or an invalid toleranceSeconds
 *
 * @param payload the raw request body, exactly as received (do not parse and re-serialise it),
 *   as a string or as bytes (a Node.js Buffer is a Uint8Array, so it can be passed as is)
 * @param headers the request headers
 * @param secret the webhook's `secret`, as returned when the webhook was created
 */
export function verifyWebhook<T = unknown>(
    payload: string | Uint8Array,
    headers: WebhookHeaders,
    secret: string,
    options: VerifyWebhookOptions = {},
): T {
    const id = header(headers, 'webhook-id') ?? header(headers, 'svix-id');
    const timestamp = header(headers, 'webhook-timestamp') ?? header(headers, 'svix-timestamp');
    const signatures = header(headers, 'webhook-signature') ?? header(headers, 'svix-signature');
    if (!id || !timestamp || !signatures) {
        throw new WebhookVerificationError('Missing webhook-id, webhook-timestamp or webhook-signature header');
    }

    const sentAt = Number(timestamp);
    if (!Number.isInteger(sentAt)) {
        throw new WebhookVerificationError('Invalid webhook-timestamp header');
    }
    const now = Math.floor((options.now ?? new Date()).getTime() / 1000);
    const tolerance = options.toleranceSeconds ?? 300;
    // An infinite tolerance would turn off replay protection, and NaN or a negative value would reject
    // every delivery: all are configuration mistakes, so they get a RangeError, not a verification error.
    if (!Number.isFinite(tolerance) || tolerance < 0) {
        throw new RangeError('toleranceSeconds must be a finite number of seconds, 0 or more');
    }
    // A range check, not Math.abs(now - sentAt): no subtraction that an extreme timestamp could
    // push past the float range.
    if (!(sentAt >= now - tolerance && sentAt <= now + tolerance)) {
        throw new WebhookVerificationError('The webhook timestamp is outside the accepted window');
    }

    const body = typeof payload === 'string' ? payload : new TextDecoder('utf-8', { ignoreBOM: true }).decode(payload);
    const expected = createHmac('sha256', secretKey(secret))
        .update(`${id}.${timestamp}.${body}`)
        .digest();

    // The header can hold several space-separated `v1,<signature>` entries (during secret rotation).
    const matches = signatures.split(' ').some((entry) => {
        const [version, signature] = entry.split(',', 2);
        if (version !== 'v1' || !signature) {
            return false;
        }
        const received = Buffer.from(signature, 'base64');
        return received.length === expected.length && timingSafeEqual(received, expected);
    });
    if (!matches) {
        throw new WebhookVerificationError('No matching webhook signature');
    }

    try {
        return JSON.parse(body) as T;
    } catch (e) {
        throw new WebhookPayloadError('The delivery is signed but its body is not JSON', { cause: e });
    }
}
