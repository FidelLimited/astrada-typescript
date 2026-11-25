/* Hand-written (not generated): typed webhook events.
 *
 * The event type comes from the `webhook-event-type` header; the body is the resource itself.
 * Where the API reference says a payload is the same as an API resource, the event's `data` is
 * that generated model (with dates parsed):
 *   transactionmessage.created            TransactionMessage (GET /transaction-messages/{id})
 *   transaction.created, transaction.updated  Transaction (GET /transactions/{id}), plus the
 *                                         `_embedded.messages` the webhook carries
 * Every other event type has `data` as the parsed JSON object. The list of event types is the
 * generated `WebhookCreateParamsEventTypesEnum`, so it follows the spec on each regeneration.
 */
import { verifyWebhook, WebhookPayloadError, WebhookVerificationError, type WebhookHeaders, type VerifyWebhookOptions } from './webhooks.js';
import {
    TransactionFromJSON,
    TransactionMessageFromJSON,
    instanceOfTransaction,
    instanceOfTransactionMessage,
    WebhookCreateParamsEventTypesEnum,
    type Transaction,
    type TransactionEmbedded,
    type TransactionMessage,
} from './models/index.js';
import { TransactionDateTime } from './transaction-date-time.js';

/**
 * A transaction message as a transaction webhook carries it under `_embedded.messages`: a projection
 * of the message (its id, type, result, `dateTime` and a few references), not the whole resource.
 * `dateTime` is a TransactionDateTime, as on TransactionMessage; other fields are kept as sent.
 */
export interface TransactionWebhookMessage {
    id?: string;
    messageType?: string;
    network?: string;
    result?: string;
    approvalCode?: string;
    transactionReference?: string;
    dateTime?: TransactionDateTime;
    _links?: { [key: string]: unknown };
    [key: string]: unknown;
}

/** A transaction webhook's data: the Transaction resource, plus the messages the webhook embeds. */
export interface TransactionWebhookData extends Transaction {
    _embedded?: TransactionEmbedded & { messages?: TransactionWebhookMessage[] };
}

/** The Transaction model, keeping `_embedded.messages` (the model has no such field). */
function transactionWithMessages(json: unknown): TransactionWebhookData {
    const transaction = TransactionFromJSON(json) as TransactionWebhookData;
    const messages = (json as { _embedded?: { messages?: unknown } })._embedded?.messages;
    if (Array.isArray(messages)) {
        transaction._embedded = {
            ...(transaction._embedded ?? {}),
            messages: messages.map((message) => {
                const m = message as { [key: string]: unknown };
                return m && typeof m === 'object' && typeof m.dateTime === 'string'
                    ? { ...m, dateTime: TransactionDateTime.fromJSON(m.dateTime) }
                    : (m as TransactionWebhookMessage);
            }),
        };
    }
    return transaction;
}

/** Every event type a webhook can subscribe to. */
export const WebhookEventType = WebhookCreateParamsEventTypesEnum;
export type WebhookEventType = WebhookCreateParamsEventTypesEnum;

/** The `data` type of each event type that has a model. */
export interface WebhookEventPayloads {
    'transactionmessage.created': TransactionMessage;
    'transaction.created': TransactionWebhookData;
    'transaction.updated': TransactionWebhookData;
}

type ModelledEventType = keyof WebhookEventPayloads;

export interface WebhookEventBase<T extends string, D> {
    /** The event type, from the `webhook-event-type` header. */
    type: T;
    /** The delivery id (`webhook-id`). The same event retried keeps its id: use it to skip duplicates. */
    id: string;
    /** When the delivery was sent (`webhook-timestamp`). */
    timestamp: Date;
    data: D;
}

/**
 * A verified webhook delivery. Narrow it on `type`:
 * `if (event.type === 'transaction.created') { event.data.status }`.
 * An event type newer than this SDK arrives with its `type` as sent and `data` as parsed JSON.
 */
export type WebhookEvent =
    | { [K in ModelledEventType]: WebhookEventBase<K, WebhookEventPayloads[K]> }[ModelledEventType]
    | WebhookEventBase<Exclude<WebhookEventType, ModelledEventType>, Record<string, unknown>>;

function header(headers: WebhookHeaders, name: string): string | undefined {
    if (typeof (headers as { get?: unknown }).get === 'function') {
        return (headers as { get(name: string): string | null }).get(name) ?? undefined;
    }
    const record = headers as Record<string, string | string[] | undefined>;
    const key = Object.keys(record).find((k) => k.toLowerCase() === name);
    const value = key === undefined ? undefined : record[key];
    return Array.isArray(value) ? value[0] : value;
}

/** The fields each typed payload needs (the generated instanceOf checks of its required fields). */
const shapes: { [K in ModelledEventType]: (value: object) => boolean } = {
    'transactionmessage.created': instanceOfTransactionMessage,
    'transaction.created': instanceOfTransaction,
    'transaction.updated': instanceOfTransaction,
};

const converters: { [K in ModelledEventType]: (json: unknown) => WebhookEventPayloads[K] } = {
    'transactionmessage.created': TransactionMessageFromJSON,
    'transaction.created': transactionWithMessages,
    'transaction.updated': transactionWithMessages,
};

/**
 * Verifies a webhook delivery (as `verifyWebhook` does) and returns it as a typed event.
 *
 * The signature covers the delivery id, the timestamp and the body, not the `webhook-event-type`
 * header that `type` comes from. Trust `data` (signed); treat `type` as a routing hint, and when the
 * difference matters, check that `data` has the shape you expect (for example its `_links.self`).
 *
 * @throws WebhookVerificationError if the signature or timestamp is refused, or the
 *   `webhook-event-type` header is missing
 * @throws WebhookPayloadError (a WebhookVerificationError) if the body is signed but is not JSON,
 *   not an object, or lacks a field its event type's payload requires
 * @throws RangeError for a configuration mistake (see `verifyWebhook`)
 */
export function constructWebhookEvent(
    payload: string | Uint8Array,
    headers: WebhookHeaders,
    secret: string,
    options: VerifyWebhookOptions = {},
): WebhookEvent {
    const json = verifyWebhook<Record<string, unknown>>(payload, headers, secret, options);
    const type = header(headers, 'webhook-event-type');
    if (!type) {
        throw new WebhookVerificationError('Missing webhook-event-type header');
    }
    const id = (header(headers, 'webhook-id') ?? header(headers, 'svix-id'))!;
    const timestamp = new Date(Number(header(headers, 'webhook-timestamp') ?? header(headers, 'svix-timestamp')) * 1000);
    return eventFromVerifiedBody(json, type, id, timestamp);
}

/**
 * A delivery your server verified earlier and stored, read again: for replaying an event this SDK
 * could not read when it arrived (a WebhookPayloadError), after you update the SDK. It checks no
 * signature, so pass only what you stored after a successful check (constructWebhookEvent or
 * verifyWebhook), never a body from a request; keep that record of the check with the body.
 *
 * @param stored the raw body as received (a string or bytes), and the delivery's `webhook-event-type`,
 *   `webhook-id` and `webhook-timestamp` (Unix seconds as a number or an all-digit string, a Date, or
 *   an ISO 8601 string with Z or an offset) as stored
 * @throws RangeError when `type` or `id` is empty, the timestamp is not valid, or the body is neither
 *   a string nor bytes
 * @throws WebhookPayloadError when the body is not JSON or not the shape this SDK knows for its type
 */
export function parseStoredWebhookEvent(stored: { body: string | Uint8Array; type: string; id: string; timestamp: number | Date | string }): WebhookEvent {
    if (typeof stored?.type !== 'string' || stored.type.trim() === '') {
        // constructWebhookEvent refuses a delivery without the header, so only a body that was not JSON
        // can be stored without one; it has no event to rebuild.
        throw new RangeError('parseStoredWebhookEvent needs the stored webhook-event-type; a row stored without one cannot be replayed (read its body yourself)');
    }
    if (typeof stored.id !== 'string' || stored.id.trim() === '') {
        throw new RangeError('parseStoredWebhookEvent needs the stored webhook-id (id is empty)');
    }
    const timestamp = storedTimestamp(stored.timestamp);
    if (typeof stored.body !== 'string' && !(stored.body instanceof Uint8Array)) {
        throw new RangeError('parseStoredWebhookEvent needs the stored body as a string or bytes');
    }
    const text = typeof stored.body === 'string' ? stored.body : new TextDecoder().decode(stored.body);
    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch (e) {
        throw new WebhookPayloadError(`The stored ${stored.type} delivery ${stored.id} is not JSON`, { cause: e });
    }
    return eventFromVerifiedBody(json, stored.type, stored.id, timestamp, 'stored');
}

/** Unix seconds up to this (year 5138) are read as seconds; a larger number is likely milliseconds. */
const MAX_UNIX_SECONDS = 1e11;
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * The shared rule for a stored webhook timestamp: Unix seconds as a number or an all-digit string
 * (the webhook-timestamp header's own form), a Date, or an ISO 8601 string with Z or an offset. A
 * string without an offset would be read in the host's time zone, and milliseconds would land
 * thousands of years ahead, so both are refused.
 */
function storedTimestamp(value: unknown): Date {
    const refuse = () => new RangeError('parseStoredWebhookEvent needs a valid timestamp: Unix seconds (a number or an all-digit string), a Date, or an ISO 8601 string with Z or an offset');
    let date: Date;
    if (value instanceof Date) {
        date = value;
    } else if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
        const seconds = Number(value);
        if (!Number.isFinite(seconds) || seconds < 0 || seconds > MAX_UNIX_SECONDS) throw refuse();
        date = new Date(seconds * 1000);
    } else if (typeof value === 'string' && ISO_WITH_OFFSET.test(value)) {
        date = new Date(value);
    } else {
        throw refuse();
    }
    if (Number.isNaN(date.getTime())) throw refuse();
    return date;
}

/** The event for a body whose signature was already checked. */
function eventFromVerifiedBody(json: unknown, type: string, id: string, timestamp: Date, source: 'signed' | 'stored' = 'signed'): WebhookEvent {
    if (!Object.prototype.hasOwnProperty.call(converters, type)) {
        return { type, id, timestamp, data: json } as WebhookEvent;
    }
    const modelled = type as ModelledEventType;
    const notThisEvent = (detail: string, cause?: unknown) =>
        new WebhookPayloadError(source === 'signed'
            ? `The ${type} delivery ${id} is signed but its body is not a ${type} event: ${detail}`
            : `The stored ${type} delivery ${id} is not a ${type} event: ${detail}`, { cause });
    if (json === null || typeof json !== 'object' || Array.isArray(json)) {
        throw notThisEvent(`the body is ${json === null ? 'null' : Array.isArray(json) ? 'an array' : typeof json}, not an object`);
    }
    if (!shapes[modelled](json)) {
        throw notThisEvent('a field the event needs is missing');
    }
    let data: unknown;
    try {
        data = converters[modelled](json);
    } catch (e) {
        throw notThisEvent(e instanceof Error ? e.message : String(e), e);
    }
    return { type, id, timestamp, data } as WebhookEvent;
}
