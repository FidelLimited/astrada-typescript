/* Hand-written (not generated): a transaction message's `dateTime`, which keeps what the API sent.
 *
 * Visa and Amex send UTC (`...Z`): an exact moment. Mastercard sends the merchant's local date and
 * time with no offset: a wall-clock time whose zone Astrada does not receive, so it is not an exact
 * moment. A Date cannot hold such a value without inventing a zone (JavaScript would use the host's),
 * so this type keeps the parts, the offset when there is one, and the raw string.
 *
 * A value in a form this SDK cannot read does not fail the response: it is kept in `raw`, `parsed`
 * is false, the parts are NaN, `offsetMinutes` and `toDate()` are null.
 * scripts/typed-dates.mjs makes TransactionMessage.dateTime this type at every generation.
 */

const PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:?\d{2})?$/;

export class TransactionDateTime {
    /** The value as the API sent it, such as `2026-01-01T10:00:00` or `2026-01-01T10:00:00Z`. */
    readonly raw: string;
    readonly year: number;
    /** 1 to 12. */
    readonly month: number;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    /** Minutes east of UTC (0 for `Z`), or null when the API sent no offset (Mastercard). */
    readonly offsetMinutes: number | null;
    /** False when the API sent a form this SDK cannot read; only `raw` holds it then. */
    readonly parsed: boolean;

    private constructor(raw: string, parts: number[], offsetMinutes: number | null, parsed = true) {
        this.raw = raw;
        [this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond] = parts;
        this.offsetMinutes = offsetMinutes;
        this.parsed = parsed;
    }

    /**
     * Reads an ISO 8601 date-time, with or without an offset. Throws RangeError for anything else,
     * an impossible date or time (`2026-02-30`, `25:00`) or offset included.
     */
    static parse(raw: string): TransactionDateTime {
        const m = typeof raw === 'string' ? PATTERN.exec(raw) : null;
        const fail = () => new RangeError(`Not an ISO 8601 date-time: ${JSON.stringify(raw)}`);
        if (!m) {
            throw fail();
        }
        const fraction = (m[7] ?? '').padEnd(3, '0').slice(0, 3);
        const parts = [m[1], m[2], m[3], m[4], m[5], m[6] ?? '0', fraction].map(Number);
        let offset: number | null = null;
        if (m[8] === 'Z') {
            offset = 0;
        } else if (m[8]) {
            const sign = m[8][0] === '-' ? -1 : 1;
            const digits = m[8].slice(1).replace(':', '');
            const hours = Number(digits.slice(0, 2));
            const minutes = Number(digits.slice(2, 4));
            if (hours > 18 || minutes > 59) {
                throw fail();
            }
            offset = sign * (hours * 60 + minutes);
        }
        const [year, month, day, hour, minute, second] = parts;
        const check = new Date(Date.UTC(year, month - 1, day));
        if (month < 1 || month > 12 || check.getUTCDate() !== day || check.getUTCMonth() !== month - 1
            || hour > 23 || minute > 59 || second > 59) {
            throw fail();
        }
        return new TransactionDateTime(raw, parts, offset);
    }

    /** True when the API sent an offset (Visa, Amex): the value is an exact moment. */
    get hasOffset(): boolean {
        return this.offsetMinutes !== null;
    }

    /**
     * The exact moment, or null when the API sent no offset (Mastercard local time). Use
     * `toDateAtOffset` if you know the merchant's offset, or show the local parts as they are.
     */
    toDate(): Date | null {
        return this.offsetMinutes === null ? null : this.toDateAtOffset(this.offsetMinutes);
    }

    /** The moment this wall-clock time is at the given offset (minutes east of UTC). Throws RangeError when `parsed` is false. */
    toDateAtOffset(offsetMinutes: number): Date {
        if (!this.parsed) {
            throw new RangeError(`Not an ISO 8601 date-time this SDK can read: ${JSON.stringify(this.raw)}`);
        }
        const utc = Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond);
        return new Date(utc - offsetMinutes * 60_000);
    }

    /** The raw string, so JSON.stringify writes back what the API sent. */
    toJSON(): string {
        return this.raw;
    }

    toString(): string {
        return this.raw;
    }

    /**
     * For the generated model: reads the JSON value. null and undefined pass through; a string this
     * SDK cannot read is kept in `raw` with `parsed` false, so one value never fails a response.
     */
    static fromJSON(value: null): null;
    static fromJSON(value: undefined): undefined;
    static fromJSON(value: unknown): TransactionDateTime;
    static fromJSON(value: unknown): TransactionDateTime | null | undefined {
        if (value instanceof TransactionDateTime) return value;
        if (value === null) return null;
        if (value === undefined) return undefined;
        try {
            return TransactionDateTime.parse(value as string);
        } catch {
            return new TransactionDateTime(String(value), [NaN, NaN, NaN, NaN, NaN, NaN, NaN], null, false);
        }
    }
}
